#!/bin/bash

# Deploy Legacy SPA Direct Code Claim System
# This script applies the migrations to fix the claim code system

echo "🚀 Deploying Legacy SPA Direct Code Claim System..."
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "📋 Migrations to apply:"
echo "  1. Add spa_points column to profiles table"
echo "  2. Create claim_legacy_spa_points function"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled."
    exit 1
fi

echo "🔗 Connecting to Supabase..."

# Apply migrations
echo "📦 Applying migration: Add spa_points to profiles..."
supabase db push --file supabase/migrations/20250812000001_add_spa_points_to_profiles.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration 1 applied successfully"
else
    echo "❌ Migration 1 failed"
    exit 1
fi

echo "📦 Applying migration: Create claim function..."
supabase db push --file supabase/migrations/20250812000002_create_claim_legacy_spa_points_function.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration 2 applied successfully"
else
    echo "❌ Migration 2 failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 What was deployed:"
echo "  ✅ Added spa_points column to profiles table"
echo "  ✅ Created claim_legacy_spa_points(p_claim_code) function"
echo "  ✅ Added indexes and permissions"
echo ""
echo "🧪 To test the system:"
echo "  1. Go to Legacy SPA Dashboard"
echo "  2. Click 'Claim' next to any legacy player"
echo "  3. Enter a valid claim code (e.g., 'LEGACY-01-NGR')"
echo "  4. SPA points should be added to your profile"
echo ""
echo "🔍 To verify deployment:"
echo "  npm run check-legacy"
echo ""
