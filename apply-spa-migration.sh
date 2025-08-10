#!/bin/bash

# SPA System Database Migration Application Script
# This script applies the SPA challenge system migration

echo "🚀 SABO POOL ARENA - SPA Challenge System Migration"
echo "=================================================="
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250810120000_fix_challenge_spa_only.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
	echo "❌ Migration file not found: $MIGRATION_FILE"
	exit 1
fi

echo "✅ Found migration file: $MIGRATION_FILE"
echo ""

# Display migration summary
echo "📋 Migration Summary:"
echo "- Converts challenge system from ELO to SPA points"
echo "- Updates challenge_results table structure"
echo "- Creates SPA point calculation functions"
echo "- Removes old ELO calculation functions"
echo "- Updates process_challenge_result function"
echo ""

# Instructions for manual application
echo "🔧 To apply this migration:"
echo ""
echo "Method 1: Using Supabase Dashboard"
echo "1. Open your Supabase project dashboard"
echo "2. Go to SQL Editor"
echo "3. Copy and paste the contents of:"
echo "   $MIGRATION_FILE"
echo "4. Run the SQL query"
echo ""

echo "Method 2: Using Supabase CLI (when available)"
echo "1. Install Supabase CLI:"
echo "   npm install supabase@latest"
echo "2. Login to Supabase:"
echo "   npx supabase login"
echo "3. Link your project:"
echo "   npx supabase link --project-ref YOUR_PROJECT_REF"
echo "4. Apply migrations:"
echo "   npx supabase db push"
echo ""

echo "Method 3: Using psql (direct database connection)"
echo "1. Get your database connection string from Supabase dashboard"
echo "2. Run: psql 'YOUR_CONNECTION_STRING' -f $MIGRATION_FILE"
echo ""

# Display migration file content preview
echo "📄 Migration File Preview (first 20 lines):"
echo "----------------------------------------"
head -20 "$MIGRATION_FILE"
echo "----------------------------------------"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "- This migration will modify challenge system behavior"
echo "- Backup your database before applying"
echo "- Test in staging environment first"
echo "- Challenges will use SPA points instead of ELO for betting"
echo ""

echo "🎯 After migration:"
echo "- Challenge betting will use SPA points only"
echo "- ELO points remain for skill display and tournaments"
echo "- Fixed betting amounts: 100, 200, 300, 400, 500, 600 SPA"
echo ""

echo "✅ Migration script ready for application!"
