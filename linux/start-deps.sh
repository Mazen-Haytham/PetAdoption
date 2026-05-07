#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
CONTAINER_NAME="mssql"
REDIS_CONTAINER_NAME="redis"
MSSQL_PORT="${MSSQL_PORT:-1433}"
REDIS_PORT="${REDIS_PORT:-6379}"
MSSQL_DATA_VOLUME="${MSSQL_DATA_VOLUME:-mssql_data}"
MSSQL_SA_PASSWORD="${MSSQL_SA_PASSWORD:-StrongPassword123!}"
RESET_CONTAINER=0

if [ "${1:-}" = "--help" ]; then
  echo "Usage: ./start-sql.sh [--reset]"
  echo "  --reset   Recreate containers and remove '${MSSQL_DATA_VOLUME}' volume."
  echo ""
  echo "Environment overrides:"
  echo "  MSSQL_SA_PASSWORD   SA password used when creating and validating SQL Server."
  echo "  MSSQL_PORT          Host port to bind to container 1433 (default: 1433)."
  echo "  MSSQL_DATA_VOLUME   Docker volume name for /var/opt/mssql (default: mssql_data)."
  echo "  REDIS_PORT          Host port to bind to Redis container (default: 6379)."
  exit 0
fi

if [ "${1:-}" = "--reset" ]; then
  RESET_CONTAINER=1
fi

echo -e "${BLUE}🐾 Starting MSSQL Server and Redis...${NC}"
echo ""

# Ensure Docker is running
echo -e "${BLUE}Step 1: Ensuring Docker is running${NC}"
if docker info > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Docker daemon is accessible${NC}"
else
  echo -e "${YELLOW}⚠ Docker is not accessible — attempting to start with sudo${NC}"
  sudo systemctl enable docker --quiet
  sudo systemctl start docker
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is still not accessible. Ensure your user is in the docker group or rerun with sudo.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Docker is running${NC}"
fi
echo ""

# ── MSSQL ────────────────────────────────────────────────────────────────────

echo -e "${BLUE}Step 2: Checking for existing MSSQL container${NC}"

if [ "${RESET_CONTAINER}" -eq 1 ]; then
  echo -e "${YELLOW}⚠ Reset requested — removing existing container and volume${NC}"
  if docker ps -aq --filter "name=^${CONTAINER_NAME}$" | grep -q .; then
    docker rm -f "${CONTAINER_NAME}" > /dev/null
    echo -e "${GREEN}✓ Removed container '${CONTAINER_NAME}'${NC}"
  fi

  if docker volume ls -q --filter "name=^${MSSQL_DATA_VOLUME}$" | grep -q .; then
    docker volume rm "${MSSQL_DATA_VOLUME}" > /dev/null
    echo -e "${GREEN}✓ Removed volume '${MSSQL_DATA_VOLUME}'${NC}"
  fi
fi

if docker ps -q --filter "name=^${CONTAINER_NAME}$" | grep -q .; then
  echo -e "${GREEN}✓ Container '${CONTAINER_NAME}' is already running${NC}"
elif docker ps -aq --filter "name=^${CONTAINER_NAME}$" | grep -q .; then
  echo -e "${YELLOW}⚠ Container '${CONTAINER_NAME}' exists but is stopped — restarting it${NC}"
  if ! docker start "${CONTAINER_NAME}" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Restart failed (stale shim) — removing and recreating container${NC}"
    docker rm -f "${CONTAINER_NAME}" > /dev/null
    docker run \
      -e "ACCEPT_EULA=Y" \
      -e "MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}" \
      -p "${MSSQL_PORT}:1433" \
      -v "${MSSQL_DATA_VOLUME}:/var/opt/mssql" \
      --name "${CONTAINER_NAME}" \
      -d mcr.microsoft.com/mssql/server:2022-latest
    echo -e "${GREEN}✓ Container recreated${NC}"
  else
    echo -e "${GREEN}✓ Container restarted${NC}"
  fi
else
  echo -e "${BLUE}No existing container found — creating a new one${NC}"
  docker run \
    -e "ACCEPT_EULA=Y" \
    -e "MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}" \
    -p "${MSSQL_PORT}:1433" \
    -v "${MSSQL_DATA_VOLUME}:/var/opt/mssql" \
    --name "${CONTAINER_NAME}" \
    -d mcr.microsoft.com/mssql/server:2022-latest
fi

echo ""

# Wait for SQL Server to be ready
echo -e "${BLUE}Step 3: Waiting for SQL Server to be ready${NC}"
MAX_ATTEMPTS=30
ATTEMPT=1
until docker exec "${CONTAINER_NAME}" bash -c \
    "cat /dev/null > /dev/tcp/localhost/1433" > /dev/null 2>&1; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo -e "${RED}✗ SQL Server did not become ready in time. Check logs:${NC}"
    echo "  docker logs ${CONTAINER_NAME}"
    exit 1
  fi
  echo -e "  Attempt $ATTEMPT/$MAX_ATTEMPTS — not ready yet, retrying in 2s..."
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done
echo -e "${GREEN}✓ SQL Server is ready and accepting connections${NC}"
echo ""

echo -e "${BLUE}Step 4: Verifying SA login credentials${NC}"
if docker exec "${CONTAINER_NAME}" test -x /opt/mssql-tools18/bin/sqlcmd; then
  SQLCMD_BIN="/opt/mssql-tools18/bin/sqlcmd"
