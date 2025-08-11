#!/usr/bin/env bash
set -euo pipefail

echo "[Milestone Nuclear Cleanup] Starting..."
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Removing milestone related frontend components & hooks..."
rm -f src/components/SPAMilestones.tsx || true
rm -f src/components/milestones/MilestoneCard.tsx || true
rm -f src/components/milestones/MilestonesList.tsx || true
if [ -d src/components/milestones ]; then rmdir src/components/milestones 2>/dev/null || true; fi

echo "Removing milestone related hooks..."
rm -f src/hooks/useSPAMilestones.tsx || true
rm -f src/hooks/useSPAIntegration.ts || true
rm -f src/hooks/useSPA.ts || true

echo "Removing milestone test pages if any..."
rm -f src/pages/SPADashboard.tsx || true
rm -f src/pages/SPATestPage.tsx || true

echo "Scrubbing imports referencing removed hooks/components (basic grep guidance):"
grep -R "useSPAMilestones\|SPAMilestones\|useSPAIntegration\|useSPA(" -n src || true

echo "Done initial file removal. Run scripts/verify_no_milestones.sh after commit."
