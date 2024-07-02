@echo off
echo Starting backup at %DATE% %TIME%...

rem Check if pg_dump exists
pg_dump -h localhost -U postgres -d Bill -f "test.sql" -Z 3 > NUL 2>&1
if ERRORLEVEL 1 (
  echo Error: pg_dump not found. Please install it.
  pause
  exit /b 1
)

rem Change directory (if needed)
cd "Desktop"

echo Starting backup...

rem Backup command
pg_dump -h localhost -U postgres -d Bill -f "Desktop_%DATE%.sql" -Z 3

if ERRORLEVEL 1 (
  echo Error: Backup failed. Check database connection, username, password, or permissions.
  pause
  exit /b 1
)

echo Backup successful!
pause
