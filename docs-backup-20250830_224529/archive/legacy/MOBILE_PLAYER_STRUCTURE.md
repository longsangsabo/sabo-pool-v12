# 📱 Cấu Trúc Giao Diện Mobile Player - SABO ARENA

## 🎯 Tổng Quan Architecture

### 📋 Bottom Navigation - 5 Tab Chính

```
┌─────────────────────────────────────────────────────────┐
│                    MobileHeader                         │
│               (SABO Logo + Page Title)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  Page Content                           │
│             (Responsive to screen)                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [🏠]    [⚔️]     [🏆]     [📊]     [👤]              │
│ Trang Chủ Thách Đấu Giải Đấu   BXH    Hồ Sơ           │
└─────────────────────────────────────────────────────────┘
```

## 🏠 **Tab 1: Trang Chủ** (`/dashboard`)

**Route:** `/` hoặc `/dashboard`  
**Component:** `Dashboard`  
**Title:** "Trang Chủ"  
**Icon:** `Home`

### 📄 Các trang con được hiển thị:

- Dashboard overview
- Quick stats
- Recent activities
- Upcoming tournaments

---

## ⚔️ **Tab 2: Thách Đấu** (`/challenges`)

**Route:** `/challenges`  
**Component:** `EnhancedChallengesPageV2`  
**Title:** "Thách Đấu"  
**Icon:** `Swords`  
**Badge:** 🔴 Số thách đấu pending

### 📄 Tính năng chính:

- Tạo thách đấu mới
- Nhận thách đấu từ người khác
- Xem lịch sử thách đấu
- Real-time notifications

---

## 🏆 **Tab 3: Giải Đấu** (`/tournaments`)

**Route:** `/tournaments`  
**Component:** `TournamentPage` (TournamentsPage.tsx)  
**Title:** "Giải Đấu"  
**Icon:** `Trophy`

### 📄 Các trang con:

- Danh sách giải đấu
- Chi tiết giải đấu
- Đăng ký tham gia
- Lịch thi đấu
- Kết quả

---

## 📊 **Tab 4: Bảng Xếp Hạng** (`/leaderboard`)

**Route:** `/leaderboard`  
**Component:** `LeaderboardPage`  
**Title:** "Xếp Hạng"  
**Icon:** `BarChart3`

### 📄 Nội dung hiển thị:

- Top players ranking
- ELO ratings
- Weekly/Monthly leaders
- Personal ranking position

---

## 👤 **Tab 5: Hồ Sơ** (`/profile`)

**Route:** `/profile`  
**Component:** `Profile` → `OptimizedMobileProfile`  
**Title:** "Hồ Sơ"  
**Icon:** `User`

### 📄 Chi tiết Profile:

- **SABO Avatar** với custom polygon styling
- **User Info:** Name + Verified Rank
- **Quick Actions Grid (2x3):**
  - ✏️ Chỉnh sửa
  - 🏆 Bảng xếp hạng
  - 🎯 Thách đấu
  - ⚙️ Cài đặt
  - 🥇 Đăng ký hạng
  - ⚡ Ví & Điểm
- **Recent Activities**
- **Achievements**
- **Profile Completion %**

---

## 🎨 **Layout System**

### 📱 Mobile Layout Hierarchy:

```
ResponsiveLayout
└── MobilePlayerLayout
    ├── MobileHeader
    │   ├── SABO Logo (gradient S)
    │   ├── Page Title (auto-detected)
    │   └── User Controls (theme, notifications, avatar)
    ├── Main Content Area
    │   ├── Billiards Background (dark mode)
    │   └── Page-specific content
    └── MobileNavigation (Bottom)
        └── 5 Tabs with badges & haptic feedback
```

### 🎭 Theme & Styling:

- **Light Mode:** Clean white/black contrast
- **Dark Mode:** Billiards table background
- **Dynamic Borders:** Theme-responsive colors
- **Haptic Feedback:** Vibration on navigation
- **SABO Branding:** Consistent across all pages

---

## 🔧 **Technical Features**

### 📊 Real-time Data:

- **Notification Count:** Badge trên bell icon
- **Challenge Count:** Badge trên Thách Đấu tab
- **Auto-refresh:** 30-second intervals

### 🎯 Navigation Logic:

```typescript
const isActive = (path: string) => {
  if (path === '/dashboard') {
    return location.pathname === '/' || location.pathname === '/dashboard';
  }
  return location.pathname.startsWith(path);
};
```

### 📱 Responsive Behavior:

- **Mobile First:** Optimized for mobile devices
- **Safe Area:** Bottom padding for iOS devices
- **Backdrop Blur:** Modern glassmorphism effect
- **Fixed Position:** Always visible navigation

---

## 🔄 **Page Navigation Flow**

```
🏠 Dashboard → ⚔️ Challenges → 🏆 Tournaments → 📊 Leaderboard → 👤 Profile
    ↑                                                                    ↓
    ←←←←←←←←←←←←←← Circular Navigation ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### 🎪 Additional Pages (không trong bottom nav):

- `/settings` - Cài đặt
- `/calendar` - Lịch thi đấu
- `/wallet` - Ví điện tử
- `/notifications` - Thông báo
- `/community` - Cộng đồng
- `/feed` - Bảng tin
- `/marketplace` - Cửa hàng

---

## 🎨 **Design Principles**

1. **Consistency:** Cùng một layout pattern cho tất cả pages
2. **Accessibility:** Clear labels, proper contrast, haptic feedback
3. **Performance:** Lazy loading, optimized images, minimal re-renders
4. **User Experience:** Intuitive navigation, visual feedback, smooth transitions
5. **Brand Identity:** SABO colors, fonts, và custom styling throughout

---

**🚀 Kết luận:** Mobile Player interface được thiết kế với 5 tab chính tập trung vào core features của billiards platform, với UX/UI tối ưu cho mobile devices và brand identity mạnh mẽ của SABO ARENA.
