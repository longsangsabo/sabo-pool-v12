#!/bin/bash

# 🚀 DOC CLEANUP SYSTEM INSTALLER & SETUP SCRIPT

echo "🤖 Intelligent Doc Cleanup Automation System"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16+ required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js $(node --version) detected"
}

# Install dependencies
install_dependencies() {
    print_info "Installing npm dependencies..."
    
    cd /workspaces/sabo-pool-v11/docs/scripts
    
    if npm install; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    print_info "Creating directory structure..."
    
    mkdir -p /workspaces/sabo-pool-v11/logs
    mkdir -p /workspaces/sabo-pool-v11/backups
    mkdir -p /workspaces/sabo-pool-v11/docs/active
    mkdir -p /workspaces/sabo-pool-v11/docs/archive
    mkdir -p /workspaces/sabo-pool-v11/docs/quarantine
    
    print_status "Directory structure created"
}

# Set file permissions
set_permissions() {
    print_info "Setting file permissions..."
    
    chmod +x /workspaces/sabo-pool-v11/docs/scripts/doc-cleanup.js
    chmod +x /workspaces/sabo-pool-v11/docs/scripts/setup.sh
    
    # Ensure log directory is writable
    chmod 755 /workspaces/sabo-pool-v11/logs
    chmod 755 /workspaces/sabo-pool-v11/backups
    
    print_status "Permissions set correctly"
}

# Test system functionality
test_system() {
    print_info "Running system tests..."
    
    cd /workspaces/sabo-pool-v11/docs/scripts
    
    # Test analyze mode (safe, no actual cleanup)
    if node doc-cleanup.js analyze > /dev/null 2>&1; then
        print_status "System test passed"
    else
        print_warning "System test had issues, but installation can continue"
    fi
}

# Create systemd service (if on Linux with systemd)
create_systemd_service() {
    if command -v systemctl &> /dev/null; then
        print_info "Creating systemd service for daemon mode..."
        
        cat > /tmp/doc-cleanup.service << EOF
[Unit]
Description=Intelligent Doc Cleanup Automation
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/workspaces/sabo-pool-v11/docs/scripts
ExecStart=/usr/bin/node doc-cleanup.js daemon
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

        if sudo mv /tmp/doc-cleanup.service /etc/systemd/system/; then
            sudo systemctl daemon-reload
            print_status "Systemd service created (not enabled yet)"
            print_info "To enable: sudo systemctl enable doc-cleanup.service"
            print_info "To start: sudo systemctl start doc-cleanup.service"
        else
            print_warning "Could not create systemd service (requires sudo)"
        fi
    fi
}

# Display usage instructions
show_usage() {
    echo ""
    echo "🎉 Installation Complete!"
    echo "========================"
    echo ""
    echo "📋 Quick Start Commands:"
    echo "  npm start                  # Run cleanup once"
    echo "  npm run daemon            # Run in background"
    echo "  npm run analyze           # Analyze files only"
    echo ""
    echo "⚙️  Configuration:"
    echo "  Edit: docs/scripts/config.json"
    echo ""
    echo "📊 Monitoring:"
    echo "  Logs: tail -f logs/cleanup.log"
    echo "  Status: ls -la docs/quarantine/"
    echo ""
    echo "🔧 Advanced Usage:"
    echo "  node doc-cleanup.js --help"
    echo ""
    echo "📖 Documentation:"
    echo "  docs/scripts/README.md"
    echo ""
}

# Main installation flow
main() {
    echo "Starting installation..."
    echo ""
    
    check_nodejs
    create_directories
    install_dependencies
    set_permissions
    test_system
    create_systemd_service
    
    show_usage
    
    echo ""
    print_status "Doc Cleanup System installed successfully!"
    echo ""
    echo "🤖 Ready for automated document management!"
}

# Run installation
main "$@"
