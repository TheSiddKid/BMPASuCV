import React, { useState } from 'react';
import './App.css';
import PoseAnalyzer from './components/PoseAnalyzer';

function App() {
  const [isActive, setIsActive] = useState(false);
  const [exerciseMode, setExerciseMode] = useState('bicep_curl');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = () => {
    setIsActive(false);
  };

  const handleExerciseChange = (exercise) => {
    setExerciseMode(exercise);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>🏋️ BMPASuCV</h1>
        <p>Biomechanical Posture Analysis System using Computer Vision</p>
      </div>
      
      <div className="main-container">
        <div className={`status ${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected to Analysis Server'}
          {connectionStatus === 'connecting' && '🟡 Connecting...'}
          {connectionStatus === 'disconnected' && '🔴 Disconnected'}
        </div>

        <div className="exercise-selector">
          <button
            className={`exercise-btn ${exerciseMode === 'bicep_curl' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('bicep_curl')}
            disabled={isActive}
          >
            💪 Bicep Curls
          </button>
          <button
            className={`exercise-btn ${exerciseMode === 'squat' ? 'active' : ''}`}
            onClick={() => handleExerciseChange('squat')}
            disabled={isActive}
          >
            🦵 Squats
          </button>
        </div>

        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={handleStart}
            disabled={isActive}
          >
            Start Analysis
          </button>
          <button
            className="btn btn-danger"
            onClick={handleStop}
            disabled={!isActive}
          >
            Stop Analysis
          </button>
        </div>

        {isActive && (
          <PoseAnalyzer
            exerciseMode={exerciseMode}
            onConnectionChange={setConnectionStatus}
          />
        )}
      </div>
    </div>
  );
}

export default App;
