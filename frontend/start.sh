#!/bin/bash

# Frontend startup script for BMPASuCV

echo "Starting BMPASuCV Frontend..."

cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start React development server
echo "Starting React development server on http://localhost:3000"
npm start
