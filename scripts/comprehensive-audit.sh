#!/bin/bash

echo "🔍 KIỂM TRA TOÀN DIỆN CODEBASE - COMPREHENSIVE CODEBASE AUDIT"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd /workspaces/sabo-pool-v12

echo -e "\n${BLUE}1. KIỂM TRA JSX TAG MISMATCHES${NC}"
echo "-----------------------------------"

# Check for Button/button mismatches
echo "🔸 Kiểm tra Button/button mismatches..."
BUTTON_ISSUES=$(find apps/ -name "*.tsx" -exec grep -l "<button.*</Button>\|<Button.*</button>" {} \; 2>/dev/null)
if [ -n "$BUTTON_ISSUES" ]; then
    echo -e "${RED}❌ Tìm thấy JSX tag mismatches trong:${NC}"
    echo "$BUTTON_ISSUES"
else
    echo -e "${GREEN}✅ Không có Button/button tag mismatches${NC}"
fi

echo -e "\n${BLUE}2. KIỂM TRA IMPORT PATHS${NC}"
echo "----------------------------"

# Check for incorrect import paths
echo "🔸 Kiểm tra Typography import paths..."
WRONG_IMPORTS=$(find apps/ -name "*.tsx" -exec grep -l "@/packages/shared-ui" {} \; 2>/dev/null)
if [ -n "$WRONG_IMPORTS" ]; then
    echo -e "${RED}❌ Tìm thấy import paths sai trong:${NC}"
    echo "$WRONG_IMPORTS"
else
    echo -e "${GREEN}✅ Tất cả Typography import paths đúng${NC}"
fi

# Check for missing imports
echo "🔸 Kiểm tra missing Button imports..."
MISSING_BUTTON_IMPORTS=$(find apps/ -name "*.tsx" -exec grep -L "import.*Button" {} \; | xargs grep -l "<Button\|</Button>" 2>/dev/null)
if [ -n "$MISSING_BUTTON_IMPORTS" ]; then
    echo -e "${YELLOW}⚠️ Files có thể thiếu Button import:${NC}"
    echo "$MISSING_BUTTON_IMPORTS"
fi

echo -e "\n${BLUE}3. KIỂM TRA TYPESCRIPT ERRORS${NC}"
echo "--------------------------------"

# Check TypeScript errors in user app
echo "🔸 Checking TypeScript errors in user app..."
cd apps/sabo-user
if npx tsc --noEmit --skipLibCheck > /tmp/user-ts-errors.log 2>&1; then
    echo -e "${GREEN}✅ Không có TypeScript errors trong user app${NC}"
else
    echo -e "${RED}❌ Có TypeScript errors trong user app:${NC}"
    head -20 /tmp/user-ts-errors.log
fi

cd ../../

# Check TypeScript errors in admin app  
echo "🔸 Checking TypeScript errors in admin app..."
cd apps/sabo-admin
if npx tsc --noEmit --skipLibCheck > /tmp/admin-ts-errors.log 2>&1; then
    echo -e "${GREEN}✅ Không có TypeScript errors trong admin app${NC}"
else
    echo -e "${RED}❌ Có TypeScript errors trong admin app:${NC}"
    head -20 /tmp/admin-ts-errors.log
fi

cd ../../

echo -e "\n${BLUE}4. KIỂM TRA PACKAGE DEPENDENCIES${NC}"
echo "-----------------------------------"

# Check if all packages are installed
echo "🔸 Kiểm tra package dependencies..."
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${GREEN}✅ pnpm-lock.yaml tồn tại${NC}"
else
    echo -e "${RED}❌ Thiếu pnpm-lock.yaml${NC}"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules đã được cài đặt${NC}"
else
    echo -e "${RED}❌ node_modules chưa được cài đặt${NC}"
fi

echo -e "\n${BLUE}5. KIỂM TRA DUPLICATE CLASS NAMES${NC}"
echo "------------------------------------"

echo "🔸 Kiểm tra duplicate className attributes..."
DUPLICATE_CLASSES=$(find apps/ -name "*.tsx" -exec grep -n "className.*className" {} \; 2>/dev/null)
if [ -n "$DUPLICATE_CLASSES" ]; then
    echo -e "${RED}❌ Tìm thấy duplicate className attributes:${NC}"
    echo "$DUPLICATE_CLASSES"
else
    echo -e "${GREEN}✅ Không có duplicate className attributes${NC}"
fi

echo -e "\n${BLUE}6. KIỂM TRA UNUSED IMPORTS${NC}"
echo "-----------------------------"

echo "🔸 Kiểm tra imports có thể không sử dụng..."
UNUSED_IMPORTS=$(find apps/ -name "*.tsx" -exec grep -l "import.*{.*}" {} \; | head -5)
if [ -n "$UNUSED_IMPORTS" ]; then
    echo -e "${YELLOW}⚠️ Cần review imports trong một số files (sample):${NC}"
    echo "$UNUSED_IMPORTS" | head -3
fi

echo -e "\n${BLUE}7. KIỂM TRA SYNTAX ERRORS${NC}"
echo "----------------------------"

echo "🔸 Kiểm tra basic syntax errors..."
SYNTAX_ERRORS=$(find apps/ -name "*.tsx" -exec node -c {} \; 2>&1 | grep -i error || echo "")
if [ -n "$SYNTAX_ERRORS" ]; then
    echo -e "${RED}❌ Tìm thấy syntax errors:${NC}"
    echo "$SYNTAX_ERRORS"
else
    echo -e "${GREEN}✅ Không có basic syntax errors${NC}"
fi

echo -e "\n${BLUE}8. KIỂM TRA DEVELOPMENT SERVERS${NC}"
echo "-----------------------------------"

echo "🔸 Kiểm tra ports đang sử dụng..."
PORT_8080=$(lsof -ti:8080 || echo "")
PORT_8081=$(lsof -ti:8081 || echo "")

if [ -n "$PORT_8080" ]; then
    echo -e "${GREEN}✅ User app đang chạy trên port 8080${NC}"
else
    echo -e "${YELLOW}⚠️ User app không chạy trên port 8080${NC}"
fi

if [ -n "$PORT_8081" ]; then
    echo -e "${GREEN}✅ Admin app đang chạy trên port 8081${NC}"
else
    echo -e "${YELLOW}⚠️ Admin app không chạy trên port 8081${NC}"
fi

echo -e "\n${BLUE}TỔNG KẾT AUDIT${NC}"
echo "==============="

# Count total issues
TOTAL_ISSUES=0

if [ -n "$BUTTON_ISSUES" ]; then
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

if [ -n "$WRONG_IMPORTS" ]; then
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

if [ -n "$DUPLICATE_CLASSES" ]; then
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

if [ -n "$SYNTAX_ERRORS" ]; then
    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
fi

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 CODEBASE SẠCH - Không có lỗi critical nào được tìm thấy!${NC}"
else
    echo -e "${RED}⚠️ Tìm thấy $TOTAL_ISSUES loại lỗi cần được fix${NC}"
fi

echo -e "\n${BLUE}KHUYẾN NGHỊ TIẾP THEO:${NC}"
echo "- Chạy user app development server: pnpm run dev:user"  
echo "- Chạy admin app development server: pnpm run dev:admin"
echo "- Kiểm tra browser console để tìm runtime errors"
echo "- Review và test các tính năng chính"
