#!/bin/bash

# Simple Integration Test for SABO Arena

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 SABO Arena Integration Test${NC}"
echo -e "${BLUE}==============================${NC}"

# Test TypeScript compilation
echo -e "${YELLOW}📝 Testing TypeScript compilation...${NC}"

echo -e "${BLUE}User App:${NC}"
cd apps/sabo-user
if pnpm tsc --noEmit; then
    echo -e "${GREEN}✅ User app TypeScript: PASSED${NC}"
else
    echo -e "${RED}❌ User app TypeScript: FAILED${NC}"
fi
cd ../..

echo -e "${BLUE}Admin App:${NC}"
cd apps/sabo-admin
if pnpm tsc --noEmit; then
    echo -e "${GREEN}✅ Admin app TypeScript: PASSED${NC}"
else
    echo -e "${RED}❌ Admin app TypeScript: FAILED${NC}"
fi
cd ../..

# Test builds
echo -e "${YELLOW}🔨 Testing builds...${NC}"

if [ -d "apps/sabo-user/dist" ] && [ -d "apps/sabo-admin/dist" ]; then
    echo -e "${GREEN}✅ Both apps have successful builds${NC}"
    
    user_size=$(du -sh apps/sabo-user/dist | awk '{print $1}')
    admin_size=$(du -sh apps/sabo-admin/dist | awk '{print $1}')
    
    echo -e "${BLUE}📊 Build Sizes:${NC}"
    echo -e "   User App:  $user_size"
    echo -e "   Admin App: $admin_size"
else
    echo -e "${RED}❌ Missing build outputs${NC}"
fi

# Test shared package usage
echo -e "${YELLOW}📦 Testing shared package usage...${NC}"

shared_packages=("shared-auth" "shared-hooks" "shared-types" "shared-ui" "shared-utils")

for package in "${shared_packages[@]}"; do
    user_usage=$(find apps/sabo-user/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@sabo/$package" 2>/dev/null | wc -l)
    admin_usage=$(find apps/sabo-admin/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "@sabo/$package" 2>/dev/null | wc -l)
    
    echo -e "${BLUE}@sabo/$package:${NC}"
    echo -e "   User:  $user_usage files"
    echo -e "   Admin: $admin_usage files"
done

# Test environment
echo -e "${YELLOW}🌍 Environment Check...${NC}"
echo -e "${BLUE}Node.js: $(node --version)${NC}"
echo -e "${BLUE}pnpm: $(pnpm --version)${NC}"
echo -e "${BLUE}TypeScript: $(npx tsc --version)${NC}"

echo -e "${GREEN}✅ Integration test complete!${NC}"
