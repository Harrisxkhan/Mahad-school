@echo off
echo Starting 5th Grade Homework Helper and Arduino Bridge...
echo.
echo [1/2] Starting main server...
start "Homework Helper Server" cmd /k "npm start"
echo.
echo [2/2] Starting Arduino bridge...
cd arduino-bridge
start "Arduino Bridge" cmd /k "npm start"
echo.
echo Both servers started! Please wait a moment for them to initialize.
echo Main application: http://localhost:3000
echo Arduino bridge: http://localhost:3001
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul 