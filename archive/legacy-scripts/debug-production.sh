#!/bin/bash
# Debug script for production challenge creation issues

echo "🔍 Challenge Creation Production Debug Script"
echo "=============================================="

# Check environment variables
echo "📋 Environment Variables:"
echo "NODE_ENV: $NODE_ENV"
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# Check current git status
echo ""
echo "📂 Git Status:"
git status --porcelain

# Check if .env file exists
echo ""
echo "🔧 Configuration Files:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    echo "Contains $(wc -l < .env) lines"
else
    echo "❌ .env file missing"
fi

if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "❌ .env.example missing"
fi

# Check Supabase client configuration
echo ""
echo "🗄️ Supabase Client Check:"
grep -n "SUPABASE_URL\|SUPABASE_PUBLISHABLE_KEY" src/integrations/supabase/client.ts | head -5

# Check for recent challenge-related migrations
echo ""
echo "📊 Recent Challenge Migrations:"
ls -la supabase/migrations/ | grep "challenge" | tail -5

echo ""
echo "🎯 Next Steps for Production Debug:"
echo "1. Compare this environment with production"
echo "2. Check Supabase dashboard for RLS policies"
echo "3. Verify authentication tokens"
echo "4. Review database constraints and triggers"
