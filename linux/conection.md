Use these connection instructions:
1. Start SQL Server container from the project:
    * cd Programming/PetAdoption
    * ./start-sql.sh
    * If you want a clean DB (deletes existing SQL data): ./start-sql.sh --reset
2. Connect to MSSQL with these values:
    * Server/Host: localhost,1433
    * Username: SA
    * Password: StrongPassword123!
    * Database: PetAdoptionDb
    * Encrypt: True
    * Trust Server Certificate: True
3. Connection string (for app/client):
    * Data Source=localhost,1433;Initial Catalog=PetAdoptionDb;User Id=SA;Password=StrongPassword123!;Encrypt=True;TrustServerCertificate=True;
4. Verify login quickly:
    * sg docker -c "docker exec mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'StrongPassword123!' -C -Q 'SELECT 1'"
5. If you reset the container, recreate schema before backend use:
    * dotnet ef database update --project Programming/PetAdoption/backend/backend.csproj --startup-project Programming/PetAdoption/backend/backend.csproj

The backend reads this from Programming/PetAdoption/backend/appsettings.json under ConnectionStrings:DefaultConnection.