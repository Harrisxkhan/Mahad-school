#!/bin/bash

echo "Starting 5th Grade Homework Helper and Arduino Bridge..."
echo ""
echo "[1/2] Starting main server..."
gnome-terminal --tab --title="Homework Helper Server" -- bash -c "npm start; exec bash" || \
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"' || \
xterm -e "npm start" || \
npm start &

echo ""
echo "[2/2] Starting Arduino bridge..."
cd arduino-bridge

gnome-terminal --tab --title="Arduino Bridge" -- bash -c "npm start; exec bash" || \
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm start"' || \
xterm -e "npm start" || \
npm start &

echo ""
echo "Both servers started! Please wait a moment for them to initialize."
echo "Main application: http://localhost:3000"
echo "Arduino bridge: http://localhost:3001"
echo ""
echo "Press Ctrl+C to exit this window (servers will continue running)"
wait 