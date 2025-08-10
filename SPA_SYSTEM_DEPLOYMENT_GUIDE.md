# Hướng dẫn triển khai hệ thống SPA

## Bước 1: Chạy SQL Migration

Vào Supabase Dashboard > SQL Editor và chạy file migration sau:
`/workspaces/sabo-pool-v12/supabase/migrations/20250809164048_spa_system_reset.sql``

## Bước 2: Kiểm tra Database

Sau khi chạy migration thành công, bạn sẽ có các bảng mới:
- `spa_milestones` - Chứa các milestone SPA
- `user_milestone_progress` - Theo dõi tiến độ milestone của user
- `spa_bonus_activities` - Các hoạt động bonus
- `user_bonus_claims` - Lịch sử claim bonus
- `spa_transaction_log` - Log tất cả giao dịch SPA

## Bước 3: Test hệ thống

1. Đăng nhập vào ứng dụng
2. Truy cập `/spa` để xem SPA Dashboard
3. Kiểm tra điểm SPA hiện tại đã được reset về 0
4. Thực hiện các hoạt động để kiểm tra milestone:
   - Chơi game (milestone games_played)
   - Thắng game (milestone wins) 
   - Tham gia tournament (milestone tournaments_joined)

## Bước 4: Test Bonus Activities

Các bonus sẽ được tự động tặng khi:
- Tài khoản mới: +100 SPA
- Đăng ký hạng: +200 SPA
- Giới thiệu bạn bè: +150 SPA
- Thắng giải đấu đầu tiên: +300 SPA
- Hoàn thiện profile: +75 SPA
- Nạp tiền lần đầu: +500 SPA

## Tích hợp với Code

### 1. Sử dụng SPA Service
```typescript
import { spaService } from '@/services/spaService';

// Tặng bonus cho user mới
await spaService.handleNewUserRegistration(userId);

// Tặng bonus đăng ký hạng
await spaService.handleRankRegistration(userId);

// Tặng bonus giới thiệu
await spaService.handleReferralSuccess(referrerId, newUserId);

// Check milestone sau khi chơi game
await spaService.triggerGameComplete(userId, won);
```

### 2. Sử dụng React Hook
```typescript
import { useSPA } from '@/hooks/useSPA';

const MyComponent = () => {
  const { 
    currentPoints, 
    milestones, 
    triggerGameComplete,
    awardBonusActivity 
  } = useSPA();
  
  // Component logic here
};
```

### 3. Hiển thị SPA Points
```typescript
import SPAPointsBadge from '@/components/SPAPointsBadge';

// Hiển thị badge điểm SPA
<SPAPointsBadge />
```

## Các tính năng đã hoàn thành

✅ **Reset điểm SPA về 0** - Tất cả user đã có SPA points = 0

✅ **Hệ thống Milestone** với các loại:
- Games Played (1, 10, 50, 100, 500 games)
- Wins (1, 5, 25, 100 wins) 
- SPA Earned (1000, 5000, 10000 SPA)
- Tournaments Joined (1, 5, 20 tournaments)

✅ **Chương trình tặng điểm SPA**:
- Tài khoản mới: +100 SPA
- Đăng ký hạng: +200 SPA
- Giới thiệu bạn bề: +150 SPA
- Thắng giải đấu đầu tiên: +300 SPA
- Đăng nhập 30 ngày liên tiếp: +250 SPA
- Hoàn thiện profile: +75 SPA
- Nạp tiền lần đầu: +500 SPA
- Chia sẻ lên mạng xã hội: +25 SPA

✅ **SPA Dashboard** - Trang `/spa` để xem milestone và lịch sử

✅ **Database Functions**:
- `update_spa_points()` - Cập nhật điểm SPA an toàn
- `check_milestone_progress()` - Kiểm tra và trao thưởng milestone
- `award_bonus_activity()` - Trao bonus activity

✅ **API Service** - `spaService` với đầy đủ methods

✅ **React Components**:
- `SPADashboard` - Trang chính
- `SPAPointsBadge` - Badge hiển thị điểm
- `useSPA` hook - React hook quản lý SPA

✅ **Navigation** - Đã thêm menu "SPA Points" vào sidebar

## Cách tích hợp vào workflow hiện tại

1. **Sau khi user đăng ký**: Gọi `spaService.handleNewUserRegistration(userId)`

2. **Sau khi user đăng ký hạng**: Gọi `spaService.handleRankRegistration(userId)`

3. **Sau khi user hoàn thành game**: Gọi `spaService.triggerGameComplete(userId, won)`

4. **Sau khi user tham gia tournament**: Gọi `spaService.triggerTournamentJoined(userId)`

5. **Khi có referral thành công**: Gọi `spaService.handleReferralSuccess(referrerId, newUserId)`

6. **Tặng bonus khác**: Gọi `spaService.awardBonusActivity(userId, activityType, referenceData)`

Hệ thống đã được thiết kế hoàn chỉnh và sẵn sàng sử dụng!
