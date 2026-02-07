from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import numpy as np
import base64
import json
import asyncio
from typing import Dict, List, Tuple

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Exercise state tracking - using asyncio.Lock for thread safety
exercise_states = {}
state_lock = asyncio.Lock()


def calculate_angle(a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float]) -> float:
    """Calculate angle between three points (in degrees)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle


async def analyze_bicep_curl(landmarks, client_id: str) -> Dict:
    """Analyze bicep curl form and count reps"""
    async with state_lock:
        if client_id not in exercise_states:
            exercise_states[client_id] = {
                'bicep_curl_count': 0,
                'bicep_curl_stage': None,
                'squat_count': 0,
                'squat_stage': None
            }
        
        state = exercise_states[client_id]
    
    feedback = []
    
    # Get coordinates for right arm
    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
    elbow = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
             landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
    wrist = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
             landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]
    
    # Calculate elbow angle
    angle = calculate_angle(shoulder, elbow, wrist)
    
    # Count reps and provide feedback
    async with state_lock:
        if angle > 160:
            state['bicep_curl_stage'] = "down"
            feedback.append("Arm extended")
        if angle < 30 and state['bicep_curl_stage'] == 'down':
            state['bicep_curl_stage'] = "up"
            state['bicep_curl_count'] += 1
            feedback.append("Good rep!")
    
    # Form feedback
    if 30 <= angle <= 160:
        if angle < 60:
            feedback.append("Hold contraction")
        else:
            feedback.append("Keep going")
    
    return {
        'exercise': 'bicep_curl',
        'count': state['bicep_curl_count'],
        'angle': round(angle, 2),
        'feedback': feedback
    }


async def analyze_squat(landmarks, client_id: str) -> Dict:
    """Analyze squat form and count reps"""
    async with state_lock:
        if client_id not in exercise_states:
            exercise_states[client_id] = {
                'bicep_curl_count': 0,
                'bicep_curl_stage': None,
                'squat_count': 0,
                'squat_stage': None
            }
        
        state = exercise_states[client_id]
    
    feedback = []
    
    # Get coordinates for right leg
    hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
           landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
    knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
            landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
    ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
             landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]
    
    # Calculate knee angle
    angle = calculate_angle(hip, knee, ankle)
    
    # Count reps and provide feedback
    async with state_lock:
        if angle > 160:
            state['squat_stage'] = "up"
            feedback.append("Standing position")
        if angle < 90 and state['squat_stage'] == 'up':
            state['squat_stage'] = "down"
            state['squat_count'] += 1
            feedback.append("Good squat!")
        
    # Form feedback
    if 90 <= angle <= 160:
        if angle < 110:
            feedback.append("Good depth")
        else:
            feedback.append("Go lower")
    
    # Check back alignment (simplified)
    shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
    
    back_angle = calculate_angle(shoulder, hip, knee)
    if back_angle < 150:
        feedback.append("Keep back straight")
    
    return {
        'exercise': 'squat',
        'count': state['squat_count'],
        'angle': round(angle, 2),
        'feedback': feedback
    }


@app.get("/")
async def root():
    return {"message": "Biomechanical Posture Analysis System API"}


@app.websocket("/ws/pose")
async def websocket_pose_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = id(websocket)
    
    # Initialize pose detector
    pose = mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=1
    )
    
    try:
        while True:
            # Receive frame data from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message['type'] == 'frame':
                # Decode base64 image
                img_data = base64.b64decode(message['data'].split(',')[1])
                nparr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # Convert BGR to RGB
                image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image.flags.writeable = False
                
                # Process with MediaPipe
                results = pose.process(image)
                
                # Prepare response
                response = {
                    'landmarks': [],
                    'bicep_curl_analysis': None,
                    'squat_analysis': None
                }
                
                if results.pose_landmarks:
                    # Extract landmarks
                    landmarks_list = []
                    for landmark in results.pose_landmarks.landmark:
                        landmarks_list.append({
                            'x': landmark.x,
                            'y': landmark.y,
                            'z': landmark.z,
                            'visibility': landmark.visibility
                        })
                    response['landmarks'] = landmarks_list
                    
                    # Analyze exercises based on mode
                    exercise_mode = message.get('exercise', 'bicep_curl')
                    
                    if exercise_mode == 'bicep_curl':
                        response['bicep_curl_analysis'] = await analyze_bicep_curl(
                            results.pose_landmarks.landmark, client_id
                        )
                    elif exercise_mode == 'squat':
                        response['squat_analysis'] = await analyze_squat(
                            results.pose_landmarks.landmark, client_id
                        )
                
                # Send response back to client
                await websocket.send_text(json.dumps(response))
            
            elif message['type'] == 'reset':
                # Reset exercise state
                async with state_lock:
                    if client_id in exercise_states:
                        exercise_states[client_id] = {
                            'bicep_curl_count': 0,
                            'bicep_curl_stage': None,
                            'squat_count': 0,
                            'squat_stage': None
                        }
                await websocket.send_text(json.dumps({'status': 'reset'}))
                
    except WebSocketDisconnect:
        # Clean up state when client disconnects
        async with state_lock:
            if client_id in exercise_states:
                del exercise_states[client_id]
        pose.close()
    except Exception as e:
        print(f"Error: {e}")
        pose.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
