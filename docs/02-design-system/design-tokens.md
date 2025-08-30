# Design Tokens Reference

## Overview
Complete reference for all design tokens in the Sabo Pool Design System, including usage guidelines and semantic meanings.

## Color System

### Primary Color Palette
The primary blue palette for main actions and branding:

```css
/* Primary Colors - Blue Theme */
--primary-50: #eff6ff;   /* Very light backgrounds */
--primary-100: #dbeafe;  /* Light backgrounds, disabled states */
--primary-200: #bfdbfe;  /* Hover states, light accents */
--primary-300: #93c5fd;  /* Subtle emphasis */
--primary-400: #60a5fa;  /* Secondary actions */
--primary-500: #3b82f6;  /* Default primary color */
--primary-600: #2563eb;  /* Primary buttons, links */
--primary-700: #1d4ed8;  /* Hover states */
--primary-800: #1e40af;  /* Active states */
--primary-900: #1e3a8a;  /* High emphasis */
```

**Usage:**
- `primary-600` - Primary buttons, main CTAs
- `primary-500` - Default primary color
- `primary-100` - Light backgrounds, subtle highlights

### Success Color Palette
Green palette for positive actions and success states:

```css
/* Success Colors - Green Theme */
--success-50: #f0fdf4;   /* Success backgrounds */
--success-100: #dcfce7;  /* Light success states */
--success-200: #bbf7d0;  /* Success hover states */
--success-300: #86efac;  /* Success accents */
--success-400: #4ade80;  /* Success secondary */
--success-500: #22c55e;  /* Default success */
--success-600: #16a34a;  /* Success buttons */
--success-700: #15803d;  /* Success emphasis */
--success-800: #166534;  /* Success dark */
--success-900: #14532d;  /* Success darkest */
```

**Usage:**
- `success-600` - Success buttons, positive actions
- `success-100` - Success message backgrounds
- `success-500` - Success icons, indicators

### Error Color Palette
Red palette for errors and destructive actions:

```css
/* Error Colors - Red Theme */
--error-50: #fef2f2;     /* Error backgrounds */
--error-100: #fee2e2;    /* Light error states */
--error-200: #fecaca;    /* Error hover states */
--error-300: #fca5a5;    /* Error accents */
--error-400: #f87171;    /* Error secondary */
--error-500: #ef4444;    /* Default error */
--error-600: #dc2626;    /* Error buttons */
--error-700: #b91c1c;    /* Error emphasis */
--error-800: #991b1b;    /* Error dark */
--error-900: #7f1d1d;    /* Error darkest */
```

**Usage:**
- `error-600` - Destructive buttons, error text
- `error-100` - Error message backgrounds
- `error-500` - Error icons, validation

### Neutral Color Palette
Grayscale palette for text, backgrounds, and UI elements:

```css
/* Neutral Colors - Gray Theme */
--neutral-50: #f9fafb;   /* Page backgrounds */
--neutral-100: #f3f4f6;  /* Card backgrounds */
--neutral-200: #e5e7eb;  /* Borders, dividers */
--neutral-300: #d1d5db;  /* Input borders */
--neutral-400: #9ca3af;  /* Placeholder text */
--neutral-500: #6b7280;  /* Secondary text */
--neutral-600: #4b5563;  /* Body text */
--neutral-700: #374151;  /* Headings */
--neutral-800: #1f2937;  /* High emphasis text */
--neutral-900: #111827;  /* Highest emphasis */
```

**Usage:**
- `neutral-900` - Primary text, headings
- `neutral-600` - Body text, paragraphs
- `neutral-500` - Secondary text, captions
- `neutral-200` - Borders, separators
- `neutral-100` - Background surfaces

## Typography System

### Font Size Scale
Based on 8px grid system with consistent line heights:

```css
/* Typography Scale */
.text-caption     { font-size: 12px; line-height: 16px; }  /* 0.75rem/1rem */
.text-body-small  { font-size: 14px; line-height: 20px; }  /* 0.875rem/1.25rem */
.text-body        { font-size: 16px; line-height: 24px; }  /* 1rem/1.5rem */
.text-body-large  { font-size: 18px; line-height: 28px; }  /* 1.125rem/1.75rem */
.text-title       { font-size: 20px; line-height: 28px; }  /* 1.25rem/1.75rem */
.text-heading     { font-size: 24px; line-height: 32px; }  /* 1.5rem/2rem */
.text-display     { font-size: 30px; line-height: 36px; }  /* 1.875rem/2.25rem */
```

