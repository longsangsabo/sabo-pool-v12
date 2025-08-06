# 📱 Mobile Page Titles - Chuẩn Hóa Tên Trang

## 🎯 Mục đích
Chuẩn hóa tên các trang trong mobile interface để đảm bảo:
- **Consistency** - Tất cả trang đều có tên tiếng Việt chuẩn
- **Maintainability** - Dễ dàng thay đổi tên trang ở một nơi duy nhất  
- **Type Safety** - TypeScript hỗ trợ auto-complete và type checking

## 📋 Danh Sách Tên Trang Chuẩn

### 🏠 Core Player Pages (Main Navigation)
```typescript
DASHBOARD: 'Trang Chủ'           // / , /dashboard
PROFILE: 'Hồ Sơ'                 // /profile  
TOURNAMENTS: 'Giải Đấu'          // /tournaments
CHALLENGES: 'Thách Đấu'          // /challenges
LEADERBOARD: 'Xếp Hạng'          // /leaderboard
```

### 🔗 Secondary Pages  
```typescript
CALENDAR: 'Lịch Thi Đấu'         // /calendar
COMMUNITY: 'Cộng Đồng'           // /community
FEED: 'Bảng Tin'                 // /feed
MARKETPLACE: 'Cửa Hàng'          // /marketplace
NOTIFICATIONS: 'Thông Báo'       // /notifications
SETTINGS: 'Cài Đặt'              // /settings
WALLET: 'Ví Điện Tử'             // /wallet
```

### 🏢 Club Pages
```typescript
CLUBS: 'Câu Lạc Bộ'              // /clubs
CLUB_DETAIL: 'Chi Tiết CLB'      // /clubs/:id
CLUB_REGISTRATION: 'Đăng Ký CLB' // /club-registration
```

### 📄 Public Pages
```typescript
ABOUT: 'Giới Thiệu'              // /about
CONTACT: 'Liên Hệ'               // /contact
NEWS: 'Tin Tức'                  // /news
PRIVACY: 'Chính Sách'            // /privacy
TERMS: 'Điều Khoản'              // /terms
```

## 🔧 Cách Sử Dụng

### 1. Auto-Detection (Khuyến nghị)
```typescript
// MobilePlayerLayout tự động detect title từ route
<MobilePlayerLayout>
  {children}
</MobilePlayerLayout>
```

### 2. Manual Override
```typescript
// Custom title cho trường hợp đặc biệt
<MobilePlayerLayout pageTitle={MOBILE_PAGE_TITLES.PROFILE}>
  {children}
</MobilePlayerLayout>
```

### 3. Programmatic Access
```typescript
import { MOBILE_PAGE_TITLES, getPageTitle, useMobilePageTitle } from '@/utils/mobilePageUtils';

// Get title by constant
const title = MOBILE_PAGE_TITLES.DASHBOARD;

// Get title by pathname
const title = getPageTitle('/profile'); // "Hồ Sơ"

// Hook to get current page title
const currentTitle = useMobilePageTitle();
```

## 🏗️ Architecture

### Layout Hierarchy
```
ResponsiveLayout
└── MobilePlayerLayout (if mobile)
    ├── MobileHeader (with auto-detected title)
    ├── Page Content
    └── MobileNavigation
```

### Files Structure
```
src/
├── components/mobile/
│   ├── MobilePlayerLayout.tsx     # Main component + constants
│   └── MobileHeader.tsx           # Header với title prop
├── hooks/
│   └── useMobilePageTitle.ts      # Hook auto-detect title
└── utils/
    └── mobilePageUtils.ts         # Utility functions
```

## 📱 Mobile Experience

### Header Behavior
- **Có title**: Hiển thị SABO logo + page title
- **Không title**: Chỉ hiển thị SABO logo (home page style)
- **Auth pages**: Ẩn header hoàn toàn

### Navigation Behavior  
- **Main pages**: Hiển thị bottom navigation
- **Auth pages**: Ẩn navigation
- **Admin pages**: Ẩn navigation

## 🔄 Dynamic Routes

Các route động được handle tự động:
```typescript
/clubs/123    → "Chi Tiết CLB"
/clubs/456    → "Chi Tiết CLB"
```

## ✅ Benefits

1. **Single Source of Truth** - Tất cả tên trang được define ở một nơi
2. **Type Safety** - TypeScript prevent typos và provide auto-complete
3. **Automatic Detection** - Không cần manually set title cho mỗi page
4. **Flexible Override** - Có thể custom title khi cần
5. **Consistent UX** - User experience đồng nhất trên toàn bộ mobile app

## 🎨 Customization

### Thêm Page Mới
1. Thêm vào `MOBILE_PAGE_TITLES` constant
2. Thêm mapping vào `useMobilePageTitle` hook
3. Thêm vào `mobilePageUtils` nếu cần

### Thay Đổi Tên Trang
Chỉ cần sửa trong `MOBILE_PAGE_TITLES` - tất cả sẽ update tự động!

---

**💡 Tip**: Dùng VS Code auto-complete với `MOBILE_PAGE_TITLES.` để thấy tất cả options available!
