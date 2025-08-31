# Developer Guide

## Overview
Comprehensive guidelines for developers working with the Sabo Pool Design System, including standards, best practices, and contribution guidelines.

## Getting Started

### Installation
```bash
# Install shared UI components
npm install @shared/shared-ui

# Install design tokens
npm install @shared/design-tokens
```

### Basic Setup
```tsx
// Import design system styles
import '@shared/shared-ui/styles';

// Import components
import { Button, Typography, Card } from '@shared/shared-ui';

// Use in your component
function MyComponent() {
  return (
    <Card className="card-spacing">
      <Typography variant="heading">Welcome</Typography>
      <Button variant="default">Get Started</Button>
    </Card>
  );
}
```

## Code Standards

### Component Implementation Standards

#### 1. TypeScript Interfaces
All components must have proper TypeScript interfaces:

```tsx
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  disabled = false,
  loading = false,
  ...props
}) => {
  // Implementation
};
```

#### 2. Design Token Usage
Always use design tokens instead of hardcoded values:

```tsx
// ✅ Good - Uses design tokens
<div className="text-heading-bold text-primary-600 p-6">
  Content
</div>

// ❌ Bad - Hardcoded values
<div style={{ 
  fontSize: '24px', 
  fontWeight: 'bold', 
  color: '#2563eb',
  padding: '24px' 
}}>
  Content
</div>
```

#### 3. Semantic Class Names
Use semantic class names that describe purpose, not appearance:

```tsx
// ✅ Good - Semantic classes
<div className="card-spacing">
  <h2 className="text-heading-primary">Title</h2>
  <p className="text-body-muted">Description</p>
</div>

// ❌ Bad - Appearance-based classes
<div className="p-6">
  <h2 className="text-2xl font-bold text-blue-600">Title</h2>
  <p className="text-base text-gray-500">Description</p>
</div>
```

### CSS Standards

#### 1. CSS Custom Properties
Use CSS custom properties for dynamic values:

```css
/* ✅ Good - CSS custom properties */
.progress-bar {
  width: var(--progress-width, 0%);
  background-color: var(--progress-color, theme(colors.primary.600));
  transition: width 0.3s ease-out;
}

/* ❌ Bad - Inline styles */
.progress-bar {
  width: 0%;
  background-color: #2563eb;
}
```

#### 2. 8px Grid Compliance
All spacing must follow the 8px grid system:

```css
/* ✅ Good - Grid compliant */
.component {
  padding: 16px;    /* 2 grid units */
  margin: 24px;     /* 3 grid units */
  gap: 8px;         /* 1 grid unit */
}

/* ❌ Bad - Non-grid values */
.component {
  padding: 15px;
  margin: 22px;
  gap: 7px;
}
```

#### 3. Semantic CSS Classes
Create semantic CSS classes for component patterns:

```css
/* ✅ Good - Semantic component classes */
.tournament-card {
  @apply card-spacing bg-white border border-neutral-200 rounded-lg;
}

.tournament-card-header {
  @apply stack-tight border-b border-neutral-100 pb-4;
}

.tournament-card-content {
  @apply stack-normal pt-4;
}
```

## Component Development Guidelines

### 1. Component Structure
Follow consistent component structure:

```tsx
// Component file structure
├── ComponentName/
│   ├── ComponentName.tsx      // Main component
│   ├── variants.ts           // Variant definitions
│   ├── types.ts              // TypeScript interfaces
│   ├── styles.css            // Component-specific styles
│   ├── index.ts              // Exports
│   └── ComponentName.stories.tsx // Storybook stories
```

### 2. Variant System
Use consistent variant patterns:

```tsx
// Define variants with clear purpose
const buttonVariants = {
  variant: {
    default: 'bg-primary-600 text-white hover:bg-primary-700',
    destructive: 'bg-error-600 text-white hover:bg-error-700',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'text-primary-600 hover:bg-primary-50',
    link: 'text-primary-600 underline hover:text-primary-700'
  },
  size: {
    default: 'px-4 py-2 text-body',
    sm: 'px-3 py-1 text-body-small',
    lg: 'px-6 py-3 text-body-large',
    icon: 'p-2'
  }
};
```

### 3. Accessibility Requirements
Ensure all components meet accessibility standards:

```tsx
// Include proper ARIA attributes
<Button
  variant="default"
  disabled={isLoading}
  aria-disabled={isLoading}
  aria-describedby={error ? 'error-message' : undefined}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// Include keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
  Custom Button
</div>
```

## Testing Standards

### 1. Component Testing
Test component variants and states:

