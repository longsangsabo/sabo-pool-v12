#!/bin/bash

# Kill any existing processes
pkill -f "vite|npm" 2>/dev/null || true

# Wait a moment
sleep 2

# Start the frontend (Vite) dev server from repo root dynamically
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1
echo "Starting Vite dev server in $SCRIPT_DIR"
npm run dev

echo "Development server should be starting..."
echo "Check http://localhost:8080 (configured in vite.config.ts) or the port shown above"
