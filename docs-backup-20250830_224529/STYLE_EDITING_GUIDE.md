# 🎨 Style Editing Guide - Design System Standards

> **Hướng dẫn chi tiết cho việc chỉnh sửa styles, fonts, màu sắc trong Design System**

## 📋 Nguyên Tắc Cơ Bản

### ⚠️ **QUY TẮC VÀNG**
1. **KHÔNG BAO GIỜ** sử dụng inline styles
2. **LUÔN LUÔN** sử dụng design tokens
3. **KIỂM TRA** design system trước khi tạo custom styles
4. **FOLLOW** 8px grid system cho spacing
5. **SỬ DỤNG** semantic classes thay vì hardcoded values

## 🎯 Font & Typography Editing

### ✅ **ĐÚNG - Sử Dụng Typography Component**
```tsx
// ✅ Use Typography component với semantic variants
<Typography variant="heading" size="xl" weight="bold">
  Main Title
</Typography>

<Typography variant="body" size="md" color="muted">
  Body text with semantic styling
</Typography>

<Typography variant="caption" size="sm" weight="medium">
  Caption text
</Typography>
```

### ❌ **SAI - Inline Styles hay Custom CSS**
```tsx
// ❌ KHÔNG làm thế này
<h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#333'}}>
  Title
</h1>

// ❌ KHÔNG làm thế này
<p className="custom-text">Text</p>
.custom-text {
  font-size: 16px;
  font-weight: 400;
  color: #666;
}
```

### 📐 **Typography Scales Available**

#### **Heading Scale**
```tsx
<Typography variant="heading" size="xs">14px - Small headings</Typography>
<Typography variant="heading" size="sm">16px - Section headings</Typography>
<Typography variant="heading" size="md">18px - Card titles</Typography>
<Typography variant="heading" size="lg">20px - Page sections</Typography>
<Typography variant="heading" size="xl">24px - Page titles</Typography>
<Typography variant="heading" size="2xl">30px - Hero titles</Typography>
<Typography variant="heading" size="3xl">36px - Display titles</Typography>
```

#### **Body Text Scale**
```tsx
<Typography variant="body" size="xs">12px - Fine print</Typography>
<Typography variant="body" size="sm">14px - Secondary text</Typography>
<Typography variant="body" size="md">16px - Default body</Typography>
<Typography variant="body" size="lg">18px - Large body</Typography>
```

#### **Font Weights**
```tsx
<Typography weight="light">300 - Light text</Typography>
<Typography weight="normal">400 - Regular text</Typography>
<Typography weight="medium">500 - Medium emphasis</Typography>
<Typography weight="semibold">600 - Strong emphasis</Typography>
<Typography weight="bold">700 - Bold text</Typography>
```

### 🎨 **Custom Typography CSS (Khi cần thiết)**
```css
/* ✅ Sử dụng design tokens */
.custom-typography {
  font-family: var(--font-family-body);
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-body-md);
  color: var(--color-text-primary);
}

/* ✅ Responsive typography */
.responsive-title {
  font-size: var(--font-size-heading-lg);
  
  @media (min-width: 768px) {
    font-size: var(--font-size-heading-xl);
  }
  
  @media (min-width: 1024px) {
    font-size: var(--font-size-heading-2xl);
  }
}
```

## 🌈 Color System Editing

### 🎯 **Semantic Color Usage**

#### **Text Colors**
```tsx
// ✅ Primary text colors
<Typography color="primary">Primary text color</Typography>
<Typography color="secondary">Secondary text</Typography>
<Typography color="muted">Muted/subtle text</Typography>
<Typography color="inverse">Light text on dark bg</Typography>

// ✅ State colors
<Typography color="success">Success message</Typography>
<Typography color="error">Error message</Typography>
<Typography color="warning">Warning message</Typography>
<Typography color="info">Info message</Typography>
```

#### **Background Colors**
```tsx
// ✅ Surface colors
<div className="bg-surface-primary">Main content background</div>
<div className="bg-surface-secondary">Card/panel background</div>
<div className="bg-surface-tertiary">Subtle section background</div>

// ✅ State backgrounds
<div className="bg-success-50">Success background</div>
<div className="bg-error-50">Error background</div>
<div className="bg-warning-50">Warning background</div>
<div className="bg-info-50">Info background</div>
```

#### **Border Colors**
```tsx
<div className="border border-subtle">Subtle border</div>
<div className="border border-default">Default border</div>
<div className="border border-strong">Strong border</div>
<div className="border border-primary-200">Primary colored border</div>
```

### 🎨 **Color Palette Reference**

#### **Primary Colors**
```css
/* Blue - Primary brand color */
--color-primary-50: #eff6ff;   /* Very light blue */
--color-primary-100: #dbeafe;  /* Light blue */
--color-primary-200: #bfdbfe;  /* Lighter blue */
--color-primary-300: #93c5fd;  /* Light blue */
--color-primary-400: #60a5fa;  /* Medium blue */
--color-primary-500: #3b82f6;  /* Primary blue */
--color-primary-600: #2563eb;  /* Dark blue */
--color-primary-700: #1d4ed8;  /* Darker blue */
--color-primary-800: #1e40af;  /* Very dark blue */
--color-primary-900: #1e3a8a;  /* Darkest blue */
```

