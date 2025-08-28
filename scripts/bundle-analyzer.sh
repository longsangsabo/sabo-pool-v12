#!/bin/bash

# SABO Arena Bundle Analyzer
# Simple bundle analysis without heavy dependencies

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

REPORT_DIR="bundle-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}📦 SABO Arena Bundle Analyzer${NC}"
echo -e "${BLUE}=============================${NC}"

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to analyze bundle
analyze_bundle() {
    local app_name=$1
    local dist_dir=$2
    
    echo -e "${YELLOW}📊 Analyzing $app_name bundles...${NC}"
    
    if [ ! -d "$dist_dir" ]; then
        echo -e "${RED}❌ Build directory not found: $dist_dir${NC}"
        return 1
    fi
    
    local report_file="$REPORT_DIR/${app_name}-analysis-${TIMESTAMP}.txt"
    
    {
        echo "SABO Arena - $app_name Bundle Analysis"
        echo "Generated: $(date)"
        echo "======================================="
        echo ""
        
        # JavaScript bundles
        echo "JavaScript Bundles:"
        echo "=================="
        if [ -d "$dist_dir/js" ]; then
            find "$dist_dir/js" -name "*.js" -exec ls -lh {} \; | \
            sort -k5 -h | \
            awk '{printf "  %-40s %8s\n", $9, $5}' | \
            sed 's|.*\/||g'
        else
            echo "  No JS directory found"
        fi
        
        echo ""
        
        # CSS bundles
        echo "CSS Bundles:"
        echo "============"
        if [ -d "$dist_dir/assets" ]; then
            find "$dist_dir/assets" -name "*.css" -exec ls -lh {} \; 2>/dev/null | \
            sort -k5 -h | \
            awk '{printf "  %-40s %8s\n", $9, $5}' | \
            sed 's|.*\/||g'
        else
            echo "  No CSS assets found"
        fi
        
        echo ""
        
        # Total size
        echo "Total Size:"
        echo "==========="
        du -sh "$dist_dir" 2>/dev/null | awk '{print "  Total: " $1}'
        
        echo ""
        
        # Large files warning
        echo "Large Files (>500KB):"
        echo "===================="
        find "$dist_dir" -type f -size +500k -exec ls -lh {} \; 2>/dev/null | \
        awk '{printf "  ⚠️  %-40s %8s\n", $9, $5}' | \
        sed 's|.*\/||g' || echo "  No large files found"
        
    } > "$report_file"
    
    echo -e "${GREEN}✅ $app_name analysis complete${NC}"
    echo -e "${BLUE}📄 Report: $report_file${NC}"
    
    # Show summary
    local total_size=$(du -sh "$dist_dir" 2>/dev/null | awk '{print $1}')
    echo -e "${BOLD}   Total size: $total_size${NC}"
}

# Main execution
echo -e "${YELLOW}[ANALYZER] Starting bundle analysis...${NC}"

# Analyze both apps
if [ -d "apps/sabo-user/dist" ]; then
    analyze_bundle "User-App" "apps/sabo-user/dist"
else
    echo -e "${RED}❌ User app build not found${NC}"
fi

echo ""

if [ -d "apps/sabo-admin/dist" ]; then
    analyze_bundle "Admin-App" "apps/sabo-admin/dist"
else
    echo -e "${RED}❌ Admin app build not found${NC}"
fi

# Generate combined summary
echo ""
echo -e "${YELLOW}📋 Generating summary...${NC}"

summary_file="$REPORT_DIR/summary-${TIMESTAMP}.txt"
{
    echo "SABO Arena - Bundle Summary"
    echo "Generated: $(date)"
    echo "=========================="
    echo ""
    
    if [ -d "apps/sabo-user/dist" ]; then
        echo "User App:"
        du -sh apps/sabo-user/dist 2>/dev/null | awk '{print "  Size: " $1}'
        find apps/sabo-user/dist/js -name "*.js" 2>/dev/null | wc -l | awk '{print "  JS files: " $1}'
        find apps/sabo-user/dist -name "*.css" 2>/dev/null | wc -l | awk '{print "  CSS files: " $1}'
    fi
    
    echo ""
    
    if [ -d "apps/sabo-admin/dist" ]; then
        echo "Admin App:"
        du -sh apps/sabo-admin/dist 2>/dev/null | awk '{print "  Size: " $1}'
        find apps/sabo-admin/dist/js -name "*.js" 2>/dev/null | wc -l | awk '{print "  JS files: " $1}'
        find apps/sabo-admin/dist -name "*.css" 2>/dev/null | wc -l | awk '{print "  CSS files: " $1}'
    fi
    
    echo ""
    echo "Optimization Tips:"
    echo "================="
    echo "• Keep JavaScript chunks under 500KB"
    echo "• Use code splitting for large features"
    echo "• Compress images and optimize assets"
    echo "• Consider tree shaking unused code"
    echo "• Implement lazy loading for routes"
    
} > "$summary_file"

echo -e "${GREEN}✅ Bundle analysis complete!${NC}"
echo -e "${BLUE}📄 Summary: $summary_file${NC}"
echo -e "${BLUE}📁 Reports in: $REPORT_DIR/${NC}"
