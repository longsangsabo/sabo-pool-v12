#!/bin/bash

# 10X ACCELERATION BATCH MIGRATION SCRIPT
# Target: Reduce 139 → 8 files (131 file reduction needed)

echo "🚀 STARTING 10X ACCELERATION BATCH MIGRATION"
echo "Current: 139 files with supabase calls"
echo "Target: ≤8 files (95%+ service abstraction)"
echo ""

cd /workspaces/sabo-pool-v12/apps/sabo-user

# Phase 1: Identify simple single-operation components
echo "PHASE 1: IDENTIFYING SIMPLE MIGRATION TARGETS"
find src/components -name "*.tsx" | xargs grep -l "supabase\.from.*single()" | head -20 > /tmp/simple_components.txt
find src/hooks -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\.from.*single()" | head -10 >> /tmp/simple_components.txt

echo "Found $(wc -l < /tmp/simple_components.txt) simple migration targets"

# Phase 2: Identify single RPC call files
echo "PHASE 2: IDENTIFYING RPC MIGRATION TARGETS"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\.rpc" | grep -v Service > /tmp/rpc_components.txt
echo "Found $(wc -l < /tmp/rpc_components.txt) RPC migration targets"

# Phase 3: Identify auth-only files  
echo "PHASE 3: IDENTIFYING AUTH-ONLY TARGETS"
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase\.auth" | grep -v Service > /tmp/auth_components.txt
echo "Found $(wc -l < /tmp/auth_components.txt) auth-only migration targets"

# Phase 4: Count total migration potential
TOTAL_TARGETS=$(($(wc -l < /tmp/simple_components.txt) + $(wc -l < /tmp/rpc_components.txt) + $(wc -l < /tmp/auth_components.txt)))
echo ""
echo "📊 MIGRATION POTENTIAL ANALYSIS:"
echo "Simple components: $(wc -l < /tmp/simple_components.txt)"
echo "RPC components: $(wc -l < /tmp/rpc_components.txt)" 
echo "Auth components: $(wc -l < /tmp/auth_components.txt)"
echo "Total targets: $TOTAL_TARGETS"
echo "Remaining gap: $((139 - TOTAL_TARGETS)) files need advanced migration"

# Phase 5: Show top priority files
echo ""
echo "🎯 TOP PRIORITY MIGRATION TARGETS:"
echo "=== Simple Components ==="
head -10 /tmp/simple_components.txt

echo ""
echo "=== RPC Components ==="
head -5 /tmp/rpc_components.txt

echo ""
echo "=== Auth Components ==="
head -5 /tmp/auth_components.txt

# Cleanup
rm -f /tmp/simple_components.txt /tmp/rpc_components.txt /tmp/auth_components.txt

echo ""
echo "🚀 READY FOR MEGA BATCH MIGRATION!"
echo "Execute migrations on these high-priority targets for maximum impact."
