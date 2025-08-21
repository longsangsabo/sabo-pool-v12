#!/bin/bash

# CLEANUP ALL SCRIPTS IN SABO POOL V12
# This script will remove all temporary, test, debug, and analysis scripts
# keeping only essential project files

echo "🧹 DỌN DẸP TẤT CẢ SCRIPTS TRONG HỆ THỐNG"
echo "======================================="

# Create backup folder first
echo "📦 Tạo thư mục backup..."
mkdir -p ./scripts-backup-$(date +%Y%m%d)
BACKUP_DIR="./scripts-backup-$(date +%Y%m%d)"

echo "📋 Danh sách các loại files sẽ bị xóa:"
echo "   - *.cjs (Node.js test scripts)"
echo "   - *.mjs (ES module test scripts)"  
echo "   - *test*.js (Test files)"
echo "   - *debug*.js (Debug files)"
echo "   - *analyze*.{js,cjs,sql} (Analysis scripts)"
echo "   - *audit*.{js,cjs,sql} (Audit scripts)"
echo "   - *check*.{js,cjs,sql} (Check scripts)"
echo "   - *fix*.sql (Fix scripts)"
echo "   - *cleanup*.{js,sql,sh} (Cleanup scripts)"
echo "   - *migration*.sql (Migration scripts)"
echo "   - *hotfix*.{js,cjs,sql} (Hotfix scripts)"
echo "   - Temporary SQL files"
echo ""

# Function to move files to backup and count
move_to_backup() {
    local pattern="$1"
    local description="$2"
    
    echo "🔍 Tìm: $description"
    files=$(find . -name "$pattern" -type f | grep -v node_modules | grep -v .git | grep -v scripts-backup)
    count=$(echo "$files" | grep -c . 2>/dev/null || echo "0")
    
    if [ "$count" -gt 0 ] && [ -n "$files" ]; then
        echo "   Tìm thấy $count files"
        echo "$files" | while read file; do
            if [ -n "$file" ] && [ -f "$file" ]; then
                # Create directory structure in backup
                backup_path="$BACKUP_DIR/$(dirname "$file")"
                mkdir -p "$backup_path"
                # Move to backup
                mv "$file" "$BACKUP_DIR/$file"
                echo "   Moved: $file"
            fi
        done
    else
        echo "   Không tìm thấy files nào"
    fi
    echo ""
}

# Start cleanup
echo "🚀 Bắt đầu dọn dẹp..."
echo ""

# Test and debug scripts
move_to_backup "*.cjs" "Node.js CommonJS scripts"
move_to_backup "*.mjs" "ES Module scripts"
move_to_backup "*test*.js" "Test JavaScript files"
move_to_backup "*debug*.js" "Debug JavaScript files"
move_to_backup "*analyze*.js" "Analysis JavaScript files"
move_to_backup "*audit*.js" "Audit JavaScript files"
move_to_backup "*check*.js" "Check JavaScript files"

# SQL scripts
move_to_backup "*analyze*.sql" "Analysis SQL files"
move_to_backup "*audit*.sql" "Audit SQL files"  
move_to_backup "*check*.sql" "Check SQL files"
move_to_backup "*fix*.sql" "Fix SQL files"
move_to_backup "*cleanup*.sql" "Cleanup SQL files"
move_to_backup "*migration*.sql" "Migration SQL files"
move_to_backup "*hotfix*.sql" "Hotfix SQL files"
move_to_backup "*test*.sql" "Test SQL files"
move_to_backup "*debug*.sql" "Debug SQL files"

# Shell scripts
move_to_backup "*cleanup*.sh" "Cleanup shell scripts"
move_to_backup "*fix*.sh" "Fix shell scripts"
move_to_backup "*test*.sh" "Test shell scripts"

# Specific temporary files
move_to_backup "add-*.sql" "Add column SQL scripts"
move_to_backup "update-*.sql" "Update SQL scripts"
move_to_backup "*-script.sql" "Generic SQL scripts"
move_to_backup "database_*.sql" "Database analysis scripts"
move_to_backup "tournament-*.sql" "Tournament SQL scripts"
move_to_backup "sabo-*.sql" "SABO SQL scripts"

# Remove specific known temporary files
echo "🎯 Xóa các files cụ thể..."

# Common temporary file patterns
temp_files=(
    "service-role-check.cjs"
    "browser-*.js"
    "BROWSER_*.js"
    "*_REPORT.md"
    "*_GUIDE.md" 
    "*_COMPLETION*.md"
    "BACKUP_*.tsx"
    "any-usage*.txt"
    "backend-package.json"
    "*-backup-*"
    "part*.sql"
    "step*.sql"
    "phase*.sql"
)

for pattern in "${temp_files[@]}"; do
    move_to_backup "$pattern" "Temporary files: $pattern"
done

echo "📊 THỐNG KÊ SAU KHI DỌN DẸP:"
echo "=========================="

# Count remaining files
echo "📁 Files còn lại:"
echo "   JavaScript/TypeScript: $(find . -name "*.{js,ts,jsx,tsx}" -type f | grep -v node_modules | grep -v .git | grep -v scripts-backup | wc -l)"
echo "   SQL files: $(find . -name "*.sql" -type f | grep -v node_modules | grep -v .git | grep -v scripts-backup | wc -l)"
echo "   Config files: $(find . -name "*.{json,yaml,yml,toml}" -type f | grep -v node_modules | grep -v .git | grep -v scripts-backup | wc -l)"

echo ""
echo "📦 Backup location: $BACKUP_DIR"
echo "   Total backed up: $(find "$BACKUP_DIR" -type f | wc -l) files"

echo ""
echo "✅ DỌN DẸP HOÀN TẤT!"
echo "🔄 Để khôi phục files từ backup:"
echo "   cp -r $BACKUP_DIR/* ./"
echo ""
echo "🗑️  Để xóa hoàn toàn backup:"
echo "   rm -rf $BACKUP_DIR"
