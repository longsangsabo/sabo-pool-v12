#!/bin/bash

# 🚀 SABO Arena Mobile - Automated Deployment Script
# Handles building, testing, and deploying the mobile app

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/workspaces/sabo-pool-v12/apps/sabo-mobile"
BUILD_ENV=${1:-development}
PLATFORM=${2:-all}
SKIP_TESTS=${3:-false}

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed"
        exit 1
    fi
    
    # Check Expo CLI
    if ! command -v expo &> /dev/null; then
        log_error "Expo CLI is not installed. Run: npm install -g @expo/cli"
        exit 1
    fi
    
    # Check EAS CLI
    if ! command -v eas &> /dev/null; then
        log_warning "EAS CLI is not installed. Installing..."
        npm install -g eas-cli
    fi
    
    log_success "Prerequisites check passed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    cd "$PROJECT_DIR"
    
    # Clean install
    rm -rf node_modules
    pnpm install --frozen-lockfile
    
    log_success "Dependencies installed"
}

run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "Skipping tests"
        return
    fi
    
    log_info "Running tests..."
    cd "$PROJECT_DIR"
    
    # Type checking
    log_info "Running TypeScript checks..."
    pnpm type-check
    
    # Linting
    log_info "Running ESLint..."
    pnpm lint
    
    # Unit tests
    log_info "Running unit tests..."
    pnpm test --passWithNoTests
    
    # Integration tests (if available)
    if [ -f "scripts/integration-test.js" ]; then
        log_info "Running integration tests..."
        node scripts/integration-test.js
    fi
    
    log_success "All tests passed"
}

build_app() {
    log_info "Building app for $BUILD_ENV environment on $PLATFORM platform(s)..."
    cd "$PROJECT_DIR"
    
    # Set environment variables
    export EXPO_PUBLIC_NODE_ENV="$BUILD_ENV"
    
    case $BUILD_ENV in
        "development")
            log_info "Building development version..."
            expo build --type development --platform "$PLATFORM"
            ;;
        "staging")
            log_info "Building staging version..."
            eas build --platform "$PLATFORM" --profile staging --non-interactive
            ;;
        "production")
            log_info "Building production version..."
            eas build --platform "$PLATFORM" --profile production --non-interactive
            ;;
        *)
            log_error "Unknown build environment: $BUILD_ENV"
            exit 1
            ;;
    esac
    
    log_success "Build completed for $BUILD_ENV"
}

create_update() {
    log_info "Creating OTA update..."
    cd "$PROJECT_DIR"
    
    local branch="$BUILD_ENV"
    local message="Deploy $BUILD_ENV $(date '+%Y-%m-%d %H:%M')"
    
    eas update --branch "$branch" --message "$message" --non-interactive
    
    log_success "OTA update published to $branch branch"
}

run_security_checks() {
    log_info "Running security checks..."
    cd "$PROJECT_DIR"
    
    # Check for vulnerabilities
    pnpm audit --audit-level moderate
    
    # Check for sensitive data in code
    if command -v git-secrets &> /dev/null; then
        git secrets --scan
    else
        log_warning "git-secrets not installed, skipping sensitive data check"
    fi
    
    log_success "Security checks completed"
}

generate_changelog() {
    log_info "Generating changelog..."
    cd "$PROJECT_DIR"
    
    # Get git log since last tag
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local changelog_file="CHANGELOG_$(date '+%Y%m%d_%H%M').md"
    
    if [ -n "$last_tag" ]; then
        echo "# Changelog - $(date '+%Y-%m-%d %H:%M')" > "$changelog_file"
        echo "" >> "$changelog_file"
        echo "## Changes since $last_tag" >> "$changelog_file"
        echo "" >> "$changelog_file"
        git log --pretty=format:"- %s (%an)" "$last_tag"..HEAD >> "$changelog_file"
    else
        echo "# Changelog - $(date '+%Y-%m-%d %H:%M')" > "$changelog_file"
        echo "" >> "$changelog_file"
        echo "## Initial release" >> "$changelog_file"
    fi
    
    log_success "Changelog generated: $changelog_file"
}

backup_build_artifacts() {
    log_info "Backing up build artifacts..."
    cd "$PROJECT_DIR"
    
    local backup_dir="../mobile-builds/$(date '+%Y%m%d_%H%M')_$BUILD_ENV"
    mkdir -p "$backup_dir"
    
    # Copy important files
    cp -r .expo "$backup_dir/" 2>/dev/null || true
    cp app.json "$backup_dir/"
    cp package.json "$backup_dir/"
    cp eas.json "$backup_dir/" 2>/dev/null || true
    
    log_success "Build artifacts backed up to $backup_dir"
}

notify_team() {
    log_info "Notifying team..."
    
    # This would integrate with your team notification system
    # Examples: Slack webhook, Discord, email, etc.
    
    local message="🚀 Mobile app deployed to $BUILD_ENV environment"
    
    # Example Slack notification (replace with your webhook)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
    
    log_success "Team notification sent"
}

cleanup() {
    log_info "Cleaning up..."
    cd "$PROJECT_DIR"
    
    # Remove temporary files
    rm -rf .expo/web-cache 2>/dev/null || true
    rm -rf .expo/packager-info.json 2>/dev/null || true
    
    log_success "Cleanup completed"
}

main() {
    log_info "🚀 Starting SABO Arena Mobile deployment..."
    log_info "Environment: $BUILD_ENV"
    log_info "Platform: $PLATFORM"
    log_info "Skip Tests: $SKIP_TESTS"
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    run_security_checks
    run_tests
    
    if [ "$BUILD_ENV" = "development" ]; then
        # For development, just run the dev server
        log_info "Starting development server..."
        cd "$PROJECT_DIR"
        expo start
    else
        # For staging/production, build and deploy
        build_app
        create_update
        generate_changelog
        backup_build_artifacts
        notify_team
        cleanup
    fi
    
    log_success "🎉 Deployment completed successfully!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <environment> [platform] [skip_tests]"
    echo ""
    echo "Environments:"
    echo "  development - Start dev server"
    echo "  staging     - Build and deploy to staging"
    echo "  production  - Build and deploy to production"
    echo ""
    echo "Platforms:"
    echo "  all (default) - Build for all platforms"
    echo "  ios           - Build for iOS only"
    echo "  android       - Build for Android only"
    echo ""
    echo "Skip Tests:"
    echo "  false (default) - Run all tests"
    echo "  true           - Skip test execution"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 staging ios"
    echo "  $0 production all true"
    exit 1
fi

# Run main function
main "$@"
