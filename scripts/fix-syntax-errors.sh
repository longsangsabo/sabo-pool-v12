#!/bin/bash

# COMPREHENSIVE SYNTAX ERROR FIXER
# Fix all Phase 7 migration syntax errors

set -e

WORKSPACE_ROOT="/workspaces/sabo-pool-v12"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🔧 COMPREHENSIVE SYNTAX ERROR FIXER${NC}"
echo "====================================="

# Fix 1: Typography variants
echo -e "${BLUE}1. Fixing Typography variants...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h1"/variant="heading"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h2"/variant="heading"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h3"/variant="title"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h4"/variant="title"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h5"/variant="body-large"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="h6"/variant="body"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="p"/variant="body"/g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/variant="span"/variant="body"/g' {} \;
echo -e "${GREEN}✅ Typography variants fixed${NC}"

# Fix 2: Mismatched tags - convert Typography back to HTML where needed
echo -e "${BLUE}2. Fixing mismatched HTML/Typography tags...${NC}"

# Fix <p> with </Typography> closing tags
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|<p \([^>]*\)>\([^<]*\)</Typography>|<p \1>\2</p>|g' {} \;

# Fix <Typography> with </span> closing tags  
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|<Typography variant="body">\([^<]*\)</span>|<span>\1</span>|g' {} \;

echo -e "${GREEN}✅ Mismatched tags fixed${NC}"

# Fix 3: Button tag mismatches
echo -e "${BLUE}3. Fixing Button tag mismatches...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|<button \([^>]*\)>\([^<]*\)</Button>|<button \1>\2</button>|g' {} \;
echo -e "${GREEN}✅ Button tags fixed${NC}"

# Fix 4: Card tag mismatches
echo -e "${BLUE}4. Fixing Card tag mismatches...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|<Card>\([^<]*\)</div>|<Card>\1</Card>|g' {} \;
echo -e "${GREEN}✅ Card tags fixed${NC}"

# Fix 5: CSS syntax errors
echo -e "${BLUE}5. Fixing CSS syntax errors...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's/bg-gray-900,/var(--color-gray-900)/g' {} \;
echo -e "${GREEN}✅ CSS syntax fixed${NC}"

# Fix 6: Remove duplicate imports
echo -e "${BLUE}6. Cleaning up duplicate imports...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i '/import { Typography } from.*shared-ui.*Typography.*Typography/d' {} \;
echo -e "${GREEN}✅ Duplicate imports removed${NC}"

# Fix 7: Import path issues
echo -e "${BLUE}7. Fixing import path issues...${NC}"
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|@/packages/shared-ui|@sabo/shared-ui|g' {} \;
find "$WORKSPACE_ROOT" -name "*.tsx" -exec sed -i 's|from "../../../.*shared-ui.*Typography.*";|from "@sabo/shared-ui";|g' {} \;
echo -e "${GREEN}✅ Import paths fixed${NC}"

echo -e "\n${PURPLE}🎉 COMPREHENSIVE SYNTAX FIX COMPLETE! 🎉${NC}"
echo "======================================"
