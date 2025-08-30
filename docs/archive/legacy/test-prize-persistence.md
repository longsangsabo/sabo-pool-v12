# Test Prize Persistence

## Bước test:

1. Mở browser: http://localhost:8081
2. Đăng nhập vào hệ thống  
3. Đi đến trang tạo tournament mới
4. Kiểm tra console logs để thấy:
   - "🏆 [EnhancedTournamentForm] Prizes updated:" khi TournamentPrizesManager load default template
   - "🏆 Tournament prizes in state: X prizes" trong handleSubmit
5. Fill form với thông tin cơ bản 
6. Ấn "Tạo giải đấu"
7. Check console logs để thấy:
   - "🏆 Saving tournament prizes to database:"
   - "✅ Tournament prizes saved successfully"
8. Kiểm tra database `tournament_prizes` table có data không

## Expected behavior:
- TournamentPrizesManager tự động tạo 16 positions default template
- onPrizesChange được gọi với array 16 prizes  
- handleSubmit save 16 prizes vào database
- Toast success message hiển thị

## Debugging points:
- Console logs trong TournamentPrizesManager
- Console logs trong EnhancedTournamentForm 
- Database query check tournament_prizes table
