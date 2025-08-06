# Thư Viện Giao Diện Avatar SABO - Rainbow Avatar Library

## Tổng quan

Thư viện `RainbowAvatar` cung cấp hệ thống avatar tinh tế với hiệu ứng Cầu Vồng Tinh Tế cho SABO ARENA. Hệ thống bao gồm các component, hook và style tùy biến để tạo ra những avatar đẹp mắt và tương tác cao.

## Cấu trúc Thư viện

```
src/
├── components/ui/
│   ├── rainbow-avatar.tsx        # Component avatar chính
│   ├── avatar-customizer.tsx     # Component tùy chỉnh avatar
│   └── sabo-avatar.tsx          # Component avatar cho SABO
├── hooks/
│   └── useRainbowAvatar.ts      # Hook quản lý avatar state
└── styles/
    └── rainbow-avatar.css       # CSS cho hiệu ứng rainbow
```

## Components

### 1. RainbowAvatar

Component avatar chính với các hiệu ứng đa dạng.

#### Props

```typescript
interface RainbowAvatarProps {
  src?: string;                    // URL hình ảnh
  alt?: string;                    // Alt text
  fallback?: string;               // Text fallback
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'custom';
  variant?: 'default' | 'rainbow' | 'glow' | 'pulse' | 'shimmer';
  intensity?: 'subtle' | 'normal' | 'intense';
  speed?: 'slow' | 'normal' | 'fast';
  shape?: 'circle' | 'square' | 'octagon' | 'custom';
  customClipPath?: string;
  showBorder?: boolean;
  borderWidth?: number;
  glowColor?: string;
}
```

#### Sử dụng

```tsx
import { RainbowAvatar } from '@/components/ui/rainbow-avatar';

// Avatar cơ bản
<RainbowAvatar 
  src="/avatar.jpg" 
  fallback="U" 
  size="lg" 
/>

// Avatar với hiệu ứng rainbow
<RainbowAvatar 
  src="/avatar.jpg" 
  variant="rainbow"
  intensity="normal"
  speed="normal"
  shape="octagon"
/>
```

### 2. SaboAvatar

Component avatar tối ưu cho SABO ARENA với octagon shape và stamp xác thực.

```tsx
import { SaboAvatar } from '@/components/ui/sabo-avatar';

<SaboAvatar 
  size="xl"
  showUpload={true}
  fallbackName="User Name"
/>
```

### 3. AvatarCustomizer

Component đầy đủ để người dùng tùy chỉnh avatar với giao diện tab.

```tsx
import { AvatarCustomizer } from '@/components/ui/avatar-customizer';

<AvatarCustomizer 
  size="xl"
  showControls={true}
  showUpload={true}
  fallbackName="User Name"
/>
```

## Hook useRainbowAvatar

Hook quản lý state và actions cho avatar.

### Sử dụng

```tsx
import { useRainbowAvatar } from '@/hooks/useRainbowAvatar';

const { avatar, actions, fallbackUrl, isVerified } = useRainbowAvatar();

// Upload avatar
await actions.uploadAvatar(file);

// Thay đổi hiệu ứng
actions.updateAvatarVariant('rainbow');
actions.updateAvatarIntensity('intense');
actions.updateAvatarSpeed('fast');

// Reset avatar
await actions.resetAvatar();
```

### Return Values

```typescript
interface UseRainbowAvatarReturn {
  avatar: {
    url: string | null;
    isLoading: boolean;
    isUploading: boolean;
    error: string | null;
    variant: 'default' | 'rainbow' | 'glow' | 'pulse' | 'shimmer';
    intensity: 'subtle' | 'normal' | 'intense';
    speed: 'slow' | 'normal' | 'fast';
  };
  actions: {
    uploadAvatar: (file: File) => Promise<void>;
    updateAvatarVariant: (variant) => void;
    updateAvatarIntensity: (intensity) => void;
    updateAvatarSpeed: (speed) => void;
    resetAvatar: () => void;
    refreshAvatar: () => Promise<void>;
  };
  fallbackUrl: string;
  isVerified: boolean;
}
```

## Hiệu ứng Avatar

### 1. Rainbow (Cầu Vồng)
Hiệu ứng viền cầu vồng chuyển động mềm mại với các màu sắc tinh tế.

```css
/* Tùy chỉnh intensity */
.rainbow-subtle { --rainbow-intensity: 0.4; }
.rainbow-normal { --rainbow-intensity: 0.7; }
.rainbow-intense { --rainbow-intensity: 0.9; }

/* Tùy chỉnh speed */
.rainbow-slow { --rainbow-speed: 12s; }
.rainbow-fast { --rainbow-speed: 4s; }
```

### 2. Glow (Phát sáng)
Hiệu ứng phát sáng dịu nhẹ quanh avatar.

