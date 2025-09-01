#!/bin/bash

# 🚀 SABO Pool Mobile App - Auto Setup Script
# Automatically sets up Flutter mobile app for new developers

set -e  # Exit on any error

echo "🚀 SABO Pool Mobile App - Auto Setup Starting..."
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "apps/sabo_flutter" ]]; then
    print_error "Please run this script from the sabo-pool-v12 root directory"
    exit 1
fi

print_status "Setting up SABO Pool Mobile App..."

# Step 1: Check and install system dependencies
print_status "Checking system dependencies..."
if ! command -v curl &> /dev/null; then
    print_error "curl is required but not installed. Please install curl first."
    exit 1
fi

# Install required packages
print_status "Installing system packages..."
sudo apt update
sudo apt install -y cmake ninja-build pkg-config libgtk-3-dev liblzma-dev libstdc++-12-dev

# Step 2: Download and setup Flutter if not exists
FLUTTER_DIR="./flutter"
if [[ ! -d "$FLUTTER_DIR" ]]; then
    print_status "Downloading Flutter SDK 3.24.3..."
    if [[ ! -f "flutter_linux_3.24.3-stable.tar.xz" ]]; then
        curl -L -o flutter_linux_3.24.3-stable.tar.xz \
            https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.3-stable.tar.xz
    fi
    
    print_status "Extracting Flutter SDK..."
    tar xf flutter_linux_3.24.3-stable.tar.xz
    print_success "Flutter SDK extracted"
else
    print_success "Flutter SDK already exists"
fi

# Step 3: Set up Flutter PATH
export PATH="$PATH:$(pwd)/flutter/bin"
print_status "Flutter PATH configured for this session"

# Step 4: Verify Flutter installation
print_status "Verifying Flutter installation..."
flutter doctor

# Step 5: Navigate to Flutter app directory
cd apps/sabo_flutter

# Step 6: Get Flutter dependencies
print_status "Getting Flutter dependencies..."
flutter pub get

# Step 7: Build the app
print_status "Building Flutter web app..."
flutter build web

print_success "Build completed successfully!"

# Step 8: Start development server
print_status "Starting development server..."
echo ""
echo "================================================="
echo "🎉 SETUP COMPLETE!"
echo "================================================="
echo ""
echo "📱 Your SABO Pool Mobile App is ready!"
echo ""
echo "🌐 Development server will start at: http://localhost:8080"
echo ""
echo "🔧 Commands available:"
echo "  • Hot reload: Press 'r' in the terminal"
echo "  • Full restart: Press 'R' in the terminal"
echo "  • Quit: Press 'q' in the terminal"
echo ""
echo "🚀 Features ready to test:"
echo "  • Authentication: /auth/login, /auth/register"
echo "  • Profile system: Tap 'Cá nhân' in bottom nav"
echo "  • Navigation: Bottom navigation bar"
echo ""
echo "📖 See MOBILE_APP_QUICK_START.md for more details"
echo ""
echo "================================================="
echo "Starting Flutter development server..."
echo "================================================="

# Start the development server
flutter run -d web-server --web-port=8080
