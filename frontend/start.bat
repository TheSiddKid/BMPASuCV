@echo off
REM Frontend startup script for BMPASuCV (Windows)

echo Starting BMPASuCV Frontend...

cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start React development server
echo Starting React development server on http://localhost:3000
npm start
