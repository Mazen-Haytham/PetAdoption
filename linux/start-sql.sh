#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
CONTAINER_NAME="mssql"
MSSQL_PORT="${MSSQL_PORT:-1433}"
MSSQL_DATA_VOLUME="${MSSQL_DATA_VOLUME:-mssql_data}"
MSSQL_SA_PASSWORD="${MSSQL_SA_PASSWORD:-StrongPassword123!}"
RESET_CONTAINER=0

if [ "${1:-}" = "--help" ]; then
  echo "Usage: ./start-sql.sh [--reset]"
  echo "  --reset   Recreate container and remove '${MSSQL_DATA_VOLUME}' volume."
  echo ""
  echo "Environment overrides:"
  echo "  MSSQL_SA_PASSWORD   SA password used when creating and validating SQL Server."
  echo "  MSSQL_PORT          Host port to bind to container 1433 (default: 1433)."
  echo "  MSSQL_DATA_VOLUME   Docker volume name for /var/opt/mssql (default: mssql_data)."
  exit 0
fi

if [ "${1:-}" = "--reset" ]; then
  RESET_CONTAINER=1
fi

echo -e "${BLUE}🐾 Starting MSSQL Server...${NC}"
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

# Check if container already exists
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
  docker start "${CONTAINER_NAME}"
  echo -e "${GREEN}✓ Container restarted${NC}"
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

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 MSSQL Server is up!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  Host:     localhost,${MSSQL_PORT}"
echo "  User:     SA"
echo "  Password: ${MSSQL_SA_PASSWORD}"
echo ""
echo "Useful commands:"
echo -e "  ${BLUE}Logs${NC}:    docker logs -f ${CONTAINER_NAME}"
echo -e "  ${BLUE}Stop${NC}:    docker stop ${CONTAINER_NAME}"
echo -e "  ${BLUE}Shell${NC}:   docker exec -it ${CONTAINER_NAME} bash"