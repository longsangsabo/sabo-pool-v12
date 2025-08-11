#!/usr/bin/env bash
set -euo pipefail

echo "[Verify] Searching for leftover milestone identifiers..."
PATTERNS="spa_milestones spa_reward_milestones player_milestones user_milestone_progress SPAMilestone useSPAMilestones useSPAIntegration"

FAIL=0
for p in $PATTERNS; do
	if grep -R "$p" -n --exclude-dir=node_modules . | grep -v scripts/verify_no_milestones.sh >/dev/null 2>&1; then
		echo "Leftover reference found for pattern: $p"
		FAIL=1
	fi
done

if [ $FAIL -eq 0 ]; then
	echo "[Verify] PASS: No milestone references remain."
else
	echo "[Verify] FAIL: Some milestone references still exist. Review above."
	exit 1
fi
