#!/bin/bash

# SABO Arena Development Server Script
# Optimized development workflow with parallel servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to kill background processes on exit
cleanup() {
    print_status "Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

print_status "🚀 Starting SABO Arena development environment..."

# Check if shared packages are built
print_status "Checking shared packages..."
shared_packages=("shared-types" "shared-utils" "shared-hooks" "shared-auth" "shared-ui")

for package in "${shared_packages[@]}"; do
    if [ ! -d "packages/$package/dist" ]; then
        print_warning "Building $package (first time setup)..."
        pnpm --filter "@sabo/$package" run build
    fi
done

print_success "Shared packages ready!"

# Start development servers
print_status "Starting development servers..."

echo ""
print_status "🌐 Starting User App on http://localhost:8080"
cd apps/sabo-user
pnpm dev > ../../logs/user-dev.log 2>&1 &
USER_PID=$!
cd ../..

echo ""
print_status "🔧 Starting Admin App on http://localhost:8081" 
cd apps/sabo-admin
pnpm dev > ../../logs/admin-dev.log 2>&1 &
ADMIN_PID=$!
cd ../..

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait a moment for servers to start
sleep 3

# Check if servers started successfully
if ps -p $USER_PID > /dev/null; then
    print_success "User app server started (PID: $USER_PID)"
else
    print_error "User app server failed to start"
    exit 1
fi

if ps -p $ADMIN_PID > /dev/null; then
    print_success "Admin app server started (PID: $ADMIN_PID)"
else
    print_error "Admin app server failed to start"
    exit 1
fi

echo ""
echo "🎉 Development environment ready!"
echo ""
echo "📱 User App:  http://localhost:8080"
echo "🔧 Admin App: http://localhost:8081" 
echo ""
echo "📝 Logs:"
echo "   User:  tail -f logs/user-dev.log"
echo "   Admin: tail -f logs/admin-dev.log"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep the script running and monitor the servers
while true; do
    # Check if servers are still running
    if ! ps -p $USER_PID > /dev/null; then
        print_error "User app server stopped unexpectedly"
        cat logs/user-dev.log | tail -20
        break
    fi
    
    if ! ps -p $ADMIN_PID > /dev/null; then
        print_error "Admin app server stopped unexpectedly"
        cat logs/admin-dev.log | tail -20
        break
    fi
    
    sleep 5
done

cleanup