elif docker exec "${CONTAINER_NAME}" test -x /opt/mssql-tools/bin/sqlcmd; then
  SQLCMD_BIN="/opt/mssql-tools/bin/sqlcmd"
else
  echo -e "${RED}✗ sqlcmd was not found in the container.${NC}"
  exit 1
fi

MAX_LOGIN_ATTEMPTS=20
LOGIN_ATTEMPT=1
until docker exec "${CONTAINER_NAME}" "${SQLCMD_BIN}" \
  -S localhost -U sa -P "${MSSQL_SA_PASSWORD}" -C -Q "SELECT 1" > /dev/null 2>&1; do
  if [ "$LOGIN_ATTEMPT" -ge "$MAX_LOGIN_ATTEMPTS" ]; then
    echo -e "${RED}✗ SA login failed with the configured password.${NC}"
    echo -e "${YELLOW}This usually means '${MSSQL_DATA_VOLUME}' already contains a different SA password.${NC}"
    echo "To recreate from scratch, run:"
    echo "  ./start-sql.sh --reset"
    echo ""
    echo "Or login with your old SA password and run:"
    echo "  ALTER LOGIN sa WITH PASSWORD = '${MSSQL_SA_PASSWORD}';"
    exit 1
  fi

  echo -e "  Login check $LOGIN_ATTEMPT/$MAX_LOGIN_ATTEMPTS — retrying in 2s..."
  sleep 2
  LOGIN_ATTEMPT=$((LOGIN_ATTEMPT + 1))
done
echo -e "${GREEN}✓ SA login validated${NC}"
echo ""

# ── REDIS ─────────────────────────────────────────────────────────────────────

echo -e "${BLUE}Step 5: Checking for existing Redis container${NC}"

if [ "${RESET_CONTAINER}" -eq 1 ]; then
  if docker ps -aq --filter "name=^${REDIS_CONTAINER_NAME}$" | grep -q .; then
    docker rm -f "${REDIS_CONTAINER_NAME}" > /dev/null
    echo -e "${GREEN}✓ Removed container '${REDIS_CONTAINER_NAME}'${NC}"
  fi
fi

if docker ps -q --filter "name=^${REDIS_CONTAINER_NAME}$" | grep -q .; then
  echo -e "${GREEN}✓ Container '${REDIS_CONTAINER_NAME}' is already running${NC}"
elif docker ps -aq --filter "name=^${REDIS_CONTAINER_NAME}$" | grep -q .; then
  echo -e "${YELLOW}⚠ Container '${REDIS_CONTAINER_NAME}' exists but is stopped — restarting it${NC}"
  if ! docker start "${REDIS_CONTAINER_NAME}" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Restart failed (stale shim) — removing and recreating container${NC}"
    docker rm -f "${REDIS_CONTAINER_NAME}" > /dev/null
    docker run \
      -p "${REDIS_PORT}:6379" \
      --name "${REDIS_CONTAINER_NAME}" \
      -d redis:7-alpine
    echo -e "${GREEN}✓ Container recreated${NC}"
  else
    echo -e "${GREEN}✓ Container restarted${NC}"
  fi
else
  echo -e "${BLUE}No existing Redis container found — creating a new one${NC}"
  docker run \
    -p "${REDIS_PORT}:6379" \
    --name "${REDIS_CONTAINER_NAME}" \
    -d redis:7-alpine
fi

echo ""

echo -e "${BLUE}Step 6: Waiting for Redis to be ready${NC}"
MAX_REDIS_ATTEMPTS=15
REDIS_ATTEMPT=1
until docker exec "${REDIS_CONTAINER_NAME}" redis-cli ping 2>/dev/null | grep -q "PONG"; do
  if [ "$REDIS_ATTEMPT" -ge "$MAX_REDIS_ATTEMPTS" ]; then
    echo -e "${RED}✗ Redis did not become ready in time. Check logs:${NC}"
    echo "  docker logs ${REDIS_CONTAINER_NAME}"
    exit 1
  fi
  echo -e "  Attempt $REDIS_ATTEMPT/$MAX_REDIS_ATTEMPTS — not ready yet, retrying in 2s..."
  sleep 2
  REDIS_ATTEMPT=$((REDIS_ATTEMPT + 1))
done
echo -e "${GREEN}✓ Redis is ready and accepting connections${NC}"
echo ""

# ── Summary ───────────────────────────────────────────────────────────────────

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 All services are up!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}MSSQL Server${NC}"
echo "  Host:     localhost,${MSSQL_PORT}"
echo "  User:     SA"
echo "  Password: ${MSSQL_SA_PASSWORD}"
echo ""
echo -e "${BLUE}Redis${NC}"
echo "  Host:     localhost:${REDIS_PORT}"
echo "  Auth:     none"
echo ""
echo "Useful commands:"
echo -e "  ${BLUE}MSSQL logs${NC}:  docker logs -f ${CONTAINER_NAME}"
echo -e "  ${BLUE}MSSQL stop${NC}:  docker stop ${CONTAINER_NAME}"
echo -e "  ${BLUE}MSSQL shell${NC}: docker exec -it ${CONTAINER_NAME} bash"
echo -e "  ${BLUE}Redis logs${NC}:  docker logs -f ${REDIS_CONTAINER_NAME}"
echo -e "  ${BLUE}Redis stop${NC}:  docker stop ${REDIS_CONTAINER_NAME}"
echo -e "  ${BLUE}Redis CLI${NC}:   docker exec -it ${REDIS_CONTAINER_NAME} redis-cli"