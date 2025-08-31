# 🎨 CSS Best Practices Cheat Sheet

## ⚡ Quick Reference cho Style Editing

### 🎯 **DO's - Làm như thế này**

#### ✅ Typography
```css
/* Use design token variables */
font-family: var(--font-family-body);
font-size: var(--font-size-heading-lg);
font-weight: var(--font-weight-semibold);
line-height: var(--line-height-heading-lg);
color: var(--color-text-primary);
```

#### ✅ Colors
```css
/* Semantic color usage */
background-color: var(--color-surface-primary);
color: var(--color-text-secondary);
border-color: var(--color-border-subtle);
```

#### ✅ Spacing (8px Grid)
```css
/* Follow 8px grid system */
padding: var(--space-16);  /* 16px */
margin: var(--space-12);   /* 12px */
gap: var(--space-8);       /* 8px */
```

#### ✅ Responsive Design
```css
/* Mobile-first approach */
.component {
  padding: var(--space-16);
}

@media (min-width: 768px) {
  .component {
    padding: var(--space-24);
  }
}
```

### ❌ **DON'Ts - Tránh làm như thế này**

#### ❌ Hardcoded Values
```css
/* Don't hardcode colors */
color: #3b82f6;           /* ❌ */
background: #ffffff;      /* ❌ */

/* Don't hardcode fonts */
font-size: 18px;          /* ❌ */
font-weight: 600;         /* ❌ */

/* Don't break 8px grid */
padding: 15px;            /* ❌ */
margin: 25px;             /* ❌ */
```

#### ❌ Inline Styles
```tsx
/* Don't use inline styles */
<div style={{fontSize: '16px', color: '#333'}}>  {/* ❌ */}

/* Use classes instead */
<div className="text-body-md text-primary">     {/* ✅ */}
```

## 🎨 Color Palette Quick Access

### Primary Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-primary-50` | #eff6ff | Light backgrounds |
| `--color-primary-500` | #3b82f6 | Primary buttons |
| `--color-primary-600` | #2563eb | Primary text |
| `--color-primary-700` | #1d4ed8 | Hover states |

### Semantic Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--color-success-500` | #22c55e | Success states |
| `--color-error-500` | #ef4444 | Error states |
| `--color-warning-500` | #f59e0b | Warning states |
| `--color-info-500` | #06b6d4 | Info states |

### Text Colors
| Variable | Usage |
|----------|-------|
| `--color-text-primary` | Main text content |
| `--color-text-secondary` | Secondary information |
| `--color-text-muted` | Subtle/placeholder text |
| `--color-text-inverse` | Light text on dark |

## 📏 Spacing Scale (8px Grid)

| Class | Variable | Value | Usage |
|-------|----------|-------|-------|
| `.p-4` | `--space-4` | 4px | Tight padding |
| `.p-8` | `--space-8` | 8px | Small padding |
| `.p-12` | `--space-12` | 12px | Default padding |
| `.p-16` | `--space-16` | 16px | Medium padding |
| `.p-20` | `--space-20` | 20px | Large padding |
| `.p-24` | `--space-24` | 24px | Card padding |
| `.p-32` | `--space-32` | 32px | Section padding |
| `.p-40` | `--space-40` | 40px | Page padding |

## 📝 Typography Scale

### Heading Sizes
| Size | Variable | Value | Usage |
|------|----------|-------|-------|
| `xs` | `--font-size-heading-xs` | 14px | Small headings |
| `sm` | `--font-size-heading-sm` | 16px | Section titles |
| `md` | `--font-size-heading-md` | 18px | Card titles |
| `lg` | `--font-size-heading-lg` | 20px | Page sections |
| `xl` | `--font-size-heading-xl` | 24px | Page titles |
| `2xl` | `--font-size-heading-2xl` | 30px | Hero titles |
| `3xl` | `--font-size-heading-3xl` | 36px | Display titles |

### Body Text Sizes
| Size | Variable | Value | Usage |
|------|----------|-------|-------|
| `xs` | `--font-size-body-xs` | 12px | Fine print |
| `sm` | `--font-size-body-sm` | 14px | Secondary text |
| `md` | `--font-size-body-md` | 16px | Default body |
| `lg` | `--font-size-body-lg` | 18px | Large body |

## 🎭 Common Patterns

### Card Component
```css
.card {
  background-color: var(--color-surface-primary);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-20);
  box-shadow: var(--shadow-sm);
}
```

### Button Styles
```css
.button-primary {
  background-color: var(--color-primary-600);
  color: var(--color-white);
  padding: var(--space-12) var(--space-20);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
}

.button-primary:hover {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-md);
}
```

### Form Elements
```css
.input {
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-12);
  font-size: var(--font-size-body-md);
  color: var(--color-text-primary);
}

.input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile First - Default styles for mobile */
.responsive-component {
  font-size: var(--font-size-body-sm);
  padding: var(--space-16);
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .responsive-component {
    font-size: var(--font-size-body-md);
    padding: var(--space-20);
  }
}

/* Desktop - 1024px and up */
@media (min-width: 1024px) {
  .responsive-component {
    font-size: var(--font-size-body-lg);
    padding: var(--space-24);
  }
}

/* Large Desktop - 1280px and up */
@media (min-width: 1280px) {
  .responsive-component {
    padding: var(--space-32);
  }
}
```

## 🔍 Quick Validation

### ✅ Checklist trước khi commit:
- [ ] No inline styles (`style={}`)
- [ ] No hardcoded colors (`#ffffff`)
- [ ] Follow 8px grid spacing
- [ ] Use design token variables
- [ ] Typography component for text
- [ ] Responsive design tested
- [ ] Accessibility checked

### 🛠️ Quick Tools:
```bash
# Validate styles
./scripts/style-validation.sh

# Create style report
./scripts/style-validation.sh --report

# Show quick guide
./scripts/auto-reference-design-system.sh --guide
```

---

> **💡 Pro Tip**: Print this cheat sheet và keep nó beside your monitor cho quick reference!
