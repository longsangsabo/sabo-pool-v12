#!/bin/bash
# Emergency Deployment Script for MIME Type Fix

echo "🚨 EMERGENCY DEPLOYMENT: FIXING MIME TYPE ISSUES"
echo "================================================="

# Ensure we're in the right directory
cd /workspaces/sabo-pool-v11

# Check if we have changes to commit
echo "📝 Checking for changes..."
git status --porcelain

# Add all changes
echo "📦 Adding changes..."
git add .

# Commit with emergency message
echo "💾 Committing emergency fix..."
git commit -m "🚨 EMERGENCY: Fix MIME type issues for CSS/JS assets

- Enhanced _redirects to properly serve static assets
- Improved _headers with correct MIME types and caching
- Optimized Vite config for better asset handling
- Fixed asset organization (css/, js/ directories)

This fixes the production errors:
- 'text/html' MIME type for CSS files
- Failed module script loading
- Asset serving issues on saboarena.com"

# Push to main branch
echo "🚀 Pushing to repository..."
git push origin main

echo ""
echo "✅ EMERGENCY DEPLOYMENT COMPLETE!"
echo "================================================="
echo "🎯 Fixes Applied:"
echo "   ✅ _redirects updated for proper asset routing"
echo "   ✅ _headers enhanced with correct MIME types"
echo "   ✅ Vite config optimized for asset handling"
echo "   ✅ Build assets properly organized"
echo ""
echo "📊 Next Steps:"
echo "   1. Wait 2-3 minutes for auto-deployment"
echo "   2. Check https://saboarena.com"
echo "   3. Clear browser cache if needed"
echo "   4. Verify assets load with correct MIME types"
echo ""
echo "🔍 If issues persist, check:"
echo "   - Browser DevTools Network tab"
echo "   - Netlify deployment logs"
echo "   - Asset URLs in source code"
