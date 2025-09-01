#!/bin/bash

# 📊 DAILY MIGRATION PROGRESS TRACKER
# Run this script daily to track migration progress

echo "🎯 SERVICE MIGRATION PROGRESS TRACKER"
echo "Date: $(date)"
echo "========================================"

# Overall progress
total_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "📈 OVERALL PROGRESS:"
echo "Files with direct supabase calls: $total_files / 158 (baseline)"

# Calculate percentage
if [ $total_files -eq 0 ]; then
    percentage=100
else
    percentage=$(echo "scale=1; (158 - $total_files) * 100 / 158" | bc -l)
fi
echo "Migration progress: ${percentage}% completed"

echo ""
echo "🔍 BREAKDOWN BY CATEGORY:"

# Auth/User files
auth_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*auth*" -o -path "*user*" -o -path "*profile*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Auth/User files: $auth_files"

# Tournament files  
tournament_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*tournament*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Tournament files: $tournament_files"

# Payment files
payment_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*payment*" -o -path "*wallet*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Payment/Wallet files: $payment_files"

# Club files
club_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*club*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Club files: $club_files"

# Challenge/Ranking files
challenge_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*challenge*" -o -path "*ranking*" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Challenge/Ranking files: $challenge_files"

# Utils directory
utils_files=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*.ts" | xargs grep -l "supabase\." 2>/dev/null | wc -l)
echo "Utils directory: $utils_files"

echo ""
echo "🏗️ SERVICE INFRASTRUCTURE:"

# Service count
service_count=$(find /workspaces/sabo-pool-v12/packages/shared-business/src -name "*Service.ts" | wc -l)
echo "Created services: $service_count"

# Components using services
components_using_services=$(find /workspaces/sabo-pool-v12/apps/sabo-user/src/components -name "*.tsx" | xargs grep -l "from.*shared-business" 2>/dev/null | wc -l)
echo "Components using services: $components_using_services"

echo ""
echo "🎯 WEEKLY TARGETS:"

# Week 1 target
if [ $total_files -le 130 ] && [ $total_files -gt 80 ]; then
    echo "✅ Week 1 target reached: ≤130 files"
elif [ $total_files -le 80 ] && [ $total_files -gt 30 ]; then
    echo "✅ Week 2 target reached: ≤80 files"  
elif [ $total_files -le 30 ] && [ $total_files -gt 0 ]; then
    echo "✅ Week 3 target reached: ≤30 files"
elif [ $total_files -eq 0 ]; then
    echo "🎉 MIGRATION COMPLETE: 0 files with direct supabase calls!"
else
    echo "🔄 Working towards Week 1 target: ≤130 files"
fi

echo ""
echo "📋 NEXT ACTIONS:"

if [ $total_files -gt 130 ]; then
    echo "Focus on Auth/User migration (Week 1)"
    echo "Priority files to migrate:"
    find /workspaces/sabo-pool-v12/apps/sabo-user/src/utils -name "*auth*" -o -name "*user*" | head -5
elif [ $total_files -gt 80 ]; then
    echo "Focus on Tournament/Payment migration (Week 2)"
    echo "Priority files to migrate:"
    find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*tournament*" -o -path "*payment*" | xargs grep -l "supabase\." 2>/dev/null | head -5
elif [ $total_files -gt 30 ]; then
    echo "Focus on Club/Challenge migration (Week 3)"
    echo "Priority files to migrate:"
    find /workspaces/sabo-pool-v12/apps/sabo-user/src -path "*club*" -o -path "*challenge*" | xargs grep -l "supabase\." 2>/dev/null | head -5
elif [ $total_files -gt 0 ]; then
    echo "Final cleanup (Week 4)"
    echo "Remaining files to migrate:"
    find /workspaces/sabo-pool-v12/apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\." 2>/dev/null | head -5
else
    echo "🎉 Migration complete! Ready for mobile development!"
fi

echo ""
echo "⚠️  VALIDATION COMMAND:"
echo "find /workspaces/sabo-pool-v12/apps/sabo-user/src -name \"*.ts\" -o -name \"*.tsx\" | xargs grep -l \"supabase\.\" | wc -l"
echo "Must be 0 for successful completion!"

echo ""
echo "========================================"
