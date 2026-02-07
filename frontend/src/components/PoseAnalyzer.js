import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import config from '../config';
import './PoseAnalyzer.css';

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
  [11, 23], [12, 24], [23, 24], // Torso
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31], // Left leg
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32], // Right leg
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], // Face
  [9, 10], // Mouth
  [11, 23], [12, 24] // Additional torso
];

const PoseAnalyzer = ({ exerciseMode, onConnectionChange }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const animationRef = useRef(null);
  
  const [landmarks, setLandmarks] = useState([]);
  const [repCount, setRepCount] = useState(0);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState(null);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      onConnectionChange('connecting');
      const ws = new WebSocket(config.WEBSOCKET_URL);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setError(null); // Clear any previous errors
        onConnectionChange('connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.landmarks && data.landmarks.length > 0) {
          setLandmarks(data.landmarks);
          
          // Update analysis data based on exercise mode
          if (exerciseMode === 'bicep_curl' && data.bicep_curl_analysis) {
            setRepCount(data.bicep_curl_analysis.count);
            setCurrentAngle(data.bicep_curl_analysis.angle);
            setFeedback(data.bicep_curl_analysis.feedback);
          } else if (exerciseMode === 'squat' && data.squat_analysis) {
            setRepCount(data.squat_analysis.count);
            setCurrentAngle(data.squat_analysis.angle);
            setFeedback(data.squat_analysis.feedback);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Make sure the backend server is running.');
        onConnectionChange('disconnected');
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        onConnectionChange('disconnected');
      };
      
      wsRef.current = ws;
    } catch (err) {
      setError('Failed to connect to server');
      onConnectionChange('disconnected');
    }
  }, [exerciseMode, onConnectionChange]);

  // Send frame to backend
  const sendFrame = useCallback(() => {
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      webcamRef.current
    ) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const message = JSON.stringify({
          type: 'frame',
          data: imageSrc,
          exercise: exerciseMode
        });
        wsRef.current.send(message);
      }
    }
  }, [exerciseMode]);

  // Draw skeleton overlay
  const drawSkeleton = useCallback(() => {
    const canvas = canvasRef.current;
    const webcam = webcamRef.current;
    
    if (!canvas || !webcam || landmarks.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const video = webcam.video;
    
    if (!video) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height);
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height);
        ctx.stroke();
      }
    });
    
    // Draw landmarks
    landmarks.forEach((landmark, idx) => {
      if (landmark.visibility > 0.5) {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        // Different colors for different body parts
        if (idx <= 10) {
          ctx.fillStyle = '#ff0000'; // Head - red
        } else if (idx <= 16) {
          ctx.fillStyle = '#00ffff'; // Arms - cyan
        } else if (idx <= 22) {
          ctx.fillStyle = '#ffff00'; // Torso - yellow
        } else {
          ctx.fillStyle = '#ff00ff'; // Legs - magenta
        }
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [landmarks]);

  // Animation loop
  const animate = useCallback(() => {
    sendFrame();
    drawSkeleton();
    animationRef.current = requestAnimationFrame(animate);
  }, [sendFrame, drawSkeleton]);

  // Initialize on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [connectWebSocket]);

  // Start animation when connected
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      animate();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Reset counter when exercise mode changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'reset' }));
      setRepCount(0);
      setCurrentAngle(0);
      setFeedback([]);
    }
  }, [exerciseMode]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pose-analyzer">
      <div className="video-container">
        <div className="video-wrapper">
          <Webcam
            ref={webcamRef}
            className="webcam"
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: 'user'
            }}
          />
          <canvas ref={canvasRef} className="skeleton-overlay" />
        </div>
      </div>

      <div className="stats-panel">
        <h2>{exerciseMode === 'bicep_curl' ? '💪 Bicep Curls' : '🦵 Squats'}</h2>
        
        <div className="rep-counter">
          <div className="label">Reps</div>
          <div className="count">{repCount}</div>
        </div>

        <div className="angle-display">
          <div className="label">
            {exerciseMode === 'bicep_curl' ? 'Elbow Angle' : 'Knee Angle'}
          </div>
          <div className="value">{currentAngle}°</div>
        </div>

        <div className="feedback-section">
          <h3>Real-time Feedback</h3>
          {feedback.length > 0 ? (
            <ul className="feedback-list">
              {feedback.map((item, idx) => (
                <li key={`feedback-${idx}-${item.substring(0, 20)}`} className="feedback-item">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-feedback">
              Start exercising to get feedback
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoseAnalyzer;
