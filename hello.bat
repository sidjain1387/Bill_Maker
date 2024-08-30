@echo off

REM Set PostgreSQL installation path
SET PGPATH=C:\Program Files\PostgreSQL\15\bin

REM Set PostgreSQL username
SET PGUSER=postgres

REM Set the password (optional, for security reasons it's better to omit this or use .pgpass)
SET PGPASSWORD=Tiku2004###

REM Set the database name you want to back up
SET DBNAME=Bill

REM Set the directory where the SQL dump file will be saved
SET DUMPDIR=C:\Users\Siddhant Jain\Desktop

REM Initialize the counter
SET COUNTER=1

REM Loop to find the next available filename
:find_filename
IF EXIST "%DUMPDIR%\new_bill_database_%COUNTER%.sql" (
    SET /A COUNTER+=1
    GOTO find_filename
)

REM Set the path to the SQL dump file with the incremented number
SET DUMPFILE=%DUMPDIR%\new_bill_database_%COUNTER%.sql

REM Create the backup using pg_dump
"%PGPATH%\pg_dump" -U %PGUSER% -d %DBNAME% > "%DUMPFILE%"

REM Clean up environment variables (optional)
SET PGPASSWORD=
SET PGPATH=
SET PGUSER=
SET DBNAME=
SET DUMPDIR=
SET COUNTER=

@echo Database backup complete! The dump file is saved as new_bill_database_%COUNTER%.sql
pause