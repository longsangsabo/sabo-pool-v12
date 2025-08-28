# 📋 @sabo/shared-types

> **Core TypeScript type definitions for SABO Arena**

---

## 📦 Package Info

- **Version**: 1.0.0
- **Dependencies**: None
- **Peer Dependencies**: None
- **Bundle Size**: ~2KB (minified)

---

## 🏗️ Structure

```
src/
├── common.ts       # Common utility types
├── user.ts         # User and authentication types  
├── game.ts         # Game and tournament types
└── index.ts        # Main exports
```

---

## 🔧 Core Types

### User & Authentication
```typescript
interface User {
  id: string;
  email: string;
  username?: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

interface PublicProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}
```

### Game & Tournament
```typescript
interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: TournamentStatus;
  max_participants: number;
  entry_fee?: number;
}

type TournamentStatus = 'draft' | 'open' | 'active' | 'completed' | 'cancelled';

interface Club {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}
```

### Common Utilities
```typescript
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}
```

---

## 📖 Usage Examples

### In Apps
```typescript
import type { 
  User, 
  Tournament, 
  ApiResponse 
} from '@sabo/shared-types';

// Type-safe API responses
const response: ApiResponse<User[]> = await fetchUsers();

// Component props
interface UserCardProps {
  user: User;
  onClick?: (user: User) => void;
}
```

### In Shared Packages
```typescript
// In shared-utils
import type { User } from '@sabo/shared-types';

export function formatUserDisplayName(user: User): string {
  return user.display_name || user.username || user.email;
}
```

---

## 🔄 Export Structure

### Main Exports
```typescript
// User types
export * from './user';

// Game types  
export * from './game';

// Common types
export * from './common';

// Convenience re-exports
export type {
  User,
  Session,
  Tournament,
  Club,
  ApiResponse
} from './index';
```

---

## 🎯 Design Principles

### Type Safety
- Strict TypeScript configuration
- No `any` types in public APIs
- Comprehensive type coverage

### Consistency
- Unified naming conventions
- Consistent data structures
- Standard API patterns

### Extensibility
- Generic interfaces
- Composable types
- Future-proof design

---

## 🧪 Testing

### Type Testing
- TypeScript compilation tests
- Type assertion tests
- Generic type validation

### Integration Testing
- Cross-package type compatibility
- Import/export validation
- Breaking change detection

---

## 📚 Related

- [User Types Reference](./user-types.md)
- [Game Types Reference](./game-types.md)
- [API Types Reference](./api-types.md)
- [Migration Guide](../migration/types-migration.md)

---

**📅 Last Updated**: August 28, 2025  
**🎯 Status**: Stable and Production Ready
