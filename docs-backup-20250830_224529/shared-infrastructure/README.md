# 🏗️ Shared Infrastructure Documentation

> **Complete guide to SABO Arena's shared packages and infrastructure**

---

## 📁 Shared Packages Overview

| Package | Version | Description | Dependencies |
|---------|---------|-------------|--------------|
| `@sabo/shared-auth` | 1.0.0 | Authentication utilities and hooks | Supabase, React |
| `@sabo/shared-types` | 1.0.0 | TypeScript type definitions | None |
| `@sabo/shared-ui` | 1.0.0 | Reusable UI components | Radix UI, Tailwind |
| `@sabo/shared-utils` | 1.0.0 | Common utility functions | date-fns, Supabase |
| `@sabo/shared-hooks` | 1.0.0 | React hooks library | React Query, Supabase |

---

## 🔧 Package Dependencies

### Dependency Graph
```
shared-types (base)
├── shared-utils → shared-types
├── shared-auth → shared-types
├── shared-ui → shared-types + shared-utils
└── shared-hooks → shared-types + shared-utils
```

### External Dependencies
- **Supabase**: `@supabase/supabase-js@^2.54.0`
- **React**: `^18.3.1`
- **TypeScript**: `^5.8.3`
- **Date Utilities**: `date-fns@^3.6.0`
- **UI Framework**: Radix UI + Tailwind CSS

---

## 📦 Package Details

### [@sabo/shared-types](./packages/shared-types.md)
**Core TypeScript definitions**
- User and authentication types
- Game and tournament types
- Common utility interfaces
- API response types

### [@sabo/shared-auth](./packages/shared-auth.md)
**Authentication infrastructure**
- Supabase client configuration
- Authentication hooks
- Session management
- User context providers

### [@sabo/shared-ui](./packages/shared-ui.md)
**Reusable UI components**
- Button, Card, Input components
- Layout components
- Theme utilities
- Responsive design patterns

### [@sabo/shared-utils](./packages/shared-utils.md)
**Common utility functions**
- Date formatting and manipulation
- Currency formatting
- String utilities
- Validation helpers

### [@sabo/shared-hooks](./packages/shared-hooks.md)
**React hooks library**
- Data fetching hooks
- State management hooks
- Supabase integration hooks
- Custom business logic hooks

---

## 🚀 Usage Guidelines

### Import Patterns
```typescript
// Types
import type { User, Tournament } from '@sabo/shared-types';

// Utilities
import { formatCurrency, formatDate } from '@sabo/shared-utils';

// UI Components
import { Button, Card } from '@sabo/shared-ui';

// Authentication
import { useAuth, supabase } from '@sabo/shared-auth';

// Hooks
import { useQuery } from '@sabo/shared-hooks';
```

### Development Workflow
```bash
# Build all shared packages
pnpm build:packages

# Watch mode for development
pnpm dev:packages

# Type checking
pnpm type-check

# Testing
pnpm test
```

---

## 🔄 Version Management

### Semantic Versioning
- **MAJOR**: Breaking changes to public APIs
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, no API changes

### Release Process
1. Update package versions in `package.json`
2. Build and test all packages
3. Update documentation
4. Create release notes
5. Publish to workspace

---

## 🧪 Testing Strategy

### Unit Testing
- Individual function testing
- Component testing
- Hook testing
- Type checking

### Integration Testing
- Cross-package compatibility
- App integration tests
- End-to-end workflows

### Performance Testing
- Bundle size analysis
- Tree shaking verification
- Load time optimization

---

## 📈 Optimization Guidelines

### Bundle Size
- Tree shaking enabled
- Minimal external dependencies
- Conditional exports

### Performance
- Lazy loading support
- Memoization patterns
- Efficient re-renders

### Developer Experience
- Clear TypeScript types
- Comprehensive documentation
- Consistent API patterns

---

## 🔗 Related Documentation

- [Architecture Overview](../architecture/README.md)
- [Development Guide](../DEVELOPMENT_HANDOVER_COMPREHENSIVE.md)
- [Package Specifications](./packages/)
- [Migration History](../migration-history/)

---

**📅 Last Updated**: August 28, 2025  
**🎯 Status**: Optimized and Production Ready  
**👥 Maintained by**: SABO Infrastructure Team
