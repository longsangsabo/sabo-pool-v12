# Script tự động setup môi trường cho SABO Arena
Write-Host "🚀 Setting up SABO Arena environment..." -ForegroundColor Green

# Kiểm tra xem file .env đã tồn tại chưa
if (Test-Path ".env") {
    Write-Host "✅ File .env đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "📝 Tạo file .env từ template..." -ForegroundColor Yellow
    
    # Tạo .env từ template nếu có
    if (Test-Path ".env.template") {
        Copy-Item ".env.template" ".env"
        Write-Host "✅ Đã copy từ .env.template" -ForegroundColor Green
    } elseif (Test-Path ".env.backup.20250809_110350") {
        Copy-Item ".env.backup.20250809_110350" ".env"
        Write-Host "✅ Đã copy từ backup file" -ForegroundColor Green
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "⚠️  Đã copy từ .env.example - vui lòng cập nhật thông tin Supabase" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Không tìm thấy template file nào!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🎯 Environment setup hoàn tất!" -ForegroundColor Green
Write-Host "📂 File .env hiện tại:" -ForegroundColor Cyan
Get-Content ".env" | Select-Object -First 5
