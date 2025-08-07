# PolaroidFrame Component

## Mô tả

Component `PolaroidFrame` là một khung ảnh kiểu Polaroid được tích hợp vào trang Profile để người dùng có thể tải lên và hiển thị avatar của họ với giao diện đẹp mắt và thân thiện.

## Tính năng

### 🖼️ Khung ảnh Polaroid (Layout v2)
- Sử dụng background PNG từ Supabase Storage (layout1.png)
- Định vị chính xác avatar trong khung ảnh với layout cải tiến
- Hiệu ứng hover và transition mượt mà
- Vùng ảnh được tối ưu: top 6%, width 72%, height 58%

### ✂️ Chức năng cắt ảnh tự động
- Tự động cắt ảnh thành hình vuông
- Xem trước kết quả trước khi lưu
- Hỗ trợ nhiều định dạng ảnh (JPEG, PNG, WebP)

### 📱 Responsive Design
- Tối ưu cho mọi kích thước màn hình
- Tự động điều chỉnh kích thước
- Hỗ trợ 3 kích thước: sm, md, lg

### 🎨 Tùy chỉnh giao diện
- Hỗ trợ Light/Dark theme
- Hiệu ứng loading với animation
- Gradient placeholder khi chưa có ảnh

## Cách sử dụng

### Import component

```tsx
import PolaroidFrame from '@/components/ui/polaroid-frame';
```

### Sử dụng cơ bản

```tsx
<PolaroidFrame
  userAvatar={profile.avatar_url}
  onAvatarChange={handleAvatarUpload}
  uploading={uploading}
  fallbackName={profile.display_name || 'User'}
  size="md"
  className="mb-4"
/>
```

## Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `userAvatar` | `string \| null` | `undefined` | URL ảnh avatar hiện tại |
| `onAvatarChange` | `(file: File, croppedDataUrl?: string) => void` | `undefined` | Callback khi ảnh được thay đổi |
| `uploading` | `boolean` | `false` | Trạng thái đang upload |
| `fallbackName` | `string` | `'U'` | Tên hiển thị khi chưa có avatar |
| `className` | `string` | `''` | CSS class tùy chỉnh |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước khung ảnh |

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

## Kích thước và responsive

### Kích thước có sẵn:
- **sm**: 240px max-width
- **md**: 90vw width, 320px max-width (default)
- **lg**: 90vw width, 380px max-width

### Breakpoints:
- **Mobile** (≤640px): Tối ưu padding và kích thước
- **Small Mobile** (≤480px): Giảm margin cho gọn gàng

## Tùy chỉnh styling

Component sử dụng CSS custom trong file `polaroid-frame.css`:

```css
/* Tùy chỉnh hover effect */
.polaroid-frame-container .group:hover {
  transform: scale(1.01);
}

/* Tùy chỉnh theme */
[data-theme="dark"] .polaroid-frame-container {
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.4));
}
```

## Xử lý lỗi

Component tự động xử lý các lỗi:
- File không phải ảnh
- File quá lớn (>5MB)
- Lỗi đọc file

Tất cả đều hiển thị toast notification với thông báo phù hợp.

## Accessibility

- Hỗ trợ keyboard navigation
- Focus states rõ ràng
- Alt text cho tất cả hình ảnh
- ARIA labels phù hợp

## Performance

- Lazy loading cho ảnh lớn
- Tự động nén ảnh về 400x400px
- Quality compression (80%)
- Debounced file operations

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

---

**Lưu ý**: Component này được tối ưu để hoạt động với Supabase Storage và authentication system của SABO ARENA.
