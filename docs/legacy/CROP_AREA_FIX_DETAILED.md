# 🔧 Sửa lỗi Crop Area không chính xác

## 🐛 Vấn đề
Khi người dùng chọn một vùng cắt trên ảnh, kết quả crop không khớp với vùng đã chọn. Điều này xảy ra do tính toán tọa độ không chính xác với CSS `object-fit: contain`.

## 🔍 Nguyên nhân
1. **Sai tính toán scale factors:** Code cũ tính scale dựa trên kích thước container thay vì kích thước ảnh hiển thị thực tế
2. **Không tính toán offset:** Khi ảnh được hiển thị với `object-contain`, có thể có padding/offset mà code không tính đến
3. **Constraint logic sai:** Crop area không bị giới hạn đúng trong vùng ảnh hiển thị

## ⚡ Giải pháp đã áp dụng

### 1. Tính toán kích thước ảnh hiển thị chính xác
```tsx
// Tính toán displayed dimensions với object-contain
const imageAspectRatio = img.naturalWidth / img.naturalHeight;
const containerAspectRatio = containerRect.width / containerRect.height;

let displayedWidth, displayedHeight, offsetX, offsetY;

if (imageAspectRatio > containerAspectRatio) {
  // Image rộng hơn - fit theo width
  displayedWidth = containerRect.width;
  displayedHeight = containerRect.width / imageAspectRatio;
  offsetX = 0;
  offsetY = (containerRect.height - displayedHeight) / 2;
} else {
  // Image cao hơn - fit theo height
  displayedHeight = containerRect.height;
  displayedWidth = containerRect.height * imageAspectRatio;
  offsetX = (containerRect.width - displayedWidth) / 2;
  offsetY = 0;
}
```

### 2. Sửa scale factors calculation
```tsx
// Scale từ displayed image sang natural size
const scaleX = img.naturalWidth / displayedWidth;
const scaleY = img.naturalHeight / displayedHeight;

// Adjust crop coordinates với offset và scale
const adjustedX = (cropArea.x - offsetX) * scaleX / scale;
const adjustedY = (cropArea.y - offsetY) * scaleY / scale;
```

### 3. Constraint crop area trong image bounds
```tsx
// Drag constraints
const newX = Math.max(offsetX, Math.min(
  e.clientX - containerRect.left - dragStart.x, 
  offsetX + displayedWidth - cropArea.width
));
const newY = Math.max(offsetY, Math.min(
  e.clientY - containerRect.top - dragStart.y, 
  offsetY + displayedHeight - cropArea.height
));
```

### 4. Khởi tạo crop area chính xác
```tsx
// Tạo crop area 80% của displayed image, centered
const cropSize = Math.min(displayedWidth, displayedHeight) * 0.8;
const centerX = offsetX + (displayedWidth - cropSize) / 2;
const centerY = offsetY + (displayedHeight - cropSize) / 2;
```

## 🎯 Files đã sửa
- `src/components/ui/mobile-image-cropper.tsx` - Toàn bộ logic crop
- `crop-debug.html` - Tool debug để test calculations

## 🧪 Cách test

### Test với ảnh thực tế:
1. Vào http://localhost:8081 → Profile → Đổi avatar
2. Chọn ảnh "chiến binh cánh" như trong screenshot
3. Di chuyển crop area đến vị trí mong muốn
4. Nhấn "Cắt ảnh" và kiểm tra kết quả

### Test với debug tool:
1. Mở http://localhost:8081/crop-debug.html  
2. Upload cùng ảnh
3. Xem calculations để verify logic
4. Click "Simulate Crop" để xem kết quả

## ✅ Kết quả mong đợi
- Crop area hiển thị đúng vị trí trên ảnh
- Kết quả crop khớp với vùng đã chọn
- Smooth dragging trong bounds của ảnh hiển thị
- Console logs chi tiết để debug

## 📝 Notes
- Ảnh crop output: 400x400px, JPEG quality 90%
- Aspect ratio mặc định: 1:1 (vuông)
- Support zoom và rotation (rotation needs testing)
- Image constraints: ≤5MB, formats: JPG/PNG/GIF
