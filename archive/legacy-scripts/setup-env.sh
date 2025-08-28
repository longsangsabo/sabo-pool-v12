#!/bin/bash

# Script tự động setup môi trường cho SABO Arena
echo "🚀 Setting up SABO Arena environment..."

# Kiểm tra xem file .env đã tồn tại chưa
if [ -f ".env" ]; then
    echo "✅ File .env đã tồn tại"
else
    echo "📝 Tạo file .env từ template..."
    
    # Tạo .env từ template nếu có
    if [ -f ".env.template" ]; then
        cp .env.template .env
        echo "✅ Đã copy từ .env.template"
    elif [ -f ".env.backup.20250809_110350" ]; then
        cp .env.backup.20250809_110350 .env
        echo "✅ Đã copy từ backup file"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        echo "⚠️  Đã copy từ .env.example - vui lòng cập nhật thông tin Supabase"
    else
        echo "❌ Không tìm thấy template file nào!"
        exit 1
    fi
fi

echo "🎯 Environment setup hoàn tất!"
echo "📂 File .env hiện tại:"
echo "$(head -5 .env)"
