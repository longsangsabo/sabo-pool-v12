# 🏆 HỆ THỐNG THÔNG BÁO THÁCH ĐẤU HOÀN THIỆN

## 📊 **TỔNG QUAN LIFECYCLE THÁCH ĐẤU**

### **Phase 1: Tạo & Khởi tạo Thách đấu**
- ✅ User A tạo thách đấu mới
- ✅ User B được mời/nhận thách đấu  
- ✅ Thách đấu được confirm bởi cả 2 bên
- ✅ Lịch trận đấu được tạo

### **Phase 2: Trước Trận đấu**
- ⏰ Nhắc nhở trước 24h
- ⏰ Nhắc nhở trước 1h
- ⏰ Nhắc nhở trước 15 phút
- 🎯 Check-in trước trận đấu
- 🏢 CLB xác nhận sẵn sàng

### **Phase 3: Trong Trận đấu**
- 🚀 Trận đấu bắt đầu
- 📊 Live score updates (nếu có)
- ⚠️ Dispute/khiếu nại
- 🔄 Timeout/tạm dừng

### **Phase 4: Sau Trận đấu**
- 📝 User submit kết quả
- ✅ Đối thủ xác nhận kết quả
- 🏢 CLB review & approve
- 🎁 SPA points được cộng
- 📈 ELO rating update
- 🏆 Achievement unlocked

### **Phase 5: Hậu Trận đấu**
- 📊 Match statistics
- 🔄 Rematch requests
- ⭐ Rating & review
- 📱 Social sharing

## 🔔 **CÁC LOẠI THÔNG BÁO**

### **1. 🎯 THÔNG BÁO TRẠNG THÁI (Status Notifications)**
```typescript
enum ChallengeNotificationType {
  // Creation & Setup
  CHALLENGE_CREATED = 'challenge_created',
  CHALLENGE_RECEIVED = 'challenge_received',
  CHALLENGE_ACCEPTED = 'challenge_accepted',
  CHALLENGE_DECLINED = 'challenge_declined',
  SCHEDULE_CONFIRMED = 'schedule_confirmed',
  
  // Pre-match
  MATCH_REMINDER_24H = 'match_reminder_24h',
  MATCH_REMINDER_1H = 'match_reminder_1h',
  MATCH_REMINDER_15M = 'match_reminder_15m',
  CHECK_IN_REQUIRED = 'check_in_required',
  OPPONENT_CHECKED_IN = 'opponent_checked_in',
  
  // Match
  MATCH_STARTED = 'match_started',
  SCORE_UPDATED = 'score_updated',
  DISPUTE_RAISED = 'dispute_raised',
  TIMEOUT_CALLED = 'timeout_called',
  
  // Post-match
  RESULT_SUBMITTED = 'result_submitted',
  RESULT_DISPUTED = 'result_disputed',
  RESULT_CONFIRMED = 'result_confirmed',
  CLUB_REVIEW_PENDING = 'club_review_pending',
  CLUB_APPROVED = 'club_approved',
  SPA_POINTS_AWARDED = 'spa_points_awarded',
  ELO_UPDATED = 'elo_updated',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  
  // Social
  MATCH_SHARED = 'match_shared',
  REMATCH_REQUESTED = 'rematch_requested',
  REVIEW_RECEIVED = 'review_received'
}
```

### **2. 🎨 THÔNG BÁO UI COMPONENTS**
```typescript
interface ChallengeNotification {
  id: string;
  type: ChallengeNotificationType;
  challengeId: string;
  userId: string;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date; // For future notifications
  metadata: {
    challengerName?: string;
    opponentName?: string;
    clubName?: string;
    spaPoints?: number;
    eloChange?: number;
    matchTime?: Date;
  };
}
```

## 🛠️ **IMPLEMENTATION PLAN**

### **Step 1: Database Schema**
```sql
-- Notifications table
CREATE TABLE challenge_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_text TEXT,
  action_url TEXT,
  icon TEXT NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT false,
  scheduled_for TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_challenge_notifications_user_id ON challenge_notifications(user_id);
CREATE INDEX idx_challenge_notifications_challenge_id ON challenge_notifications(challenge_id);
CREATE INDEX idx_challenge_notifications_scheduled ON challenge_notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_challenge_notifications_unread ON challenge_notifications(user_id, is_read) WHERE is_read = false;
```

### **Step 2: Notification Service**
```typescript
class ChallengeNotificationService {
  // Create notification
  async createNotification(data: CreateNotificationData): Promise<void>
  
  // Schedule future notifications
  async scheduleNotification(data: ScheduleNotificationData): Promise<void>
  
  // Send real-time notifications
  async sendRealTimeNotification(userId: string, notification: ChallengeNotification): Promise<void>
  
  // Batch notifications for multiple users
  async sendBatchNotifications(userIds: string[], template: NotificationTemplate): Promise<void>
  
  // Mark as read
  async markAsRead(notificationId: string, userId: string): Promise<void>
  
  // Get user notifications
  async getUserNotifications(userId: string, options?: PaginationOptions): Promise<ChallengeNotification[]>
}
```

### **Step 3: Event Triggers**
```typescript
// Database triggers for automatic notifications
const setupChallengeNotificationTriggers = () => {
  // On challenge created
  supabase.channel('challenges')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'challenges' 
    }, handleChallengeCreated)
    
  // On challenge status change
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public', 
      table: 'challenges'
    }, handleChallengeStatusChange)
    
  // On match results
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'challenge_results' 
    }, handleResultSubmitted)
}
```

## 🎯 **NOTIFICATION TEMPLATES**

### **Template Examples:**
```typescript
const NOTIFICATION_TEMPLATES = {
  CHALLENGE_CREATED: {
    title: "🏆 Thách đấu mới được tạo",
    message: "Bạn đã tạo thách đấu với {{opponentName}}",
    icon: "trophy",
    priority: "medium"
  },
  
  CHALLENGE_RECEIVED: {
    title: "⚔️ Có thách đấu mới!",
    message: "{{challengerName}} đã thách đấu bạn",
    actionText: "Xem chi tiết",
    actionUrl: "/challenges/{{challengeId}}",
    icon: "sword",
    priority: "high"
  },
  
  MATCH_REMINDER_1H: {
    title: "⏰ Sắp đến giờ thi đấu",
    message: "Trận đấu với {{opponentName}} sẽ bắt đầu trong 1 giờ",
    actionText: "Chuẩn bị",
    actionUrl: "/challenges/{{challengeId}}/prepare",
    icon: "clock",
    priority: "high"
  },
  
  SPA_POINTS_AWARDED: {
    title: "🎁 Nhận SPA Points",
    message: "Bạn đã nhận {{spaPoints}} SPA Points từ trận thắng!",
    icon: "gift",
    priority: "medium"
  }
}
```

Bạn có muốn tôi bắt đầu implement hệ thống này không? Tôi sẽ:

1. **Tạo database schema**
2. **Setup notification service**  
3. **Tạo UI components**
4. **Setup event triggers**
5. **Integrate với existing challenge system**

Bạn muốn bắt đầu từ phần nào trước?
