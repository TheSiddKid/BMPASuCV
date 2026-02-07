// Configuration constants for the application
const config = {
  // WebSocket backend URL - can be overridden by environment variable
  WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8000/ws/pose',
};

export default config;
