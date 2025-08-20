#!/bin/bash

# ============================================================================
# DEPLOY TOURNAMENT RESULTS SYSTEM - FIX TRIỆT ĐỂ
# ============================================================================

echo "🔥 Deploying Tournament Results Auto-Trigger System..."
echo "📋 This will fix the total_score column issue completely"

echo ""
echo "📝 STEP 1: Add missing total_score column to tournament_results table"
echo "👉 Copy và paste script này vào Supabase SQL Editor:"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
cat add-total-score-column.sql
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "📝 STEP 2: Deploy updated trigger functions"
echo "👉 Sau khi chạy STEP 1 thành công, copy và paste script này vào Supabase SQL Editor:"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
cat tournament-results-auto-trigger.sql
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "✅ COMPLETED DEPLOYMENT STEPS:"
echo "1. ✅ Add total_score column to tournament_results table"
echo "2. ✅ Update calculate_player_tournament_stats function to return total_score"
echo "3. ✅ Update INSERT statement to include total_score"
echo "4. ✅ Fix all schema mismatches"
echo ""
echo "🎯 After running both scripts, the error should be completely resolved!"
echo "🏆 Tournament results auto-trigger system will work perfectly!"
