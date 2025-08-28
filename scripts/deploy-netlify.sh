#!/bin/bash

# Netlify deployment script for SABO Arena
echo "🚀 Starting Netlify deployment process..."

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build applications
echo "🔨 Building applications..."
pnpm build:packages
pnpm build:user
pnpm build:admin

# Deploy user app (main site)
echo "🌐 Deploying User App..."
cd apps/sabo-user
netlify deploy --prod --dir dist --message "Deploy user app $(date)"
cd ../..

# Deploy admin app (separate site - requires manual setup)
echo "🔐 Admin app ready for deployment..."
echo "📋 Admin build is ready in apps/sabo-admin/dist"
echo "ℹ️  You'll need to create a separate Netlify site for the admin app"

echo "✅ Deployment process completed!"
