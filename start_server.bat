@echo off

REM Navigate to the specific folder where your server files are located
cd /d D:\IMPORTANT FILES\WEB_DEVELOPMENT\Backend\WEBD Project BILL Maker

REM Command to start your server (replace with your actual command)
start cmd /k "nodemon index.js"

REM Wait for the server to start (optional delay)
timeout /t 5

REM Open Google Chrome to localhost:3000
start chrome http://localhost:3000/
