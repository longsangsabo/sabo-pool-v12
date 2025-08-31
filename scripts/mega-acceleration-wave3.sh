#!/bin/bash

# MEGA ACCELERATION WAVE 3 - RPC & Complex Operations
echo "🔥 MEGA ACCELERATION WAVE 3"
cd /workspaces/sabo-pool-v12/apps/sabo-user

echo "Finding RPC calls for batch migration..."
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "supabase\.rpc" | head -20 > /tmp/rpc_files.txt

echo "Found $(wc -l < /tmp/rpc_files.txt) files with RPC calls:"
cat /tmp/rpc_files.txt

echo ""
echo "Finding simple FROM queries for rapid migration..."
find src -name "*.tsx" | xargs grep -l "supabase\.from.*select.*single" | head -15 > /tmp/simple_queries.txt

echo "Found $(wc -l < /tmp/simple_queries.txt) files with simple queries:"
cat /tmp/simple_queries.txt

echo ""
echo "Creating advanced migration targets list..."
{
  cat /tmp/rpc_files.txt
  cat /tmp/simple_queries.txt
} | sort | uniq > /tmp/wave3_targets.txt

echo "WAVE 3 TARGETS: $(wc -l < /tmp/wave3_targets.txt) files"
echo "Top 10 priority targets:"
head -10 /tmp/wave3_targets.txt

# Clean up
rm -f /tmp/rpc_files.txt /tmp/simple_queries.txt /tmp/wave3_targets.txt

echo ""
echo "⚡ READY FOR WAVE 3 MEGA BATCH MIGRATION!"
