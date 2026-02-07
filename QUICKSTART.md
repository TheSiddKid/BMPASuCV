# Quick Start Guide

This guide will help you get the Biomechanical Posture Analysis System up and running quickly.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- A working webcam
- Operating System: Windows, macOS, or Linux

## Installation & Setup

### Option 1: Using the startup scripts (Easiest)

#### On Linux/macOS:

1. **Start the backend** (in one terminal):
```bash
cd backend
./start.sh
```

2. **Start the frontend** (in another terminal):
```bash
cd frontend
./start.sh
```

#### On Windows:

1. **Start the backend** (in one terminal):
```cmd
cd backend
start.bat
```

2. **Start the frontend** (in another terminal):
```cmd
cd frontend
start.bat
```

### Option 2: Manual setup

#### Backend Setup:

1. Open a terminal and navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

#### Frontend Setup:

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

## Using the Application

1. **Grant Camera Access**: When you first open the app, your browser will ask for camera permissions. Click "Allow" to grant access.

2. **Select Exercise**: Choose between:
   - 💪 Bicep Curls
   - 🦵 Squats

3. **Start Analysis**: Click the "Start Analysis" button to begin pose detection.

4. **Position Yourself**: 
   - Stand 5-8 feet away from your camera
   - Ensure your full body is visible in the frame
   - Make sure you have good lighting

5. **Start Exercising**: Begin your exercise. You'll see:
   - A skeletal overlay on your video feed
   - Real-time rep counter
   - Joint angle measurements
   - Form feedback

6. **Stop Analysis**: Click "Stop Analysis" when you're done.

## Troubleshooting

### Backend won't start
- Make sure Python 3.8+ is installed: `python --version`
- Check that port 8000 is not already in use
- Try reinstalling dependencies: `pip install -r requirements.txt --force-reinstall`

### Frontend won't start
- Make sure Node.js is installed: `node --version`
- Check that port 3000 is not already in use
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Camera not working
- Grant camera permissions in your browser
- Check that no other application is using the camera
- Try a different browser (Chrome recommended)

### Connection error
- Make sure both backend and frontend are running
- Check that the backend is running on port 8000
- Check your firewall settings

### Pose not detected
- Improve lighting conditions
- Move closer or further from the camera
- Ensure your full body is visible
- Try different camera angles

## Tips for Best Results

1. **Lighting**: Use bright, even lighting. Natural light works best.

2. **Camera Position**: 
   - Place camera at chest height
   - Keep 5-8 feet distance
   - Center yourself in the frame

3. **Space**: Ensure you have enough room to perform exercises fully.

4. **Clothing**: Wear fitted clothing for better pose detection. Avoid baggy clothes.

5. **Background**: Use a plain background when possible for better detection.

## Next Steps

For more detailed information, see the main [README.md](README.md).

To customize the application or add new exercises, refer to the "Customization" section in the README.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the full README.md
3. Check the browser console for errors (F12)
4. Check the backend terminal for error messages
