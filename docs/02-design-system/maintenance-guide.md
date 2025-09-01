# 🎯 Design System Maintenance Guide

## 📋 Daily Developer Checklist

### ✅ Before Writing Any Component
- [ ] Check if component already exists in `/packages/shared-ui/`
- [ ] Use Tailwind utilities instead of inline styles
- [ ] Follow design token patterns for colors
- [ ] Test in both light and dark mode

### ✅ Code Review Checklist
- [ ] No new `style={}` props unless absolutely necessary
- [ ] No hardcoded hex colors (#ffffff) - use design tokens
- [ ] Responsive design follows Tailwind patterns
- [ ] Component follows naming conventions

## 🚫 Anti-Patterns to Avoid

### ❌ Don't Do This
```tsx
// Inline styles
<div style={{ backgroundColor: '#ff0000', padding: '16px' }}>

// Hardcoded colors  
<div className="text-[#ff0000]">

// Duplicate components
<div className="flex items-center justify-between p-4 bg-white rounded-lg">
```

### ✅ Do This Instead
```tsx
// Use design tokens
<div className="bg-red-500 p-4">

// Use semantic colors
<div className="text-red-500 dark:text-red-400">

// Use shared components
<Card className="flex items-center justify-between">
```

## 📊 Quality Monitoring

### Run Quality Check
```bash
./scripts/monitor-design-system.sh
```

### Key Metrics to Watch
- **Inline Styles:** Keep ≤ 60 files
- **Hex Colors:** Keep ≤ 12 files  
- **Shared Components:** Maintain 55+ components
- **Adoption Rate:** Target 80%+

## 🛠️ Quick Fixes

### Convert Inline Style to Tailwind
```tsx
// Before
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

// After  
<div className="flex items-center gap-2">
```

### Replace Hardcoded Colors
```tsx
// Before
<div style={{ color: '#6b7280' }}>

// After
<div className="text-gray-500">
```

## 📚 Resources

- **Component Library:** `/packages/shared-ui/`
- **Design Tokens:** Use Tailwind's color palette
- **Examples:** Check existing components for patterns
- **Monitoring:** `./scripts/monitor-design-system.sh`

## 🚨 When to Break the Rules

### Legitimate Use Cases for Inline Styles
1. **Dynamic Values:** Progress bars, animations with calculated values
2. **Third-party Integration:** Chart libraries, external widgets
3. **Performance Critical:** CSS-in-JS optimizations
4. **Brand Specific:** Complex gradients, custom animations

### Approval Process
- Get team lead approval
- Document the reason
- Add comment explaining why inline style is necessary
- Consider if it can be converted to a design token

## 🎉 Success Stories

### Before vs After Examples
- `card-avatar.tsx`: 10 → 2 style objects (80% reduction)
- `dark-card-avatar.tsx`: 9 → 3 style objects (67% reduction)
- `polaroid-frame.tsx`: 5 → 1 style object (80% reduction)

## 📈 Continuous Improvement

### Monthly Review Process
1. Run monitoring script
2. Identify regression areas
3. Plan cleanup sprints if needed
4. Update this guide with new patterns
5. Share learnings with team

### Tool Integration Ideas
- ESLint rules for design system compliance
- VS Code snippets for common patterns
- Automated component generation
- Design token validation

---
**Remember: The goal is consistency and maintainability, not perfection. Focus on high-impact improvements that make the codebase better for everyone!**
