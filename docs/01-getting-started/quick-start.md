# 🚀 Quick Start Guide - Design System Usage

> **Hướng dẫn nhanh cho Developer khi tạo trang mới hoặc tính năng mới**

## 📋 Checklist Bắt Đầu (5 phút)

### ✅ Step 1: Import Design System
```tsx
// Luôn import design system components đầu tiên
import { Typography, Button, ProgressBar } from '@/packages/shared-ui';
import '@/packages/shared-ui/src/styles/design-system.css';
```

### ✅ Step 2: Sử Dụng Typography System
```tsx
// ❌ KHÔNG làm thế này
<h1 style={{fontSize: '24px', fontWeight: 'bold'}}>Title</h1>
<p style={{fontSize: '14px', color: '#666'}}>Description</p>

// ✅ SỬ DỤNG Typography Components
<Typography variant="heading" size="xl">Title</Typography>
<Typography variant="body" size="sm" color="muted">Description</Typography>
```

### ✅ Step 3: Sử Dụng Spacing System
```tsx
// ❌ KHÔNG làm thế này
<div style={{margin: '15px', padding: '10px'}}>

// ✅ SỬ DỤNG 8px Grid Classes
<div className="m-16 p-12"> {/* 16px margin, 12px padding */}
<div className="space-y-8">     {/* 8px vertical spacing */}
<div className="gap-4">         {/* 4px gap */}
```

### ✅ Step 4: Sử Dụng Semantic Colors
```tsx
// ❌ KHÔNG làm thế này
<Button style={{backgroundColor: '#3B82F6'}}>

// ✅ SỬ DỤNG Semantic Classes
<Button variant="primary" size="md">Submit</Button>
<Button variant="secondary" size="sm">Cancel</Button>
```

## 🎨 Design Tokens Quick Reference

### Typography Scales
```css
/* Heading Variants */
.text-heading-xs    /* 14px */
.text-heading-sm    /* 16px */
.text-heading-md    /* 18px */
.text-heading-lg    /* 20px */
.text-heading-xl    /* 24px */
.text-heading-2xl   /* 30px */
.text-heading-3xl   /* 36px */

/* Body Text Variants */
.text-body-xs       /* 12px */
.text-body-sm       /* 14px */
.text-body-md       /* 16px */
.text-body-lg       /* 18px */
```

### Spacing Classes (8px Grid)
```css
/* Margin & Padding */
.m-4, .p-4     /* 4px */
.m-8, .p-8     /* 8px */
.m-12, .p-12   /* 12px */
.m-16, .p-16   /* 16px */
.m-20, .p-20   /* 20px */
.m-24, .p-24   /* 24px */
.m-32, .p-32   /* 32px */

/* Gaps & Spacing */
.gap-4         /* 4px gap */
.space-x-8     /* 8px horizontal spacing */
.space-y-12    /* 12px vertical spacing */
```

### Color Palette
```css
/* Primary Colors */
.text-primary-600    /* Main brand color */
.bg-primary-50       /* Light background */
.border-primary-200  /* Subtle border */

/* Semantic Colors */
.text-success-600    /* Success green */
.text-error-600      /* Error red */
.text-warning-600    /* Warning orange */
.text-info-600       /* Info blue */
```

## 🏗️ Common Patterns

### 📄 Page Layout
```tsx
// Standard page structure
function NewPage() {
  return (
    <div className="container mx-auto p-24">
      <Typography variant="heading" size="2xl" className="mb-16">
        Page Title
      </Typography>
      
      <div className="space-y-24">
        {/* Page content with consistent spacing */}
      </div>
    </div>
  );
}
```

### 🃏 Card Component
```tsx
// Standard card pattern
<div className="bg-white rounded-lg border border-gray-200 p-20 space-y-12">
  <Typography variant="heading" size="lg">Card Title</Typography>
  <Typography variant="body" size="sm" color="muted">
    Card description
  </Typography>
  <Button variant="primary" size="sm">Action</Button>
</div>
```

### 📝 Form Layout
```tsx
// Standard form structure
<form className="space-y-20">
  <div className="space-y-8">
    <Typography variant="body" size="sm" weight="medium">Label</Typography>
    <input className="w-full p-12 border border-gray-300 rounded-md" />
  </div>
  
  <div className="flex gap-12">
    <Button variant="primary" size="md">Submit</Button>
    <Button variant="secondary" size="md">Cancel</Button>
  </div>
</form>
```

## 🔍 Quality Checklist

### Before Commit:
- [ ] No inline styles used
- [ ] All typography uses Typography component
- [ ] All spacing follows 8px grid
- [ ] Colors use semantic classes
- [ ] Components are reusable
- [ ] Responsive design considered

### Testing:
- [ ] Test on mobile (320px+)
- [ ] Test on tablet (768px+)
- [ ] Test on desktop (1024px+)
- [ ] Check accessibility (contrast, focus)
- [ ] Validate design tokens usage

## 🆘 Need Help?

### 📖 Full Documentation
- [ComponentGuide.md](./components.md) - Complete component reference
- [DesignTokens.md](./design-tokens.md) - All design tokens
- [UsageExamples.md](./usage-examples.md) - Real-world examples
- [DeveloperGuide.md](../04-development/guidelines.md) - Standards & guidelines

### 🤝 Common Issues
1. **Spacing không đúng**: Check 8px grid alignment
2. **Typography inconsistent**: Use Typography component
3. **Colors không match**: Use semantic color classes
4. **Component không responsive**: Check breakpoint classes

### 💡 Pro Tips
- Luôn bắt đầu với Typography và spacing
- Sử dụng semantic variants thay vì custom styles
- Check design tokens trước khi tạo custom CSS
- Test responsive ngay từ đầu

---

> **🎯 Mục tiêu**: Tạo UI consistent, maintainable và scalable cho tất cả features mới
