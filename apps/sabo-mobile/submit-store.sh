#!/bin/bash

# SABO Pool Mobile - App Store Submission Script
# Usage: ./submit-store.sh [android|ios|all]

set -e

PLATFORM=${1:-all}

echo "📱 SABO Pool Arena - App Store Submission"
echo "Platform: $PLATFORM"

# Check if builds exist
echo "🔍 Checking for production builds..."

case $PLATFORM in
    "android")
        echo "🤖 Submitting to Google Play Store..."
        eas submit --platform android --latest
        echo "✅ Android submission completed!"
        echo "📋 Check Google Play Console for review status"
        ;;
    "ios")
        echo "🍎 Submitting to Apple App Store..."
        eas submit --platform ios --latest
        echo "✅ iOS submission completed!"
        echo "📋 Check App Store Connect for review status"
        ;;
    "all")
        echo "🚀 Submitting to both stores..."
        
        echo "🤖 Submitting to Google Play Store..."
        eas submit --platform android --latest
        
        echo "🍎 Submitting to Apple App Store..."
        eas submit --platform ios --latest
        
        echo "✅ All submissions completed!"
        echo "📋 Check both store consoles for review status"
        ;;
    *)
        echo "❌ Invalid platform. Use: android, ios, or all"
        exit 1
        ;;
esac

echo ""
echo "🎉 SABO Pool Arena submission process completed!"
echo "⏰ App review typically takes:"
echo "   - Google Play: 1-3 days"
echo "   - Apple App Store: 1-7 days"
echo ""
echo "📧 You'll receive email notifications about review status"
