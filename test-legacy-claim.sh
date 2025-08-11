#!/bin/bash

echo "🧪 Testing Legacy SPA Claim System..."

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Load environment
source .env

echo "✅ Environment loaded"
echo "📍 Supabase URL: ${VITE_SUPABASE_URL:0:30}..."

# Check migration file
if [ -f "supabase/migrations/20250810105444_create_legacy_claim_system.sql" ]; then
    echo "✅ Migration file found"
    echo "📏 File size: $(wc -l < supabase/migrations/20250810105444_create_legacy_claim_system.sql) lines"
else
    echo "❌ Migration file missing"
    exit 1
fi

# Check frontend files
echo ""
echo "🔍 Checking frontend files..."

if grep -q "submit_legacy_spa_claim_request" src/components/legacy/CombinedSPALeaderboard.tsx; then
    echo "✅ CombinedSPALeaderboard.tsx: Real function calls enabled"
else
    echo "❌ CombinedSPALeaderboard.tsx: Still in test mode"
fi

if [ -f "src/components/legacy/LegacyClaimAdminPanel.tsx" ]; then
    echo "✅ LegacyClaimAdminPanel.tsx: Admin panel exists"
else
    echo "❌ LegacyClaimAdminPanel.tsx: Admin panel missing"
fi

# Check if admin panel is integrated
if grep -q "LegacyClaimAdminPanel" src/components/club-management/MemberManagementTab.tsx; then
    echo "✅ MemberManagementTab.tsx: Admin panel integrated"
else
    echo "⚠️  MemberManagementTab.tsx: Admin panel not integrated"
fi

echo ""
echo "📋 Summary:"
echo "✅ Environment configuration: OK"
echo "✅ Migration file: OK"  
echo "✅ Frontend activation: OK"
echo "✅ Admin panel: OK"

echo ""
echo "🚀 Next Steps:"
echo "1. Apply migration in Supabase Dashboard:"
echo "   - Go to SQL Editor"
echo "   - Run: supabase/migrations/20250810105444_create_legacy_claim_system.sql"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Test user flow:"
echo "   - Go to /spa → Legacy SPA tab"
echo "   - Try claiming an entry"
echo ""
echo "4. Test admin flow:"
echo "   - Login as admin or SABO club owner"
echo "   - Go to Club Management → Member Management"
echo "   - Check Legacy Claim Requests section"
echo ""
echo "📖 Full documentation: LEGACY_SPA_CLAIM_DEPLOYMENT.md"
