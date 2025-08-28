#!/bin/bash

# 🔧 SABO Admin Environment Setup Script
# Giải quyết vấn đề admin app không load được Supabase config

echo "🚀 Setting up SABO Admin environment..."

# Check if we're in the correct directory
if [ ! -f "apps/sabo-admin/package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create admin .env if it doesn't exist
if [ ! -f "apps/sabo-admin/.env" ]; then
    echo "📄 Creating admin .env file..."
    cp apps/sabo-admin/.env.example apps/sabo-admin/.env
    echo "✅ Admin .env created from .env.example"
else
    echo "✅ Admin .env already exists"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   cd apps/sabo-admin && pnpm dev"
echo ""
echo "🌐 Admin will be available at: http://localhost:8081"
