#!/bin/bash
echo "🚨 EMERGENCY ROLLBACK: Fixing automated cleanup damage"
echo "====================================================="

# Reset to state before automated cleanup
git stash push -m "emergency-stash-before-rollback"
git reset --hard HEAD~1

echo "✅ Rollback complete!"
echo "📊 Checking TypeScript errors after rollback:"
pnpm type-check 2>&1 | grep "error TS" | wc -l