#### **Semantic Colors**
```css
/* Success - Green */
--color-success-50: #f0fdf4;
--color-success-500: #22c55e;
--color-success-600: #16a34a;

/* Error - Red */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Warning - Orange */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Info - Cyan */
--color-info-50: #ecfeff;
--color-info-500: #06b6d4;
--color-info-600: #0891b2;
```

#### **Neutral Colors**
```css
/* Gray scale */
--color-gray-50: #f9fafb;    /* Very light gray */
--color-gray-100: #f3f4f6;   /* Light gray */
--color-gray-200: #e5e7eb;   /* Lighter gray */
--color-gray-300: #d1d5db;   /* Light gray */
--color-gray-400: #9ca3af;   /* Medium gray */
--color-gray-500: #6b7280;   /* Gray */
--color-gray-600: #4b5563;   /* Dark gray */
--color-gray-700: #374151;   /* Darker gray */
--color-gray-800: #1f2937;   /* Very dark gray */
--color-gray-900: #111827;   /* Darkest gray */
```

### ✅ **Color Usage Examples**
```css
/* ✅ ĐÚNG - Sử dụng semantic color variables */
.success-card {
  background-color: var(--color-success-50);
  border: 1px solid var(--color-success-200);
  color: var(--color-success-800);
}

.primary-button {
  background-color: var(--color-primary-600);
  color: var(--color-white);
  border: none;
}

.primary-button:hover {
  background-color: var(--color-primary-700);
}

/* ❌ SAI - Hardcoded colors */
.wrong-card {
  background-color: #f0fdf4; /* Don't hardcode */
  border: 1px solid #22c55e; /* Use variables instead */
  color: #166534;             /* Not maintainable */
}
```

## 📏 Spacing & Layout Editing

### 🎯 **8px Grid System**

#### **Spacing Classes Available**
```css
/* Margin classes */
.m-4   /* margin: 4px */
.m-8   /* margin: 8px */
.m-12  /* margin: 12px */
.m-16  /* margin: 16px */
.m-20  /* margin: 20px */
.m-24  /* margin: 24px */
.m-32  /* margin: 32px */
.m-40  /* margin: 40px */
.m-48  /* margin: 48px */

/* Padding classes */
.p-4, .p-8, .p-12, .p-16, .p-20, .p-24, .p-32, .p-40, .p-48

/* Directional spacing */
.mt-16  /* margin-top: 16px */
.mb-20  /* margin-bottom: 20px */
.ml-8   /* margin-left: 8px */
.mr-12  /* margin-right: 12px */
.mx-16  /* margin horizontal: 16px */
.my-20  /* margin vertical: 20px */

/* Same pattern for padding: pt-, pb-, pl-, pr-, px-, py- */
```

#### **Gap & Space Classes**
```css
/* Flexbox gaps */
.gap-4    /* gap: 4px */
.gap-8    /* gap: 8px */
.gap-12   /* gap: 12px */
.gap-16   /* gap: 16px */
.gap-20   /* gap: 20px */

/* Space between children */
.space-x-8 > * + *  /* horizontal spacing: 8px */
.space-y-12 > * + * /* vertical spacing: 12px */
```

### ✅ **Spacing Usage Examples**
```tsx
// ✅ ĐÚNG - Sử dụng spacing classes
<div className="p-20 space-y-16">
  <div className="mb-12">
    <Typography variant="heading" size="lg">Title</Typography>
  </div>
  
  <div className="flex gap-8">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
  </div>
</div>

// ❌ SAI - Custom spacing
<div style={{padding: '18px', marginBottom: '15px'}}>
  // Don't use non-grid values
</div>
```

### 🎨 **Custom Spacing CSS (Khi cần thiết)**
```css
/* ✅ Sử dụng spacing variables */
.custom-component {
  padding: var(--space-20);
  margin-bottom: var(--space-16);
  gap: var(--space-12);
}

/* ✅ Responsive spacing */
.responsive-container {
  padding: var(--space-16);
  
  @media (min-width: 768px) {
    padding: var(--space-24);
  }
  
  @media (min-width: 1024px) {
    padding: var(--space-32);
  }
}
```

## 🎭 Shadow & Effects Editing

### 🌟 **Shadow System**
```css
/* Available shadow levels */
.shadow-xs     /* Subtle shadow for cards */
.shadow-sm     /* Small shadow for buttons */
.shadow-md     /* Medium shadow for modals */
.shadow-lg     /* Large shadow for dropdowns */
.shadow-xl     /* Extra large for overlays */

/* Custom shadows using variables */
.custom-card {
  box-shadow: var(--shadow-md);
}

.hover-effect:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### 🎨 **Border Radius**
```css
/* Available radius sizes */
.rounded-none  /* border-radius: 0 */
.rounded-sm    /* border-radius: 2px */
.rounded-md    /* border-radius: 4px */
.rounded-lg    /* border-radius: 8px */
.rounded-xl    /* border-radius: 12px */
.rounded-2xl   /* border-radius: 16px */
.rounded-full  /* border-radius: 9999px (circular) */

