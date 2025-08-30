# 🚀 SABO Arena - Developer Onboarding Checklist

## 📋 **ROLE PLAYER INTERFACE GUIDE**

### **✅ Desktop Player Interface (NEW UNIFIED SYSTEM)**

#### **Components to Use:**
- ✅ `PlayerDesktopLayout.tsx` - Main desktop layout
- ✅ `PlayerDesktopSidebar.tsx` - Navigation sidebar (14 items)
- ✅ `PlayerDesktopHeader.tsx` - Header with search & notifications

#### **Usage Example:**
```typescript
import PlayerDesktopLayout from '@/components/desktop/PlayerDesktopLayout';

const MyPage: React.FC = () => {
  return (
    <PlayerDesktopLayout pageTitle="My Page">
      <div>Your page content here</div>
    </PlayerDesktopLayout>
  );
};
```

#### **Navigation Structure:**
- **Core Navigation** (5 items): Trang chủ, Thách đấu, Giải đấu, Bảng xếp hạng, Hồ sơ
- **Communication** (2 items): Hộp thư, Thông báo  
- **Social** (2 items): Cộng đồng, Bảng tin
- **Scheduling** (1 item): Lịch thi đấu
- **Commerce** (1 item): Cửa hàng
- **Clubs** (2 items): Câu lạc bộ, Đăng ký CLB
- **System** (1 item): Cài đặt

### **✅ Mobile Player Interface (OPTIMIZED)**

#### **Components to Use:**
- ✅ `MobilePlayerLayout.tsx` - Mobile layout with bottom navigation
- ✅ 5-tab bottom navigation (synchronized with desktop core)

#### **Mobile Navigation:**
- 🏠 Trang chủ (`/dashboard`)
- ⚔️ Thách đấu (`/challenges`) 
- 🏆 Giải đấu (`/tournaments`)
- 📊 Bảng xếp hạng (`/leaderboard`)
- 👤 Hồ sơ (`/profile`)

### **🚫 DEPRECATED COMPONENTS (DO NOT USE)**

The following components have been deprecated and should NOT be used in new code:

- ❌ `UserDesktopSidebar.tsx` - Use `PlayerDesktopSidebar.tsx`
- ❌ `UserDesktopSidebarIntegrated.tsx` - Use `PlayerDesktopSidebar.tsx`
- ❌ `UserDesktopSidebarSynchronized.tsx` - Use `PlayerDesktopSidebar.tsx`
- ❌ `UserDesktopHeader.tsx` - Use `PlayerDesktopHeader.tsx`
- ❌ `UserDesktopHeaderSynchronized.tsx` - Use `PlayerDesktopHeader.tsx`

### **🎨 Design System**

#### **Design Tokens:**
```typescript
const PLAYER_DESIGN_TOKENS = {
  spacing: { 
    padding: { sm: '0.5rem', md: '1rem', lg: '1.5rem' } 
  },
  colors: { 
    primary: 'hsl(var(--primary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted-foreground))'
  },
  animation: {
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    hover: 'transform: scale(1.02)',
    active: 'transform: scale(0.98)'
  }
};
```

#### **Responsive Breakpoints:**
- **Mobile:** `< 768px`
- **Tablet:** `768px - 1023px`
- **Desktop:** `>= 1024px`

### **📚 Architecture Guidelines**

1. **Use ResponsiveLayout** for automatic mobile/desktop switching
2. **Follow component naming** conventions: `PlayerXxx.tsx`
3. **Implement proper TypeScript** interfaces for all props
4. **Use design tokens** for consistent spacing and colors
5. **Test on all breakpoints** before deployment

### **🔗 Useful Links**

- [Desktop Consolidation Report](../DESKTOP_CONSOLIDATION_PHASE1_COMPLETE.md)
- [Migration Phase 2 Report](../DESKTOP_MIGRATION_PHASE2_REPORT.md)
- [Standardization Plan](../ROLE_PLAYER_STANDARDIZATION_PLAN.md)

---

*Updated: Phase 3 Final Cleanup Complete*
