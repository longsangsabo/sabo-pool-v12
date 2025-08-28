#!/bin/bash

# ============================================
# DEPLOY TOURNAMENT RESULTS TABLE
# ============================================

echo "🚀 HƯỚNG DẪN DEPLOY BẢNG TOURNAMENT RESULTS"
echo "============================================="
echo ""
echo "📋 BƯỚC 1: Mở Supabase Dashboard"
echo "   1. Đi đến: https://app.supabase.com"
echo "   2. Chọn project: sabo-pool-v12"
echo "   3. Vào mục 'SQL Editor'"
echo ""
echo "📋 BƯỚC 2: Chạy SQL Script"
echo "   1. Tạo Query mới"
echo "   2. Copy toàn bộ nội dung file: create-tournament-results-table.sql"
echo "   3. Paste vào SQL Editor"
echo "   4. Click 'Run' để execute"
echo ""
echo "📋 BƯỚC 3: Kiểm tra kết quả"
echo "   1. Vào mục 'Table Editor'"
echo "   2. Tìm bảng 'tournament_results'"
echo "   3. Xem structure và permissions"
echo ""
echo "📋 BƯỚC 4: Test tính năng"
echo "   1. Quay lại ứng dụng: http://localhost:8000"
echo "   2. Vào tab 'Kết quả giải đấu'"
echo "   3. Kiểm tra xem còn lỗi không"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "   - Nếu lỗi 'relationship not found': Chạy lại SQL script"
echo "   - Nếu lỗi 'permissions': Kiểm tra RLS policies"
echo "   - Nếu lỗi 'function not found': Execute toàn bộ script"
echo ""
echo "📁 FILE CẦN DEPLOY:"
echo "   → create-tournament-results-table.sql"
echo ""

# Show the first few lines of the SQL file for reference
echo "📄 PREVIEW SQL SCRIPT:"
echo "----------------------"
head -20 create-tournament-results-table.sql
echo "..."
echo "(Xem toàn bộ nội dung trong file create-tournament-results-table.sql)"
echo ""
echo "✅ HOÀN THÀNH DEPLOY: Tab 'Kết quả giải đấu' sẽ hoạt động!"
