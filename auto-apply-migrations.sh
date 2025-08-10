#!/bin/bash

# Auto-apply Database Migrations Script
# This script will attempt to apply both SPA migrations automatically

echo "🚀 SABO POOL ARENA - Auto-Apply Database Migrations"
echo "==============================================="
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found, attempting automatic migration..."
    
    # Apply migrations
    echo "📋 Applying SPA Challenge System migration..."
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo "✅ Database migrations applied successfully!"
    else
        echo "❌ Automatic migration failed. Please apply manually."
    fi
else
    echo "⚠️  Supabase CLI not found. Please apply migrations manually:"
    echo ""
    echo "Method 1: Supabase Dashboard"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Open SQL Editor"
    echo "3. Copy and run these files:"
    echo "   - supabase/migrations/20250810120000_fix_challenge_spa_only.sql"
    echo "   - supabase/migrations/20250810130000_legacy_spa_points_system.sql"
    echo ""
    echo "Method 2: Install Supabase CLI and run:"
    echo "   npm install -g supabase"
    echo "   supabase login"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo "   supabase db push"
fi

echo ""
echo "📋 Migration files location:"
echo "- SPA Challenge System: supabase/migrations/20250810120000_fix_challenge_spa_only.sql"
echo "- Legacy SPA System: supabase/migrations/20250810130000_legacy_spa_points_system.sql"
echo ""
echo "🎯 After applying migrations, the system will have:"
echo "- Challenge system using SPA points (100-600)"
echo "- Legacy SPA claims for 45 imported players"
echo "- Combined leaderboard functionality"
echo "- One-time claim validation"
echo ""
echo "✅ Ready to proceed with frontend integration!"
