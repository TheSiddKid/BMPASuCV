# BMPASuCV - Biomechanical Posture Analysis System using Computer Vision

A real-time Biomechanical Posture Analysis System that uses computer vision to track human pose from a standard webcam. By extracting skeletal keypoints and computing joint angles, it evaluates exercise form, detects incorrect posture, counts reps, and provides instant visual feedback to reduce injury risk.

## Features

- **Real-time Pose Detection**: Uses MediaPipe Pose to extract 33 body landmarks
- **Exercise Analysis**: Supports bicep curls and squats with form analysis
- **Rep Counter**: Automatically counts repetitions
- **Joint Angle Calculation**: Computes angles using NumPy
- **Live Skeletal Overlay**: Visual feedback with skeleton overlay on webcam feed
- **WebSocket Streaming**: Low-latency frame streaming from browser to server
- **Responsive UI**: Optimized for laptop/desktop use with React.js

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **MediaPipe**: Google's ML solution for pose estimation
- **OpenCV**: Computer vision library for image processing
- **NumPy**: Numerical computing for angle calculations
- **WebSockets**: Real-time bidirectional communication

### Frontend
- **React.js**: Modern UI library
- **react-webcam**: Webcam capture in browser
- **Canvas API**: For drawing skeletal overlay

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Webcam

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Starting the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate virtual environment (if created):
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Start the FastAPI server:
```bash
python main.py
```

The backend server will start on `http://localhost:8000`

### Starting the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the React development server:
```bash
npm start
```

The frontend will open automatically in your browser at `http://localhost:3000`

## How to Use

1. **Allow webcam access** when prompted by your browser
2. **Select an exercise** (Bicep Curls or Squats) from the exercise selector
3. **Click "Start Analysis"** to begin pose detection
4. **Position yourself** so your full body is visible in the camera
5. **Start exercising** and watch the real-time feedback:
   - Rep counter increments automatically
   - Joint angles are displayed
   - Form feedback appears in real-time
   - Skeletal overlay shows your pose
6. **Click "Stop Analysis"** when done

## Exercise Guidance

### Bicep Curls
- Stand with arms extended downward
- Curl the weight up to your shoulder
- The system tracks elbow angle and counts reps
- Feedback helps maintain proper form

### Squats
- Stand with feet shoulder-width apart
- Lower your body by bending knees
- Keep your back straight
- The system tracks knee angle and back alignment
- Returns to standing position for rep count

## API Endpoints

### WebSocket
- `ws://localhost:8000/ws/pose` - Main WebSocket endpoint for pose analysis

### REST
- `GET /` - API health check

## Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │ ◄─────────────────────────► │                 │
│  React Frontend │   Frame Streaming          │ FastAPI Backend │
│  (Browser)      │   Pose Data Response       │  (Python)       │
│                 │                             │                 │
└─────────────────┘                             └─────────────────┘
        │                                               │
        │ Webcam Capture                                │ MediaPipe
        │ Canvas Drawing                                │ OpenCV
        │ UI Updates                                    │ NumPy
        └───────────────────────────────────────────────┘
```

## Project Structure

```
BMPASuCV/
├── backend/
│   ├── main.py              # FastAPI application with WebSocket
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── PoseAnalyzer.js   # Main pose analysis component
│   │   │   └── PoseAnalyzer.css  # Styling
│   │   ├── App.js          # Main App component
│   │   ├── App.css         # App styling
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Node dependencies
├── README.md
└── LICENSE
```

## How It Works

1. **Webcam Capture**: The frontend captures video frames from the user's webcam using the `react-webcam` library

2. **Frame Streaming**: Each frame is converted to base64 and sent to the backend via WebSocket

3. **Pose Detection**: The backend uses MediaPipe Pose to detect 33 body landmarks in each frame

4. **Angle Calculation**: NumPy calculates joint angles (elbow for bicep curls, knee for squats)

5. **Form Analysis**: Rule-based logic evaluates exercise form:
   - Bicep Curls: Tracks elbow angle, counts reps when arm extends (>160°) then curls (<30°)
   - Squats: Tracks knee angle, counts reps when standing (>160°) then squatting (<90°), checks back alignment

6. **Real-time Feedback**: Analysis results are sent back to the frontend via WebSocket

7. **Visualization**: The frontend draws a skeletal overlay on the video feed and displays metrics

## Customization

### Adding New Exercises

To add a new exercise:

1. Add an analysis function in `backend/main.py`:
```python
def analyze_new_exercise(landmarks, client_id: str) -> Dict:
    # Your analysis logic here
    pass
```

2. Update the WebSocket handler to support the new exercise mode

3. Add UI controls in the frontend `App.js`

### Adjusting Thresholds

Modify angle thresholds in `backend/main.py`:
- For bicep curls: Change values in `analyze_bicep_curl()`
- For squats: Change values in `analyze_squat()`

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Note: Webcam access requires HTTPS in production or localhost for development.

## Performance Tips

- Ensure good lighting for better pose detection
- Position yourself 5-8 feet from the camera
- Keep your full body in frame
- Use a stable internet connection for WebSocket communication
- Close other applications for better performance

## Troubleshooting

### "Connection error" message
- Make sure the backend server is running on port 8000
- Check that no firewall is blocking the connection

### Webcam not working
- Allow webcam permissions in your browser
- Check if another application is using the webcam
- Try refreshing the page

### Pose not detected
- Ensure adequate lighting
- Move further from or closer to the camera
- Make sure your full body is visible

### Low frame rate
- Close other applications
- Reduce browser window size
- Check CPU usage

## Security

This project follows security best practices:

- **Dependencies**: All Python dependencies are regularly updated to patched versions to address known vulnerabilities
- **WebSocket Security**: The WebSocket connection is designed for localhost use during development
- **Data Privacy**: All video processing happens locally on your machine; no data is sent to external servers
- **Camera Access**: The application only accesses your webcam when you explicitly grant permission

### Known Security Considerations

- The frontend uses `react-scripts` which has some dev dependencies with known issues. These are development-time only and do not affect production builds.
- For production deployment, consider:
  - Using HTTPS for the frontend
  - Implementing WebSocket authentication
  - Setting up proper CORS policies
  - Running the backend behind a reverse proxy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- MediaPipe by Google for pose estimation
- FastAPI for the excellent web framework
- React team for the powerful UI library