### Font Weight Scale
Standardized font weights for consistent hierarchy:

```css
/* Font Weights */
.font-normal    { font-weight: 400; }  /* Regular text */
.font-medium    { font-weight: 500; }  /* Emphasized text */
.font-semibold  { font-weight: 600; }  /* Headings, labels */
.font-bold      { font-weight: 700; }  /* Strong emphasis */
```

### Typography Usage Guidelines

**Caption (12px):**
- Form field descriptions
- Image captions
- Footnotes and disclaimers
- Status indicators

**Body Small (14px):**
- Form labels
- Navigation items
- Secondary information
- Card metadata

**Body (16px):**
- Primary content
- Paragraph text
- Default interface text
- Description text

**Body Large (18px):**
- Emphasized content
- Lead paragraphs
- Important descriptions
- Card titles

**Title (20px):**
- Section headers
- Card titles
- Modal headers
- Form section titles

**Heading (24px):**
- Page headers
- Main section titles
- Primary headings
- Dashboard titles

**Display (30px):**
- Hero headings
- Landing page titles
- Marketing headers
- Feature callouts

## Spacing System

### 8px Grid System
All spacing follows multiples of 8px for consistent rhythm:

```css
/* Spacing Scale (8px base grid) */
--spacing-0: 0;       /* No spacing */
--spacing-1: 4px;     /* 0.5 grid units */
--spacing-2: 8px;     /* 1 grid unit */
--spacing-3: 12px;    /* 1.5 grid units */
--spacing-4: 16px;    /* 2 grid units */
--spacing-6: 24px;    /* 3 grid units */
--spacing-8: 32px;    /* 4 grid units */
--spacing-12: 48px;   /* 6 grid units */
--spacing-16: 64px;   /* 8 grid units */
--spacing-20: 80px;   /* 10 grid units */
--spacing-24: 96px;   /* 12 grid units */
--spacing-32: 128px;  /* 16 grid units */
```

### Semantic Spacing
Purpose-driven spacing for specific component types:

```css
/* Component Spacing */
.card-spacing     { padding: 24px; }      /* Card internal spacing */
.content-spacing  { padding: 16px; }      /* Content area padding */
.form-spacing     { gap: 16px; }          /* Form field spacing */
.section-spacing  { padding: 48px 0; }    /* Section vertical spacing */

/* Layout Spacing */
.stack-tight      { gap: 8px; }           /* Minimal vertical spacing */
.stack-normal     { gap: 16px; }          /* Standard vertical spacing */
.stack-loose      { gap: 24px; }          /* Generous vertical spacing */
.inline-normal    { gap: 16px; }          /* Standard horizontal spacing */
```

### Spacing Usage Guidelines

**Micro Spacing (4px - spacing-1):**
- Icon and text gaps
- Border spacing
- Fine-tuned adjustments

**Small Spacing (8px - spacing-2):**
- List item gaps
- Button internal spacing
- Form element margins

**Medium Spacing (16px - spacing-4):**
- Card internal padding
- Form field spacing
- Component margins

**Large Spacing (24px - spacing-6):**
- Card external spacing
- Section separators
- Component group spacing

**XL Spacing (32px+ - spacing-8+):**
- Page section spacing
- Layout margins
- Hero section padding

## Shadow System

### Elevation Levels
Consistent shadow system for depth hierarchy:

```css
/* Shadow Scale */
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);         /* Subtle depth */
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.07);         /* Card elevation */
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1);        /* Modal, dropdown */
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1);        /* High elevation */
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);       /* Maximum elevation */
```

## Usage Best Practices

### Color Guidelines
1. **Use semantic colors** for consistent meaning
2. **Follow accessibility contrast ratios** (4.5:1 minimum)
3. **Combine colors systematically** for predictable outcomes
4. **Test in light and dark modes** when applicable

### Typography Guidelines
1. **Establish clear hierarchy** with size progression
2. **Maintain consistent line heights** for vertical rhythm
3. **Use appropriate weights** for emphasis levels
4. **Consider reading distance** for size selection

### Spacing Guidelines
1. **Follow 8px grid** for all measurements
2. **Use semantic spacing** for component consistency
3. **Maintain proportional relationships** between elements
4. **Create breathing room** with appropriate spacing

### Integration Guidelines
1. **Use CSS custom properties** for dynamic values
2. **Combine tokens systematically** for consistent outcomes
3. **Document token usage** in component implementations
4. **Validate token compliance** in code reviews
