#!/bin/bash

# SABO Pool Mobile - Production Deploy Script
# Usage: ./deploy.sh [development|preview|production]

set -e

ENVIRONMENT=${1:-production}

echo "🚀 SABO Pool Mobile Deploy - Environment: $ENVIRONMENT"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
fi

# Login to Expo (if not already logged in)
echo "🔐 Checking Expo authentication..."
eas whoami || {
    echo "Please login to your Expo account:"
    eas login
}

# Configure project if needed
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS..."
    eas build:configure
fi

# Check environment variables
echo "🔍 Checking environment configuration..."
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Using .env"
fi

case $ENVIRONMENT in
    "development")
        echo "🏗️ Building development version..."
        eas build --platform all --profile development --non-interactive
        ;;
    "preview")
        echo "🏗️ Building preview version..."
        eas build --platform all --profile preview --non-interactive
        ;;
    "production")
        echo "🏗️ Building PRODUCTION version for App Store..."
        echo "📱 This will create builds for:"
        echo "   - Google Play Store (Android AAB)"
        echo "   - Apple App Store (iOS IPA)"
        
        # Build for production
        eas build --platform all --profile production --non-interactive
        
        echo "✅ Production build completed!"
        echo "📋 Next steps:"
        echo "   1. Download builds from Expo dashboard"
        echo "   2. Test on physical devices"
        echo "   3. Submit to app stores:"
        echo "      - Android: eas submit --platform android"
        echo "      - iOS: eas submit --platform ios"
        ;;
    *)
        echo "❌ Invalid environment. Use: development, preview, or production"
        exit 1
        ;;
esac

echo "✅ Build process completed!"
echo "📱 Check your builds at: https://expo.dev"
echo "💡 Build artifacts will be available for download"
