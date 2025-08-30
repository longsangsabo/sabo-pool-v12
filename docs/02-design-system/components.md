# Design System Component Guide

## Overview
Comprehensive guide to all components in the Sabo Pool Design System, including usage examples, variants, and best practices.

## Typography Components

### Typography
The base typography component with semantic variants.

```tsx
import { Typography } from '@shared/shared-ui';

// Basic usage
<Typography variant="heading">Page Title</Typography>
<Typography variant="body">Regular content</Typography>
<Typography variant="caption">Small text</Typography>

// With custom styling
<Typography variant="title" className="text-primary-600">
  Colored Title
</Typography>
```

#### Variants
- `caption` - 12px/16px - Small labels, captions
- `body-small` - 14px/20px - Secondary text, form labels
- `body` - 16px/24px - Primary content, paragraphs
- `body-large` - 18px/28px - Emphasized content
- `title` - 20px/28px - Section titles, card headers
- `heading` - 24px/32px - Page headers, main titles
- `display` - 30px/36px - Hero headings, landing pages

### Semantic Typography Classes
Use these CSS classes for common typography patterns:

```css
/* Size + Weight Combinations */
.text-caption-medium        /* Small text with emphasis */
.text-body-small-medium     /* Form labels with weight */
.text-body-large-semibold   /* Emphasized content */
.text-heading-bold          /* Strong headings */

/* Size + Color Combinations */
.text-caption-neutral       /* Muted small text */
.text-body-small-muted      /* Secondary body text */
.text-heading-primary       /* Primary colored headings */
.text-heading-success       /* Success state headings */
```

## Button Components

### Button Variants
The design system provides 5 semantic button variants:

```tsx
import { Button } from '@shared/shared-ui';

// Primary action
<Button variant="default">Primary Action</Button>

// Destructive action
<Button variant="destructive">Delete Item</Button>

// Secondary action
<Button variant="outline">Secondary Action</Button>

// Minimal action
<Button variant="ghost">Ghost Button</Button>

// Links and navigation
<Button variant="link">Link Button</Button>
```

#### Button Sizes
```tsx
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">🎯</Button>
```

#### Button States
```tsx
<Button disabled>Disabled State</Button>
<Button loading>Loading State</Button>
```

## Layout Components

### DynamicSizer
For components requiring dynamic dimensions:

```tsx
import { DynamicSizer } from '@shared/shared-ui';

<DynamicSizer width={avatarSize} height={avatarSize}>
  <img src={avatar} alt="User Avatar" />
</DynamicSizer>

<DynamicSizer aspectRatio="16/9" className="w-full">
  <video src={videoUrl} />
</DynamicSizer>
```

### Spacing Utilities
Use semantic spacing classes for consistent layouts:

```tsx
// Component spacing
<Card className="card-spacing">      {/* p-6 (24px) */}
  <div className="content-spacing">  {/* p-4 (16px) */}
    Content here
  </div>
</Card>

// Stack layouts
<div className="stack-normal">       {/* space-y-4 (16px) */}
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Inline layouts
<div className="flex inline-normal"> {/* space-x-4 (16px) */}
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

## Form Components

### Form Spacing
Use consistent spacing for form layouts:

```tsx
<form className="form-spacing">      {/* space-y-4 (16px) */}
  <div className="form-field">
    <label className="text-body-small-medium">Field Label</label>
    <input className="content-spacing" />  {/* p-4 (16px) */}
  </div>
  
  <div className="form-field">
    <label className="text-body-small-medium">Another Field</label>
    <input className="content-spacing" />
  </div>
  
  <div className="flex inline-normal">
    <Button type="submit">Submit</Button>
    <Button variant="outline">Cancel</Button>
  </div>
</form>
```

## Progress Components

### ProgressBar
For dynamic progress indicators:

```tsx
import { ProgressBar } from '@shared/shared-ui';

<ProgressBar 
  progress={75} 
  variant="success" 
  size="md"
  showLabel={true}
/>

// CSS approach for inline progress
<div className="progress-bar-dynamic" 
     style={{ "--progress-width": `${progress}%` }}>
</div>
```

## Best Practices

### Component Composition
1. **Use semantic variants** instead of custom styling
2. **Combine components systematically** for consistent experiences
3. **Follow spacing guidelines** with semantic classes
4. **Leverage design tokens** through CSS custom properties

### Typography Guidelines
1. **Use Typography component** for all text content
2. **Choose semantic variants** based on content hierarchy
3. **Combine with color tokens** for consistent theming
4. **Avoid custom font sizes** outside the design system

### Layout Guidelines
1. **Follow 8px grid system** for all spacing
2. **Use semantic spacing classes** for component layouts
3. **Combine spacing utilities** for complex layouts
4. **Maintain consistent rhythm** through systematic spacing

### Button Guidelines
1. **Use semantic variants** for clear action hierarchy
2. **Limit button variants** per interface section
3. **Follow accessibility guidelines** for interactive elements
4. **Use consistent sizing** within component groups

## Component Checklist

Before implementing a new component:

- [ ] Uses design system tokens (colors, typography, spacing)
- [ ] Follows 8px grid system for all spacing
- [ ] Implements semantic variants for different use cases
- [ ] Includes TypeScript interfaces for props
- [ ] Provides usage examples and documentation
- [ ] Tests accessibility requirements
- [ ] Validates responsive behavior
- [ ] Integrates with existing component patterns