```tsx
// Component tests
describe('Button Component', () => {
  it('renders with default variant', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-error-600');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 2. Visual Regression Testing
Include visual tests for design consistency:

```tsx
// Storybook stories for visual testing
export const AllVariants = () => (
  <div className="stack-normal">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);
```

## Quality Assurance Checklist

### Component Development Checklist
Before submitting a new component:

- [ ] **TypeScript interfaces** defined for all props
- [ ] **Design tokens** used instead of hardcoded values
- [ ] **Variant system** implemented for different use cases
- [ ] **8px grid compliance** for all spacing
- [ ] **Semantic class names** used throughout
- [ ] **Accessibility requirements** met (ARIA, keyboard navigation)
- [ ] **Responsive behavior** tested across breakpoints
- [ ] **Component tests** written and passing
- [ ] **Storybook stories** created for all variants
- [ ] **Documentation** updated with usage examples

### Code Review Checklist
When reviewing design system code:

- [ ] **Design token usage** - No hardcoded values
- [ ] **Grid compliance** - All spacing follows 8px grid
- [ ] **Semantic naming** - Classes describe purpose, not appearance
- [ ] **TypeScript compliance** - Proper interfaces and type safety
- [ ] **Accessibility** - Meets WCAG 2.1 AA standards
- [ ] **Performance** - No unnecessary re-renders or layout shifts
- [ ] **Consistency** - Follows established patterns
- [ ] **Documentation** - Code is self-documenting with comments

## Performance Guidelines

### 1. CSS Optimization
Optimize CSS for performance:

```css
/* ✅ Good - Use CSS custom properties for dynamic values */
.component {
  background-color: var(--component-bg, theme(colors.white));
  transition: background-color 0.2s ease-out;
}

/* ✅ Good - Leverage Tailwind's purging */
@layer components {
  .card-spacing {
    @apply p-6 bg-white border border-neutral-200 rounded-lg;
  }
}
```

### 2. Component Optimization
Optimize React components for performance:

```tsx
// ✅ Good - Memoize components when appropriate
export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({
  data,
  onSelect
}) => {
  const processedData = useMemo(() => 
    data.map(item => processItem(item)), 
    [data]
  );

  return (
    <div className="stack-normal">
      {processedData.map(item => (
        <Card key={item.id} className="card-spacing">
          {item.content}
        </Card>
      ))}
    </div>
  );
});
```

## Contribution Guidelines

### 1. Proposing New Components
When proposing a new component:

1. **Check existing components** - Ensure it doesn't duplicate functionality
2. **Define clear use cases** - Document when and why to use it
3. **Create design specifications** - Include variants, states, and behaviors
4. **Follow design system principles** - Use established tokens and patterns
5. **Include accessibility considerations** - Plan for inclusive design

### 2. Submitting Changes
For design system contributions:

1. **Create feature branch** from main
2. **Follow naming conventions** - `feat/component-name` or `fix/issue-description`
3. **Include comprehensive tests** - Unit, integration, and visual tests
4. **Update documentation** - Include usage examples and guidelines
5. **Request design review** - Ensure visual consistency
6. **Submit pull request** - Include detailed description and rationale

### 3. Breaking Changes
When introducing breaking changes:

1. **Document migration path** - Provide clear upgrade instructions
2. **Include deprecation warnings** - Give developers time to migrate
3. **Update all examples** - Ensure documentation reflects changes
4. **Communicate changes** - Notify all teams using the design system
5. **Version appropriately** - Follow semantic versioning

## Troubleshooting

### Common Issues

#### 1. Spacing Not Following Grid
```tsx
// ❌ Problem - Non-grid spacing
<div className="p-5 m-7">Content</div>

// ✅ Solution - Use grid-compliant spacing
<div className="p-6 mb-8">Content</div>
```

#### 2. Hardcoded Colors
```tsx
// ❌ Problem - Hardcoded color
<div style={{ color: '#2563eb' }}>Text</div>

// ✅ Solution - Use design token
<div className="text-primary-600">Text</div>
```

#### 3. Inconsistent Typography
```tsx
// ❌ Problem - Mixed typography approaches
<h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h1>

// ✅ Solution - Use semantic typography
<h1 className="text-heading-bold">Title</h1>
```

### Getting Help
- **Documentation**: Check this guide and component documentation
- **Storybook**: View component examples and variants
- **Team Chat**: Ask questions in the design system channel
- **Office Hours**: Join weekly design system office hours
- **GitHub Issues**: Report bugs or request features

## Resources

### Design System Resources
- [Component Guide](./components.md) - Complete component reference
- [Design Tokens](./design-tokens.md) - Token system documentation
- [Usage Examples](./usage-examples.md) - Real-world implementation examples

### External Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
