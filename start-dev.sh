#!/bin/bash

# Kill any existing processes
pkill -f "vite|npm" 2>/dev/null || true

# Wait a moment
sleep 2

# Start the development server
cd /workspaces/sabo-pool-v11
npm run dev

echo "Development server should be starting..."
echo "Check http://localhost:8087 or the port shown above"
