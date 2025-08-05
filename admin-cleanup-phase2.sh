#!/bin/bash
# Admin Cleanup Phase 2 - Safe Duplicate Removal
# This script removes ONLY confirmed duplicate pages

echo "🧹 ADMIN CLEANUP PHASE 2: SAFE DUPLICATE REMOVAL"
echo "================================================="

# Create list of files to remove (duplicates only)
DUPLICATES=(
  "src/pages/admin/AdminUsersPage.tsx"
  "src/pages/admin/AdminTournamentsPage.tsx" 
  "src/pages/admin/AdminClubsPage.tsx"
  "src/pages/admin/AdminAnalyticsPage.tsx"
  "src/pages/admin/AdminSettingsPage.tsx"
  "src/pages/admin/OptimizedAdminUsers.tsx"
  "src/pages/admin/AdminTestRanking.tsx"
  "src/pages/admin/AdminApprovedClubs.tsx"
)

# Test/Draft pages (optional removal)
DRAFT_PAGES=(
  "src/pages/admin/AdminMonitoringPage.tsx"
)

echo "📋 Files marked for removal (DUPLICATES ONLY):"
for file in "${DUPLICATES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ❌ $file (duplicate)"
  else
    echo "  ⚠️  $file (not found)"
  fi
done

echo ""
echo "📋 Optional draft pages:"
for file in "${DRAFT_PAGES[@]}"; do
  if [ -f "$file" ]; then
    echo "  🟡 $file (draft/testing)"
  else
    echo "  ⚠️  $file (not found)"
  fi
done

echo ""
echo "✅ SAFETY CHECK: Pages that will be KEPT:"
KEEP_PAGES=(
  "src/pages/admin/AdminDashboard.tsx"
  "src/pages/admin/AdminUsers.tsx"
  "src/pages/admin/AdminTournaments.tsx"
  "src/pages/admin/AdminClubs.tsx"
  "src/pages/admin/AdminAnalytics.tsx"
  "src/pages/admin/AdminSettings.tsx"
  "src/pages/admin/AdminAutomation.tsx"
  "src/pages/admin/AdminDatabase.tsx"
  "src/pages/admin/AdminDevelopment.tsx"
  "src/pages/admin/AdminGameConfig.tsx"
  "src/pages/admin/AdminPayments.tsx"
  "src/pages/admin/AdminAIAssistant.tsx"
)

for file in "${KEEP_PAGES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file (ACTIVE - will be kept)"
  else
    echo "  ⚠️  $file (MISSING - check if needed)"
  fi
done

echo ""
echo "🎯 Ready to proceed with cleanup?"
echo "   Run: ./admin-cleanup-execute.sh"
echo ""
echo "🔒 SAFETY: All files backed up in .admin-cleanup-backup/"
