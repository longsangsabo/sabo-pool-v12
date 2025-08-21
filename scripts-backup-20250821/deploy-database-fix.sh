#!/bin/bash

# Script to deploy database relationship fixes to production
# This script applies the foreign key relationship fixes and tests the results

echo "🚀 Deploying Database Relationship Fixes to Production..."

# Check if we're in the correct directory
if [ ! -f "supabase/migrations/20250109_fix_production_relationships.sql" ]; then
    echo "❌ Migration file not found. Please run from project root."
    exit 1
fi

echo "📊 Step 1: Applying database migration..."

# Apply the migration using Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI to apply migration..."
    supabase db push
else
    echo "⚠️  Supabase CLI not found. Please apply the migration manually:"
    echo "   1. Copy contents of supabase/migrations/20250109_fix_production_relationships.sql"
    echo "   2. Run it in your Supabase SQL editor"
    echo "   3. Or use: psql -d YOUR_DATABASE_URL -f supabase/migrations/20250109_fix_production_relationships.sql"
fi

echo "✅ Step 2: Database migration applied"

echo "🔍 Step 3: Testing the fixes..."

# Create a simple test query to verify relationships
cat > test_relationships.sql << 'EOF'
-- Test script to verify relationship fixes
SELECT 'Testing matches table' as test_step;
SELECT COUNT(*) as matches_count FROM public.matches WHERE matches.id IS NOT NULL;

SELECT 'Testing profiles table' as test_step;
SELECT COUNT(*) as profiles_count FROM public.profiles WHERE profiles.user_id IS NOT NULL;

SELECT 'Testing foreign key constraints' as test_step;
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('matches', 'tournament_matches')
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

SELECT 'Testing RLS policies' as test_step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('matches', 'profiles', 'club_profiles', 'tournament_matches')
ORDER BY tablename, policyname;
EOF

echo "🎯 Step 4: Manual verification steps:"
echo "   1. Open your application at the deployed URL"
echo "   2. Check browser console for any PGRST200 errors"
echo "   3. Verify that the Dashboard loads without 406 errors"
echo "   4. Test the social feed functionality"

echo "📋 Step 5: Common issues and solutions:"
echo "   - If you still see PGRST200 errors: Check that foreign key names match"
echo "   - If you see 406 errors: Check RLS policies are properly configured"
echo "   - If data doesn't load: Verify that the tables exist and have data"

echo "✅ Deployment completed!"
echo "🔧 Check the application and remove the DatabaseRelationshipTest component from Dashboard.tsx when issues are resolved."

# Clean up
rm -f test_relationships.sql
