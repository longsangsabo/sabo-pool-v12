#!/bin/bash

# 🧹 CHALLENGE SYSTEM CLEANUP SCRIPT
# Dọn dẹp các file cũ không còn đúng để tránh tham chiếu sai

echo "🧹 CHALLENGE SYSTEM CLEANUP - STARTING..."
echo "================================================"

# Tạo thư mục archive cho các file cũ
mkdir -p archive/deprecated-challenge-files

echo "📁 Created archive directory for deprecated files"

# Danh sách các file cũ cần di chuyển vào archive
deprecated_files=(
    "CHALLENGE_SYSTEM_README.md"
    "CHALLENGE_SYSTEM_COMPLETE_DOCUMENTATION.md"
    "REBUILD_CHALLENGE_SYSTEM_PLAN.md"
    "CHALLENGE_NOTIFICATION_SYSTEM_DESIGN.md"
    "CHALLENGE_NOTIFICATION_COMPLETE.md"
    "CHALLENGES_V3_PRODUCTION_DEPLOYMENT.md"
    "AUTO_EXPIRE_CHALLENGE_TEST.md"
    "MOBILE_CHALLENGE_OPTIMIZATIONS.md"
    "STEP1_ANALYZE_EXISTING_FUNCTIONS.sql"
    "STEP2_DROP_ALL_FUNCTIONS.sql"
    "STEP2_5_SPA_MANAGEMENT_SYSTEM.sql"
    "STEP2_5_SPA_MANAGEMENT_FIXED.sql"
    "STEP2_5_SPA_MANAGEMENT_CORRECTED.sql"
    "STEP3_CLUB_APPROVAL_SYSTEM.sql"
    "STEP3_CLUB_APPROVAL_FUNCTIONS.sql"
    "STEP3_CLUB_APPROVAL_CORRECTED.sql"
    "STEP3_CREATE_SPA_FUNCTIONS.sql"
    "STEP4_MATCH_MANAGEMENT_SYSTEM.sql"
    "STEP4_MATCH_MANAGEMENT_CORRECTED.sql"
    "STEP4_CREATE_CHALLENGE_FUNCTIONS.sql"
    "STEP5_CLUB_APPROVAL_SYSTEM.sql"
    "STEP5_NOTIFICATION_SYSTEM.sql"
    "STEP5_NOTIFICATION_CORRECTED.sql"
    "STEP6_TRIGGERS_AUTOMATION_CORRECTED.sql"
    "COMPLETE_CLEANUP_ALL_FUNCTIONS.sql"
    "CORRECT_DROP_FUNCTIONS.sql"
    "SAFE_CLEANUP_APPROACH.sql"
    "MANUAL_EXECUTION_CLEANUP.sql"
    "MANUAL_STEP1_DROP_OLD_FUNCTIONS.sql"
    "CREATE_accept_open_challenge_v3.sql"
    "FIX_accept_open_challenge_v3.sql"
    "SIMPLE_ACCEPT_CHALLENGE_V3.sql"
    "TEST_SINGLE_FUNCTION.sql"
    "EXECUTE_IN_SUPABASE.sql"
    "FINAL_FIX_SPA_COLUMN.sql"
    "FIX_STATUS_CHECK.sql"
    "CHECK_FUNCTION_SIGNATURES.sql"
    "fix-accept-open-challenge.sql"
    "fix-accept-open-challenge-response.sql"
    "debug-triggers.cjs"
    "debug-triggers-simple.cjs"
    "execute-rebuild.cjs"
    "find-challenger-rank-error.cjs"
    "fix-accept-challenge-function.cjs"
    "fix-accept-challenge-function.js"
    "fix-function-v2.cjs"
    "quick-fix.cjs"
    "test-challenge-system.cjs"
    "test-challenge-workflow.cjs"
)

# Di chuyển các file deprecated vào archive
moved_count=0
for file in "${deprecated_files[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "archive/deprecated-challenge-files/"
        echo "📦 Moved: $file"
        ((moved_count++))
    fi
done

echo ""
echo "✅ Moved $moved_count deprecated files to archive"

# Tạo file README trong archive để giải thích
cat > archive/deprecated-challenge-files/README.md << 'EOF'
# 📦 DEPRECATED CHALLENGE SYSTEM FILES

**⚠️ WARNING**: These files are deprecated and should NOT be used for reference.

## Why these files are here:
- These files represent old versions of the Challenge System
- They contain outdated logic and incorrect implementations
- Using these files may cause confusion and system errors

## Current Official Documentation:
- **CHALLENGE_SYSTEM_OFFICIAL_DOCUMENTATION.md** (in root directory)
- This is the ONLY file that should be referenced for current system behavior

## What happened to these files:
- Moved here on August 24, 2025 during system cleanup
- Part of Challenge System v3.0 finalization
- Kept for historical reference only

## If you need to reference old behavior:
- Check git history for detailed change logs
- Use the official documentation for current implementation
- Contact the development team for specific questions

---

*🏆 The current Challenge System v3.0 is fully operational and documented in the root directory.*
EOF

echo "📝 Created README in archive directory"

# Kiểm tra các file quan trọng còn lại
echo ""
echo "🔍 REMAINING IMPORTANT FILES:"
echo "================================"

important_files=(
    "CHALLENGE_SYSTEM_OFFICIAL_DOCUMENTATION.md"
    "FIX_CHALLENGE_WORKFLOW.sql"
    "CHECK_CHALLENGES_SCHEMA.sql" 
    "fix-spa-issue.cjs"
)

for file in "${important_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ KEPT: $file (IMPORTANT - DO NOT REMOVE)"
    else
        echo "❌ MISSING: $file (SHOULD EXIST)"
    fi
done

echo ""
echo "🎯 CLEANUP SUMMARY:"
echo "==================="
echo "✅ Created official documentation: CHALLENGE_SYSTEM_OFFICIAL_DOCUMENTATION.md"
echo "✅ Moved $moved_count deprecated files to archive/"
echo "✅ Kept essential files for system operation"
echo "✅ Added README to explain deprecated files"
echo ""
echo "🏆 Challenge System cleanup completed successfully!"
echo "📖 Use CHALLENGE_SYSTEM_OFFICIAL_DOCUMENTATION.md as the single source of truth"

# Tạo file .gitignore cho thư mục archive nếu chưa có
if [ ! -f "archive/.gitignore" ]; then
    echo "# Archive directory - deprecated files for reference only" > archive/.gitignore
fi

echo ""
echo "🔐 Added .gitignore to archive directory"
echo "================================================"
echo "🧹 CHALLENGE SYSTEM CLEANUP - COMPLETED!"
