# CardAvatar Component

## Mô tả

Component `CardAvatar` là một thiết kế avatar kiểu card hiện đại được tích hợp vào trang Profile, lấy cảm hứng từ thiết kế card-style với layout đẹp mắt và chuyên nghiệp.

## Thiết kế dựa trên ý tưởng

**Phân tích layout từ design:**
- 🖼️ **Card format**: Hình chữ nhật với viền trắng kiểu khung ảnh
- 📷 **Vùng ảnh chính**: Chiếm phần lớn card, có viền tím (purple accent)
- 👤 **Nickname area**: Phần dưới với text nickname trên nền gradient đen
- 🏆 **Rank section**: Phần cuối với thông tin rank
- 🎨 **Color scheme**: Đen trắng với accent tím, typography mạnh mẽ

## Tính năng

### 🖼️ Thiết kế Card-style
- Layout giống như ảnh ID hoặc trading card
- Viền trắng với shadow đẹp mắt
- Accent color tím cho vùng ảnh
- Typography rõ ràng và mạnh mẽ

### ✂️ Chức năng cắt ảnh tự động
- Tự động cắt ảnh theo tỷ lệ 3:4 (portrait)
- Xem trước kết quả trước khi lưu
- Hỗ trợ nhiều định dạng ảnh (JPEG, PNG, WebP)

### 📱 Responsive Design
- Tối ưu cho mọi kích thước màn hình
- Tự động điều chỉnh typography
- Hỗ trợ 3 kích thước: sm, md, lg

### 🎨 Tùy chỉnh giao diện
- Hỗ trợ Light/Dark theme
- Hiệu ứng hover và animations
- Gradient background cho nickname area

## Cách sử dụng

### Import component

```tsx
import CardAvatar from '@/components/ui/card-avatar';
```

### Sử dụng cơ bản

```tsx
<CardAvatar
  userAvatar={profile.avatar_url}
  onAvatarChange={handleAvatarUpload}
  uploading={uploading}
  nickname={profile.display_name || 'Chưa đặt tên'}
  rank={profile.verified_rank || 'K'}
  size="md"
  className="mb-6"
/>
```

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `userAvatar` | `string \| null` | `undefined` | URL ảnh avatar hiện tại |
| `onAvatarChange` | `(file: File, croppedDataUrl?: string) => void` | `undefined` | Callback khi ảnh được thay đổi |
| `uploading` | `boolean` | `false` | Trạng thái đang upload |
| `nickname` | `string` | `'NICK NAME'` | Tên hiển thị trong card |
| `rank` | `string` | `'G'` | Rank/hạng của người dùng |
| `className` | `string` | `''` | CSS class tùy chỉnh |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước card |

## Kích thước và responsive

### Kích thước có sẵn:
- **sm**: 200x280px
- **md**: 280x360px (default)
- **lg**: 320x420px

### Aspect Ratio:
- **Card**: Tỷ lệ portrait tối ưu cho mobile
- **Image area**: 3:4 ratio (portrait) như ảnh ID
- **Typography**: Tự động scale theo kích thước

## Layout Structure

```
┌─────────────────────┐ ← Card Border (white)
│  ┌───────────────┐  │ ← Image Area (purple border)
│  │               │  │
│  │    AVATAR     │  │ ← 3:4 aspect ratio
│  │               │  │
│  └───────────────┘  │
│  ┌───────────────┐  │ ← Nickname Section (dark)
│  │   NICK NAME   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │ ← Rank Section (light)
│  │   RANK : G    │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Xử lý upload

Component sẽ gọi `onAvatarChange` với 2 tham số:
- `file`: File object để upload lên server
- `croppedDataUrl`: Data URL của ảnh đã cắt (để preview)

```tsx
const handleAvatarUpload = async (file: File, croppedDataUrl?: string) => {
  setUploading(true);
  
  try {
    // Upload file lên Supabase
    const { error } = await supabase.storage
      .from('avatars')
      .upload(`${user.id}/avatar.jpg`, file, { upsert: true });
    
    if (error) throw error;
    
    // Cập nhật URL trong database
    // ...
    
    toast.success('Đã cập nhật ảnh đại diện!');
  } catch (error) {
    toast.error('Lỗi khi tải ảnh: ' + error.message);
  } finally {
    setUploading(false);
  }
};
```

## Tùy chỉnh styling

Component sử dụng CSS custom trong file `card-avatar.css`:

### Tùy chỉnh colors:
```css
.image-area {
  border-color: #8b5cf6; /* Purple accent */
}

.nickname-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
```

### Tùy chỉnh typography:
```css
.nickname-text {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  letter-spacing: 1px;
}
```

### Tùy chỉnh hover effects:
```css
.card-avatar-frame:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

## Theme Support

### Light Theme:
- Card background: #f8f9fa
- Rank section: #f8f9fa với text đen
- Borders: white

### Dark Theme:
- Card background: #2d2d2d
- Rank section: #404040 với text trắng
- Borders: #404040

## Xử lý lỗi

Component tự động xử lý các lỗi:
- File không phải ảnh
- File quá lớn (>5MB)
- Lỗi đọc file
- Crop failed

Tất cả đều hiển thị toast notification với thông báo phù hợp.

## Accessibility

- Hỗ trợ keyboard navigation
- Focus states rõ ràng với outline
- Alt text cho tất cả hình ảnh
- ARIA labels phù hợp
- High contrast ratios

## Performance

- Lazy loading cho ảnh lớn
- Auto crop với Canvas API
- Quality compression (80%)
- Optimized re-renders
- CSS transitions cho smooth animations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- Lucide React (icons)
- Sonner (toast notifications)
- Tailwind CSS (styling)
- Canvas API (for cropping)

## Comparison với PolaroidFrame

| Feature | CardAvatar | PolaroidFrame |
|---------|------------|---------------|
| Design Style | Modern ID Card | Vintage Polaroid |
| Aspect Ratio | 3:4 Portrait | Square |
| Info Display | Integrated in Card | Separate Below |
| Target Use | Professional/Gaming | Casual/Social |
| Typography | Bold/Modern | Handwritten/Casual |

---

**Lưu ý**: Component này được thiết kế dựa trên ý tưởng layout card-style hiện đại và được tối ưu để hoạt động với hệ thống SABO ARENA.
