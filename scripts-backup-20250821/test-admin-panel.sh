#!/bin/bash

# 🚀 LEGACY CLAIM SYSTEM - FULL TEST SCRIPT
echo "🔧 LEGACY CLAIM SYSTEM - TESTING ADMIN PANEL VISIBILITY"
echo "=================================================="

# Check if dev server is running
if curl -s http://localhost:8081 > /dev/null; then
    echo "✅ Dev server is running on http://localhost:8081"
else
    echo "❌ Dev server is not running. Please start with: npm run dev"
    exit 1
fi

echo ""
echo "📋 TEST CHECKLIST:"
echo "=================="

# 1. Check admin panel exists
if [ -f "src/components/legacy/LegacyClaimAdminPanel.tsx" ]; then
    echo "✅ Admin panel component exists"
else
    echo "❌ Admin panel component missing"
    exit 1
fi

# 2. Check admin page exists
if [ -f "src/pages/LegacyClaimAdminPage.tsx" ]; then
    echo "✅ Admin page exists"
else
    echo "❌ Admin page missing"
    exit 1
fi

# 3. Check route is added
if grep -q "legacy-claim-admin" src/App.tsx; then
    echo "✅ Route is added to App.tsx"
else
    echo "❌ Route missing in App.tsx"
    exit 1
fi

# 4. Check import is added
if grep -q "LegacyClaimAdminPage" src/App.tsx; then
    echo "✅ Import is added to App.tsx"
else
    echo "❌ Import missing in App.tsx"
    exit 1
fi

echo ""
echo "🌐 TESTING URLS:"
echo "================"
echo "👤 User Claim Page:   http://localhost:8081/spa"
echo "🛡️  Admin Panel:       http://localhost:8081/legacy-claim-admin"
echo "📊 Club Management:   http://localhost:8081/club-management (for authorized users)"

echo ""
echo "🔍 STEPS TO TEST:"
echo "=================="
echo "1. 👤 Go to http://localhost:8081/spa"
echo "   - Login as a regular user"
echo "   - Click 'Claim' on any legacy entry"
echo "   - Submit with phone number"
echo "   - Should see success message"

echo ""
echo "2. 🛡️  Go to http://localhost:8081/legacy-claim-admin"
echo "   - Login as admin or SABO club owner"
echo "   - Should see pending claim requests"
echo "   - Can approve/reject claims"

echo ""
echo "3. 📊 Alternative: http://localhost:8081/club-management"
echo "   - For SABO admin/club owners only"
echo "   - Scroll down to 'Legacy Claim Management' section"

echo ""
echo "🐛 TROUBLESHOOTING:"
echo "==================="
echo "❌ If admin panel shows 'No permission':"
echo "   - Make sure user has is_admin = true in profiles table, OR"
echo "   - User owns a club with name containing 'SABO', 'SBO', or 'POOL ARENA'"

echo ""
echo "❌ If no pending claims visible:"
echo "   - Submit a claim first from /spa page"
echo "   - Check database: SELECT * FROM legacy_spa_claim_requests;"

echo ""
echo "❌ If database functions not found:"
echo "   - Apply migration: supabase/migrations/20250810105444_create_legacy_claim_system.sql"
echo "   - In Supabase Dashboard SQL Editor"

echo ""
echo "✅ Ready to test! Open the URLs above and follow the steps."