/* Using variables */
.custom-component {
  border-radius: var(--radius-md);
}
```

## 🔄 Animation & Transitions

### ⚡ **Transition Classes**
```css
/* Duration classes */
.duration-150  /* transition-duration: 150ms */
.duration-200  /* transition-duration: 200ms */
.duration-300  /* transition-duration: 300ms */

/* Easing classes */
.ease-in       /* transition-timing-function: ease-in */
.ease-out      /* transition-timing-function: ease-out */
.ease-in-out   /* transition-timing-function: ease-in-out */

/* Combined transition */
.transition-all {
  transition: all 0.2s ease-in-out;
}
```

### 🎯 **Animation Examples**
```css
/* ✅ Button hover animation */
.animated-button {
  background-color: var(--color-primary-600);
  transition: all 0.2s ease-in-out;
}

.animated-button:hover {
  background-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* ✅ Card hover effect */
.interactive-card {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## 📱 Responsive Design Guidelines

### 🎯 **Breakpoint System**
```css
/* Mobile First Approach */
.responsive-component {
  /* Mobile styles (default) */
  font-size: var(--font-size-body-sm);
  padding: var(--space-16);
}

@media (min-width: 640px) {
  /* Tablet styles */
  .responsive-component {
    font-size: var(--font-size-body-md);
    padding: var(--space-20);
  }
}

@media (min-width: 1024px) {
  /* Desktop styles */
  .responsive-component {
    font-size: var(--font-size-body-lg);
    padding: var(--space-24);
  }
}
```

### 📱 **Responsive Typography**
```tsx
// ✅ Responsive typography với utility classes
<Typography 
  variant="heading" 
  size="lg"
  className="md:text-heading-xl lg:text-heading-2xl"
>
  Responsive Title
</Typography>
```

## 🔍 Quality Checklist

### ✅ **Before Commit - Style Checklist**
- [ ] **No inline styles** used anywhere
- [ ] **Design tokens** used for all colors
- [ ] **8px grid** followed for all spacing
- [ ] **Typography component** used for all text
- [ ] **Semantic classes** used instead of custom CSS
- [ ] **Responsive design** considered and tested
- [ ] **Accessibility** (contrast, focus states) checked
- [ ] **Performance** (no excessive CSS) optimized

### 🎯 **Testing Checklist**
- [ ] Test on **mobile** (320px - 767px)
- [ ] Test on **tablet** (768px - 1023px)  
- [ ] Test on **desktop** (1024px+)
- [ ] Check **dark mode** compatibility (if applicable)
- [ ] Verify **color contrast** ratios (WCAG compliance)
- [ ] Test **keyboard navigation** và focus states
- [ ] Validate **hover states** và interactions

## 🚨 Common Mistakes & Solutions

### ❌ **Mistake 1: Hardcoded Colors**
```css
/* ❌ WRONG */
.button {
  background-color: #3b82f6;
  color: #ffffff;
}

/* ✅ CORRECT */
.button {
  background-color: var(--color-primary-600);
  color: var(--color-white);
}
```

### ❌ **Mistake 2: Non-Grid Spacing**
```css
/* ❌ WRONG */
.card {
  padding: 15px;
  margin: 25px;
}

/* ✅ CORRECT */
.card {
  padding: var(--space-16); /* 16px - follows 8px grid */
  margin: var(--space-24);   /* 24px - follows 8px grid */
}
```

### ❌ **Mistake 3: Custom Typography**
```css
/* ❌ WRONG */
.title {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

/* ✅ CORRECT */
.title {
  font-size: var(--font-size-heading-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-heading-lg);
}
```

## 💡 Pro Tips

### 🎯 **Development Workflow**
1. **Check existing tokens** trước khi tạo custom styles
2. **Use browser DevTools** để test responsive design
3. **Follow mobile-first** approach cho responsive
4. **Test accessibility** với screen readers
5. **Validate với design team** trước khi implement

### 🔧 **VS Code Extensions Recommended**
- **CSS Peek** - Navigate to CSS definitions
- **IntelliSense for CSS** - Auto-complete CSS properties
- **Color Highlight** - Highlight colors trong code
- **Auto Rename Tag** - Sync HTML tag changes
- **Bracket Pair Colorizer** - Visual bracket matching

### 📚 **Quick Reference Links**
- [Design Tokens](/docs/DesignTokens.md) - Complete token reference
- [Component Guide](/docs/ComponentGuide.md) - Component usage
- [Quick Start Guide](/docs/QUICK_START_GUIDE.md) - 5-minute setup
- [Usage Examples](/docs/UsageExamples.md) - Real-world patterns

---

> **🎯 Remember**: Design system là để tạo consistency và maintainability. Mỗi custom style bạn thêm là một potential inconsistency. Always check design tokens first!
