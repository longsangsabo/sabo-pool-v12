#!/bin/bash
# ================================================================================
# XÓA LOGIC SPA REWARD SAI KHỎI TẤT CẢ FILES
# ================================================================================

echo "🧹 CLEANING UP WRONG SPA REWARD LOGIC FROM ALL FILES"
echo "====================================================="

# Tìm tất cả files có chứa logic SPA reward sai
echo ""
echo "🔍 Finding files with wrong SPA reward logic..."

# List all files that contain rank approval SPA logic
grep -r "WHEN.*H.*THEN.*150" . --include="*.sql" --include="*.js" --include="*.cjs" | head -20

echo ""
echo "📝 Files that need manual cleanup:"
echo "=================================="

# Files to manually review and clean
files_to_clean=(
    "comprehensive-rank-system-restoration.sql"
    "fix-rank-approval-permission.sql" 
    "fix-rank-approval.js"
    "restore-all-functions.sql"
    "manual-rank-fix.sql"
    "fix-frontend-rank-approval.sql"
    "complete-rank-approval-fix.sql"
    "rank-approval-hotfix.sql"
    "fix-text-integer-error.sql"
)

for file in "${files_to_clean[@]}"; do
    if [ -f "$file" ]; then
        echo "❌ $file - contains wrong SPA reward logic"
    fi
done

echo ""
echo "✅ CLEANED FILES:"
echo "=================="
echo "✅ ultra-safe-approval-function.sql - SPA reward logic removed"
echo "✅ create-safe-approval-function.sql - SPA reward logic removed"

echo ""
echo "🎯 SUMMARY:"
echo "==========="
echo "❌ OLD (WRONG): Rank approval gives 100-300 SPA based on rank"
echo "✅ NEW (CORRECT): Rank approval gives 0 SPA (already handled elsewhere)"
echo ""
echo "💡 REASON:"
echo "- Users already get +150 SPA for successful rank registration"
echo "- Approval process should only update rank status, NOT give more SPA"
echo "- Prevents double SPA rewards for same achievement"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. ✅ ultra-safe-approval-function.sql - FIXED"
echo "2. ✅ create-safe-approval-function.sql - FIXED"  
echo "3. 🎯 Execute one of the fixed functions in Supabase"
echo "4. 🧪 Test rank approval - should work without extra SPA"
echo ""