### 3. Pulse (Nhấp nháy)
Hiệu ứng nhấp nháy với viền gradient.

### 4. Shimmer (Lấp lánh)
Hiệu ứng ánh sáng di chuyển qua avatar.

## Shapes (Hình dạng)

### Circle
Hình tròn chuẩn.

### Square
Hình vuông.

### Octagon (SABO Style)
Hình bát giác đặc trưng của SABO ARENA.

```css
.sabo-octagon {
  clip-path: polygon(0% 10%, 10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%);
}
```

## Responsive Design

```css
@media (max-width: 640px) {
  .rainbow-avatar-container {
    --rainbow-border-width: 3px;
  }
}
```

## Theme Support

Hỗ trợ dark/light mode với intensity tự động điều chỉnh.

```css
.dark .rainbow-variant .rainbow-border-effect {
  /* Giảm intensity trong dark mode */
}

.light .rainbow-variant .rainbow-border-effect {
  /* Intensity đầy đủ trong light mode */
}
```

## Accessibility

- Hỗ trợ `prefers-reduced-motion` để tắt animation cho người dùng nhạy cảm
- Proper alt text và fallback
- Keyboard navigation support

## Performance

- CSS containment để tối ưu rendering
- `will-change` properties cho animation mượt
- Lazy loading avatar images
- Debounced state updates

## Ví dụ Tích hợp

### Trong Profile Page

```tsx
// Thay thế avatar cũ trong OptimizedMobileProfile
<div className='avatar-container relative w-[90vw] max-w-[360px] h-[90vw] max-h-[360px]'>
  <SaboAvatar 
    size="custom"
    className="w-full h-full"
    showUpload={true}
    fallbackName={profile.display_name}
  />
</div>
```

### Trong Header

```tsx
// Avatar nhỏ trong MobileHeader
<RainbowAvatar 
  src={profile?.avatar_url}
  variant="glow"
  intensity="subtle"
  size="sm"
  shape="circle"
/>
```

### Customization Panel

```tsx
// Panel tùy chỉnh đầy đủ
<AvatarCustomizer 
  size="xl"
  showControls={true}
  showUpload={true}
  fallbackName={profile?.display_name}
/>
```

## Data Storage

- Avatar URL: Lưu trong `profiles.avatar_url` (Supabase)
- Hiệu ứng settings: Lưu trong localStorage với key pattern `avatar_{setting}_{user_id}`
- Avatar files: Lưu trong Supabase Storage bucket `avatars/`

## Migration Guide

### Từ Avatar cũ sang RainbowAvatar

1. **Import mới**:
```tsx
import { SaboAvatar } from '@/components/ui/sabo-avatar';
import { useRainbowAvatar } from '@/hooks/useRainbowAvatar';
```

2. **Thay thế component**:
```tsx
// Cũ
<img className="avatar" src={avatarUrl} />

// Mới
<SaboAvatar size="xl" fallbackName={userName} />
```

3. **Upload logic**:
```tsx
// Cũ
const handleAvatarUpload = async (file) => { ... }

// Mới
const { actions } = useRainbowAvatar();
await actions.uploadAvatar(file);
```

## Best Practices

1. **Size Guidelines**:
   - `sm`: Header, navigation (32px)
   - `md`: Cards, lists (48px)
   - `lg`: Profile previews (64px)
   - `xl`: Profile pages (96px)
   - `2xl`: Full profile view (128px)
   - `3xl`: Hero sections (192px)

2. **Variant Usage**:
   - `default`: Trang chính, danh sách
   - `rainbow`: Profile trang cá nhân, achievements
   - `glow`: VIP users, special status
   - `pulse`: Active users, online status
   - `shimmer`: Loading states, premium features

3. **Performance**:
   - Chỉ sử dụng animation variants khi cần thiết
   - Sử dụng `default` variant cho danh sách dài
   - Lazy load avatar images
   - Cache avatar settings trong localStorage

4. **Accessibility**:
   - Luôn provide fallback text
   - Sử dụng proper alt text
   - Test với screen readers
   - Respect `prefers-reduced-motion`

## Troubleshooting

### Avatar không hiển thị
- Kiểm tra URL avatar có hợp lệ
- Verify Supabase storage permissions
- Check fallback text

### Animation không smooth
- Kiểm tra CSS `will-change` properties
- Verify browser support cho CSS animations
- Check performance trong DevTools

### Upload failed
- Kiểm tra file size (max 5MB)
- Verify file type (image/*)
- Check Supabase storage quotas
- Verify user authentication

## Future Enhancements

- [ ] Video avatar support
- [ ] AR/VR avatar integration
- [ ] Advanced shape customization
- [ ] Animation timeline editor
- [ ] Bulk avatar operations
- [ ] Avatar themes/presets
- [ ] Social avatar sharing
- [ ] Avatar analytics
