#!/bin/bash

echo "Starting Lead Management System..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        return 1
    else
        echo "Port $1 is available"
        return 0
    fi
}

# Kill any existing processes on ports 3000 and 5000
echo "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Start backend server
echo "Starting backend server on port 5000..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5000/health > /dev/null; then
    echo "Backend server started successfully"
else
    echo "Failed to start backend server"
    exit 1
fi

# Start frontend server
echo "Starting frontend server on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
