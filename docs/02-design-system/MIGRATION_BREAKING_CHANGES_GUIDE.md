# 🚨 DESIGN SYSTEM MIGRATION GUIDE - FIX BREAKING CHANGES

**Urgency**: HIGH - Critical fixes needed after design system migration  
**Status**: ⚠️ Breaking changes detected in Typography components  
**Date**: August 31, 2025

## 🎯 OVERVIEW

Sau khi migration design system, một số components đã thay đổi API và export names. Đây là guide để fix những breaking changes này.

## ⚡ QUICK FIX CHECKLIST

### 1. Typography Component Changes
```tsx
// ❌ OLD (Broken)
import { Typography } from '@sabo/shared-ui';
<Typography size="large">Text</Typography>

// ✅ NEW (Fixed)  
import { Heading, Text } from '@sabo/shared-ui';
<Heading variant="h2">Heading Text</Heading>
<Text>Body Text</Text>
```

### 2. Component API Changes
```tsx
// ❌ OLD Props
<Typography size="large" weight="bold">
<Typography size="small" color="muted">

// ✅ NEW Props
<Heading variant="h2" className="font-bold">
<Text variant="muted" size="sm">
```

## 🔧 STEP-BY-STEP FIXES

### Step 1: Update Imports
```bash
# Find all files using old Typography import
grep -r "import.*Typography.*from.*shared-ui" apps/

# Files to check:
- apps/sabo-user/src/components/ClubRegistrationMultiStepForm.tsx
- apps/sabo-user/src/components/club/ClubDesktopHeader.tsx
- apps/sabo-user/src/components/QuickClubRegistration.tsx
- And more...
```

### Step 2: Replace Import Statements
```tsx
// In each affected file:

// ❌ Remove this
import { Typography } from '@sabo/shared-ui';

// ✅ Add this instead
import { Heading, Text, Label } from '@sabo/shared-ui';
```

### Step 3: Update Component Usage
```tsx
// ❌ Replace all Typography usage:
<Typography size="large" weight="bold">
  Heading Text
</Typography>

// ✅ With appropriate component:
<Heading variant="h2" className="font-bold">
  Heading Text  
</Heading>

// ❌ Body text:
<Typography size="medium">
  Body text here
</Typography>

// ✅ Should become:
<Text>
  Body text here
</Text>
```

## 📋 COMPONENT MAPPING TABLE

| Old Usage | New Component | New Props |
|-----------|---------------|-----------|
| `<Typography size="large">` | `<Heading variant="h2">` | variant: h1, h2, h3, h4 |
| `<Typography size="medium">` | `<Text>` | size: sm, base, lg |
| `<Typography size="small">` | `<Text size="sm">` | - |
| `<Typography weight="bold">` | Add `className="font-bold"` | - |
| `<Typography color="muted">` | `<Text variant="muted">` | variant: default, muted |

## 🎯 PRIORITY FIX ORDER

### HIGH Priority (Blocking development)
1. **ClubDesktopHeader.tsx** - Header component
2. **ClubRegistrationMultiStepForm.tsx** - Registration flow
3. **QuickClubRegistration.tsx** - Quick registration

### MEDIUM Priority  
4. Any other components importing Typography
5. Components with compilation errors
6. Components with TypeScript errors

## 🛠️ AUTOMATED FIX SCRIPT

```bash
# Create quick fix script
cat > fix-typography-migration.sh << 'EOF'
#!/bin/bash

# Find and replace Typography imports
find apps/ -name "*.tsx" -exec sed -i 's/import { Typography }/import { Heading, Text, Label }/g' {} \;

# Replace common Typography usage patterns
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="large"/<Heading variant="h2"/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="medium"/<Text/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<Typography size="small"/<Text size="sm"/g' {} \;
find apps/ -name "*.tsx" -exec sed -i 's/<\/Typography>/<\/Heading>/g' {} \;

echo "✅ Basic Typography migration completed"
echo "⚠️  Manual review required for complex props"
EOF

chmod +x fix-typography-migration.sh
```

## 🔍 TESTING CHECKLIST

After fixes, verify:
- [ ] No compilation errors in terminal
- [ ] No TypeScript errors in VS Code
- [ ] Components render correctly
- [ ] Styling looks consistent
- [ ] Responsive behavior works

## 🚨 COMMON ERRORS & SOLUTIONS

### Error 1: "does not provide an export named 'Typography'"
```tsx
// ❌ Problem
import { Typography } from '@sabo/shared-ui';

// ✅ Solution  
import { Heading, Text } from '@sabo/shared-ui';
```

### Error 2: "Property 'size' does not exist"
```tsx
// ❌ Problem
<Heading size="large">

// ✅ Solution
<Heading variant="h2">
```

### Error 3: "Property 'weight' does not exist"
```tsx
// ❌ Problem
<Text weight="bold">

// ✅ Solution
<Text className="font-bold">
```

## 📚 NEW DESIGN SYSTEM REFERENCE

### Available Typography Components
```tsx
// Headings
<Heading variant="h1">Main Title</Heading>
<Heading variant="h2">Section Title</Heading>
<Heading variant="h3">Subsection</Heading>
<Heading variant="h4">Small Heading</Heading>

// Text
<Text>Default body text</Text>
<Text size="sm">Small text</Text>
<Text size="lg">Large text</Text>
<Text variant="muted">Muted text</Text>

// Labels
<Label>Form Label</Label>
<Label htmlFor="input">Accessible Label</Label>

// Code
<Code>inline code</Code>
```

### Styling Guidelines
```tsx
// Use Tailwind for additional styling
<Heading variant="h2" className="text-blue-600 mb-4">
<Text className="font-medium text-gray-700">

// Responsive design
<Text className="text-sm md:text-base lg:text-lg">
```

## 🚀 POST-FIX ACTIONS

1. **Run development server**: `pnpm dev`
2. **Check for errors**: Look for red compilation errors
3. **Test components**: Verify UI looks correct
4. **Run quality check**: `pnpm design-system:check`
5. **Commit changes**: Git commit with clear message

## 📞 SUPPORT

If you encounter issues:
1. Check this guide first
2. Look at working examples in `/packages/shared-ui/src/components/Typography/`
3. Run `pnpm design-system:check` for health status
4. Ask team for help with complex migrations

---

## ⚡ EMERGENCY ROLLBACK (If needed)

If breaking changes are too extensive:
```bash
# Temporary rollback option
git stash  # Save current work
git checkout [previous-commit]  # Go back to working state
# Then plan systematic migration
```

---

**🎯 Goal**: Get development environment working again with new design system while maintaining code quality and consistency.

**📝 Remember**: This migration improves long-term maintainability even though it requires short-term fixes!
