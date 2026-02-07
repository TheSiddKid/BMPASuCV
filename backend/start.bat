@echo off
REM Backend startup script for BMPASuCV (Windows)

echo Starting BMPASuCV Backend Server...

cd /d "%~dp0"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing/Updating dependencies...
pip install -r requirements.txt

REM Start the server
echo Starting FastAPI server on http://localhost:8000
python main.py
