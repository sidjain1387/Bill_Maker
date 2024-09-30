@echo off

REM Set PostgreSQL installation path
SET PGPATH=C:\Program Files\PostgreSQL\15\bin

REM Set PostgreSQL username
SET PGUSER=postgres

REM Set the password (optional, for security reasons it's better to omit this or use .pgpass)
SET PGPASSWORD=Tiku2004###

REM Set the database name where the backup will be restored
SET DBNAME=restore_bill

REM Set the directory where the SQL dump file is located
SET DUMPDIR=C:\Users\Siddhant Jain\Desktop

REM Set the SQL dump file name to restore from (adjust this to the correct backup file name)
SET DUMPFILE=new_bill_database_1.sql

REM Restore the backup using psql
"%PGPATH%\psql" -U %PGUSER% -d %DBNAME% -f "%DUMPDIR%\%DUMPFILE%"

REM Clean up environment variables (optional)
SET PGPASSWORD=
SET PGPATH=
SET PGUSER=
SET DBNAME=
SET DUMPDIR=
SET DUMPFILE=

@echo Database restoration complete!
pause
