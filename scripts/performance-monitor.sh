#!/bin/bash

# SABO Arena Performance Monitoring Script
# Measures and reports build/runtime performance metrics

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

REPORT_DIR="performance-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo -e "${BLUE}🚀 SABO Arena Performance Monitoring${NC}"
echo -e "${BLUE}======================================${NC}"

# Create report directory
mkdir -p "$REPORT_DIR"

# Function to format file sizes
format_size() {
    local size=$1
    if [ $size -gt 1048576 ]; then
        echo "$(echo "scale=2; $size/1048576" | bc)MB"
    elif [ $size -gt 1024 ]; then
        echo "$(echo "scale=1; $size/1024" | bc)KB"
    else
        echo "${size}B"
    fi
}

# Function to analyze bundle sizes
analyze_bundles() {
    local app_name=$1
    local dist_dir=$2
    
    echo -e "${YELLOW}📊 Analyzing $app_name bundle sizes...${NC}"
    
    if [ ! -d "$dist_dir" ]; then
        echo -e "${RED}❌ Build directory not found: $dist_dir${NC}"
        return 1
    fi
    
    local report_file="$REPORT_DIR/${app_name}-bundle-analysis-${TIMESTAMP}.txt"
    
    echo "SABO Arena - $app_name Bundle Analysis" > "$report_file"
    echo "Generated: $(date)" >> "$report_file"
    echo "========================================" >> "$report_file"
    echo "" >> "$report_file"
    
    # Analyze JavaScript bundles
    echo "JavaScript Bundles:" >> "$report_file"
    echo "==================" >> "$report_file"
    if [ -d "$dist_dir/js" ]; then
        find "$dist_dir/js" -name "*.js" -exec ls -la {} \; | \
        sort -k5 -nr | \
        while read -r line; do
            local file=$(echo "$line" | awk '{print $9}')
            local size=$(echo "$line" | awk '{print $5}')
            local basename=$(basename "$file")
            local formatted_size=$(format_size $size)
            echo "  $basename: $formatted_size" >> "$report_file"
            
            # Flag large bundles
            if [ $size -gt 512000 ]; then  # > 500KB
                echo -e "${RED}⚠️  Large bundle detected: $basename ($formatted_size)${NC}"
            fi
        done
    fi
    
    echo "" >> "$report_file"
    
    # Analyze CSS bundles
    echo "CSS Bundles:" >> "$report_file"
    echo "============" >> "$report_file"
    if [ -d "$dist_dir/assets" ]; then
        find "$dist_dir/assets" -name "*.css" -exec ls -la {} \; | \
        sort -k5 -nr | \
        while read -r line; do
            local file=$(echo "$line" | awk '{print $9}')
            local size=$(echo "$line" | awk '{print $5}')
            local basename=$(basename "$file")
            local formatted_size=$(format_size $size)
            echo "  $basename: $formatted_size" >> "$report_file"
        done
    fi
    
    echo "" >> "$report_file"
    
    # Calculate total size
    local total_size=$(find "$dist_dir" -type f -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
    local formatted_total=$(format_size $total_size)
    
    echo "Total Build Size: $formatted_total" >> "$report_file"
    echo -e "${GREEN}✅ $app_name analysis complete: $formatted_total${NC}"
    echo -e "${BLUE}📄 Report saved: $report_file${NC}"
}

# Function to test dev server startup time
measure_dev_startup() {
    echo -e "${YELLOW}⏱️  Measuring dev server startup times...${NC}"
    
    local startup_report="$REPORT_DIR/dev-startup-${TIMESTAMP}.txt"
    echo "SABO Arena - Dev Server Startup Times" > "$startup_report"
    echo "Generated: $(date)" >> "$startup_report"
    echo "=====================================" >> "$startup_report"
    echo "" >> "$startup_report"
    
    # Test user app startup
    echo "Testing User App Startup..." >> "$startup_report"
    cd apps/sabo-user
    local user_start=$(date +%s%N)
    timeout 30s pnpm dev > /dev/null 2>&1 &
    local user_pid=$!
    
    # Wait for server to be ready
    local user_ready=false
    local attempts=0
    while [ $attempts -lt 30 ] && [ $user_ready = false ]; do
        if curl -s http://localhost:8080 > /dev/null 2>&1; then
            user_ready=true
            local user_end=$(date +%s%N)
            local user_time=$(echo "scale=2; ($user_end - $user_start) / 1000000000" | bc)
            echo "User App: ${user_time}s" >> "$startup_report"
            echo -e "${GREEN}✅ User app startup: ${user_time}s${NC}"
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    kill $user_pid 2>/dev/null || true
    cd ../..
    
    # Test admin app startup
    echo "Testing Admin App Startup..." >> "$startup_report"
    cd apps/sabo-admin
    local admin_start=$(date +%s%N)
    timeout 30s pnpm dev > /dev/null 2>&1 &
    local admin_pid=$!
    
    # Wait for server to be ready
    local admin_ready=false
    attempts=0
    while [ $attempts -lt 30 ] && [ $admin_ready = false ]; do
        if curl -s http://localhost:8081 > /dev/null 2>&1; then
            admin_ready=true
            local admin_end=$(date +%s%N)
            local admin_time=$(echo "scale=2; ($admin_end - $admin_start) / 1000000000" | bc)
            echo "Admin App: ${admin_time}s" >> "$startup_report"
            echo -e "${GREEN}✅ Admin app startup: ${admin_time}s${NC}"
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    kill $admin_pid 2>/dev/null || true
    cd ../..
    
    echo -e "${BLUE}📄 Startup report saved: $startup_report${NC}"
}

# Function to measure build times
measure_build_times() {
    echo -e "${YELLOW}⏱️  Measuring build times...${NC}"
    
    local build_report="$REPORT_DIR/build-times-${TIMESTAMP}.txt"
    echo "SABO Arena - Build Performance" > "$build_report"
    echo "Generated: $(date)" >> "$build_report"
    echo "=============================" >> "$build_report"
    echo "" >> "$build_report"
    
    # Clean builds first
    echo "Cleaning previous builds..." >> "$build_report"
    pnpm -r clean > /dev/null 2>&1
    
    # Measure shared packages build time
    echo "Building shared packages..." >> "$build_report"
    local shared_start=$(date +%s%N)
    
    for package in shared-types shared-utils shared-hooks shared-auth shared-ui; do
        echo "Building @sabo/$package..." >> "$build_report"
        local pkg_start=$(date +%s%N)
        cd "packages/$package"
        pnpm build > /dev/null 2>&1
        local pkg_end=$(date +%s%N)
        local pkg_time=$(echo "scale=2; ($pkg_end - $pkg_start) / 1000000000" | bc)
        echo "  @sabo/$package: ${pkg_time}s" >> "$build_report"
        cd ../..
    done
    
    local shared_end=$(date +%s%N)
    local shared_time=$(echo "scale=2; ($shared_end - $shared_start) / 1000000000" | bc)
    echo "Total shared packages: ${shared_time}s" >> "$build_report"
    echo -e "${GREEN}✅ Shared packages build: ${shared_time}s${NC}"
    
    echo "" >> "$build_report"
    
    # Measure app build times
    echo "Building applications..." >> "$build_report"
    
    # User app
    local user_start=$(date +%s%N)
    cd apps/sabo-user
    pnpm build > /dev/null 2>&1
    local user_end=$(date +%s%N)
    local user_time=$(echo "scale=2; ($user_end - $user_start) / 1000000000" | bc)
    echo "User App: ${user_time}s" >> "$build_report"
    echo -e "${GREEN}✅ User app build: ${user_time}s${NC}"
    cd ../..
    
    # Admin app
    local admin_start=$(date +%s%N)
    cd apps/sabo-admin
    pnpm build > /dev/null 2>&1
    local admin_end=$(date +%s%N)
    local admin_time=$(echo "scale=2; ($admin_end - $admin_start) / 1000000000" | bc)
    echo "Admin App: ${admin_time}s" >> "$build_report"
    echo -e "${GREEN}✅ Admin app build: ${admin_time}s${NC}"
    cd ../..
    
    echo "" >> "$build_report"
    local total_time=$(echo "scale=2; $shared_time + $user_time + $admin_time" | bc)
    echo "Total Build Time: ${total_time}s" >> "$build_report"
    echo -e "${BOLD}${GREEN}🏁 Total build time: ${total_time}s${NC}"
    
    echo -e "${BLUE}📄 Build report saved: $build_report${NC}"
}

# Main execution
echo -e "${YELLOW}[PERF] Starting performance monitoring...${NC}"

# Check if builds exist
if [ ! -d "apps/sabo-user/dist" ] || [ ! -d "apps/sabo-admin/dist" ]; then
    echo -e "${YELLOW}⚠️  No existing builds found. Running fresh build...${NC}"
    ./scripts/build-optimized.sh
fi

# Bundle analysis
analyze_bundles "User-App" "apps/sabo-user/dist"
analyze_bundles "Admin-App" "apps/sabo-admin/dist"

# Build time measurement
measure_build_times

# Dev server startup measurement (optional - commented out as it requires manual testing)
# measure_dev_startup

# Generate summary report
echo -e "${YELLOW}📋 Generating performance summary...${NC}"
summary_report="$REPORT_DIR/performance-summary-${TIMESTAMP}.txt"

echo "SABO Arena - Performance Summary" > "$summary_report"
echo "Generated: $(date)" >> "$summary_report"
echo "===============================" >> "$summary_report"
echo "" >> "$summary_report"

# Bundle size summary
echo "Bundle Sizes:" >> "$summary_report"
echo "============" >> "$summary_report"
if [ -d "apps/sabo-user/dist" ]; then
    local user_size=$(find apps/sabo-user/dist -type f -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
    echo "User App: $(format_size $user_size)" >> "$summary_report"
fi

if [ -d "apps/sabo-admin/dist" ]; then
    local admin_size=$(find apps/sabo-admin/dist -type f -exec ls -la {} \; | awk '{sum += $5} END {print sum}')
    echo "Admin App: $(format_size $admin_size)" >> "$summary_report"
fi

echo "" >> "$summary_report"

# Performance recommendations
echo "Performance Recommendations:" >> "$summary_report"
echo "============================" >> "$summary_report"
echo "1. Monitor JavaScript bundle sizes - keep chunks under 500KB" >> "$summary_report"
echo "2. Use code splitting for large features" >> "$summary_report"
echo "3. Optimize images and static assets" >> "$summary_report"
echo "4. Consider lazy loading for non-critical components" >> "$summary_report"
echo "5. Implement service worker for caching strategies" >> "$summary_report"

echo -e "${GREEN}✅ Performance monitoring complete!${NC}"
echo -e "${BLUE}📄 Summary report: $summary_report${NC}"
echo -e "${BLUE}📁 All reports in: $REPORT_DIR/${NC}"
