# Services Development Guide

## 📚 Overview

File này hướng dẫn developers cách làm việc với services trong SABO Pool system một cách đúng đắn và consistent.

## 🎯 Quick Start

### 1. Tìm Service cần dùng
```typescript
// Xem SERVICES_REFERENCE.md để biết service nào cần dùng
// Ví dụ: Cần tạo user mới → userService
```

### 2. Import Service
```typescript
// Import từ app-specific services
import { userService } from '@/services/userService';
import { tournamentService } from '@/services/tournamentService';

// Import từ shared services
import { PaymentService } from '@sabo-pool/shared-business/payment/PaymentService';
```

### 3. Sử dụng Service
```typescript
// Tạo user mới
const newUser = await userService.createUser({
  email: 'user@example.com',
  password: 'securePassword',
  profile: { name: 'John Doe' }
});

// Tạo tournament
const tournament = await tournamentService.createTournament({
  name: 'Weekly Tournament',
  type: 'elimination',
  maxPlayers: 16
});
```

## 🏗️ Service Architecture

### Layer Structure
```
┌─────────────────────────────────────┐
│         PRESENTATION LAYER          │
│     (Components, Pages, Hooks)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          SERVICE LAYER              │
│     (Business Logic, Services)      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         DATA ACCESS LAYER           │
│     (Supabase, APIs, Storage)       │
└─────────────────────────────────────┘
```

### Service Responsibilities
- **Business Logic**: Tất cả business rules và validation
- **Data Transformation**: Convert data giữa UI và database
- **Error Handling**: Xử lý lỗi và return meaningful messages
- **Caching**: Cache data khi cần thiết
- **State Management**: Manage state cho complex operations

## 📁 File Organization

### App-Specific Services
```
apps/sabo-user/src/services/
├── index.ts                 # Central exports
├── userService.ts
├── tournamentService.ts
├── challengeService.ts
├── clubService.ts
├── paymentService.ts
└── ... (38 more services)
```

### Shared Services
```
packages/shared-business/src/
├── index.ts                 # Central exports
├── user/
│   └── UserService.ts
├── payment/
│   └── PaymentService.ts
├── mobile/
│   ├── NotificationService.ts
│   ├── OfflineDataService.ts
│   └── WebSocketService.ts
└── ...
```

## 🔧 Service Implementation Pattern

### Basic Service Template
```typescript
import { supabase } from '@/lib/supabase';
import type { User, CreateUserData } from '@/types';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Validation
      this.validateUserData(userData);
      
      // Business logic
      const processedData = this.processUserData(userData);
      
      // Database operation
      const { data, error } = await supabase
        .from('users')
        .insert(processedData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform response
      return this.transformUser(data);
    } catch (error) {
      // Error handling
      throw this.handleError(error, 'createUser');
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    // Implementation...
  }
  
  private validateUserData(data: CreateUserData): void {
    // Validation logic
  }
  
  private processUserData(data: CreateUserData): any {
    // Business logic processing
  }
  
  private transformUser(data: any): User {
    // Data transformation
  }
  
  private handleError(error: any, operation: string): Error {
    // Consistent error handling
  }
}

// Export singleton instance
export const userService = new UserService();
```

### Service with Dependencies
```typescript
import { userService } from './userService';
import { notificationService } from './notificationService';

export class TournamentService {
  constructor(
    private userService = userService,
    private notificationService = notificationService
  ) {}
  
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    // Verify user permissions
    await this.userService.verifyPermissions(data.creatorId, 'create_tournament');
    
    // Create tournament
    const tournament = await this.createTournamentRecord(data);
    
    // Send notifications
    await this.notificationService.notifyTournamentCreated(tournament);
    
    return tournament;
  }
}
```

## 🧪 Testing Pattern

### Service Unit Tests
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../userService';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn()
        })
      })
    })
  }
}));

describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });
    
    it('should throw error for invalid data', async () => {
      // Test error scenarios
    });
  });
});
```

## 🔄 Service Communication Patterns

### Direct Service Calls
```typescript
// Service A calls Service B directly
export class TournamentService {
  async createTournament(data: CreateTournamentData) {
    // Validate user
    const user = await userService.getUserById(data.creatorId);
    if (!user) throw new Error('User not found');
    
    // Create tournament
    const tournament = await this.createTournamentRecord(data);
    
    return tournament;
  }
}
```

### Event-Driven Communication
```typescript
// Service A emits event, Service B listens
export class TournamentService {
  async createTournament(data: CreateTournamentData) {
    const tournament = await this.createTournamentRecord(data);
    
    // Emit event
    eventBus.emit('tournament:created', tournament);
    
    return tournament;
  }
}

// In notification service
eventBus.on('tournament:created', (tournament) => {
  notificationService.notifyTournamentCreated(tournament);
});
```

## 📊 Performance Best Practices

### 1. Caching Strategy
```typescript
export class UserService {
  private cache = new Map<string, User>();
  
  async getUserById(id: string): Promise<User | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    // Fetch from database
    const user = await this.fetchUserFromDB(id);
    
    // Cache result
    if (user) {
      this.cache.set(id, user);
    }
    
    return user;
  }
}
```

### 2. Batch Operations
```typescript
export class UserService {
  async getMultipleUsers(ids: string[]): Promise<User[]> {
    // Batch database call instead of multiple single calls
    const { data } = await supabase
      .from('users')
      .select('*')
      .in('id', ids);
    
    return data || [];
  }
}
```

### 3. Pagination
```typescript
export class TournamentService {
  async getTournaments(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
    const { page = 1, limit = 20, sortBy = 'created_at' } = options;
    
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact' })
      .order(sortBy)
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }
}
```

## 🔒 Security Best Practices

### 1. Input Validation
```typescript
export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    // Validate input
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Invalid email address');
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Sanitize input
    const sanitizedData = this.sanitizeUserData(userData);
    
    // Proceed with creation
    return this.createUserRecord(sanitizedData);
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  private sanitizeUserData(data: CreateUserData): CreateUserData {
    return {
      ...data,
      email: data.email.toLowerCase().trim(),
      // Remove any dangerous characters
    };
  }
}
```

### 2. Permission Checks
```typescript
export class TournamentService {
  async updateTournament(id: string, updates: TournamentUpdates, userId: string): Promise<Tournament> {
    // Check permissions
    const canUpdate = await this.checkUpdatePermission(id, userId);
    if (!canUpdate) {
      throw new Error('Insufficient permissions');
    }
    
    // Proceed with update
    return this.updateTournamentRecord(id, updates);
  }
  
  private async checkUpdatePermission(tournamentId: string, userId: string): Promise<boolean> {
    // Check if user is tournament creator or admin
    const tournament = await this.getTournamentById(tournamentId);
    const user = await userService.getUserById(userId);
    
    return tournament.creatorId === userId || user.role === 'admin';
  }
}
```

## 🚨 Error Handling

### Consistent Error Types
```typescript
export enum ServiceErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

export class ServiceError extends Error {
  constructor(
    public type: ServiceErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class UserService {
  private handleError(error: any, operation: string): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }
    
    // Map database errors
    if (error.code === '23505') {
      return new ServiceError(
        ServiceErrorType.VALIDATION_ERROR,
        'Email already exists'
      );
    }
    
    // Default error
    return new ServiceError(
      ServiceErrorType.DATABASE_ERROR,
      `Failed to ${operation}: ${error.message}`,
      error
    );
  }
}
```

## 📈 Monitoring & Logging

### Service Logging
```typescript
import { logger } from '@/lib/logger';

export class UserService {
  async createUser(userData: CreateUserData): Promise<User> {
    const startTime = Date.now();
    
    try {
      logger.info('Creating user', { email: userData.email });
      
      const user = await this.createUserRecord(userData);
      
      logger.info('User created successfully', {
        userId: user.id,
        email: user.email,
        duration: Date.now() - startTime
      });
      
      return user;
    } catch (error) {
      logger.error('Failed to create user', {
        email: userData.email,
        error: error.message,
        duration: Date.now() - startTime
      });
      
      throw error;
    }
  }
}
```

### Performance Metrics
```typescript
export class UserService {
  private metrics = {
    createUser: { calls: 0, totalTime: 0, errors: 0 },
    getUserById: { calls: 0, totalTime: 0, errors: 0 }
  };
  
  async createUser(userData: CreateUserData): Promise<User> {
    const startTime = Date.now();
    this.metrics.createUser.calls++;
    
    try {
      const result = await this.createUserRecord(userData);
      this.metrics.createUser.totalTime += Date.now() - startTime;
      return result;
    } catch (error) {
      this.metrics.createUser.errors++;
      throw error;
    }
  }
  
  getMetrics() {
    return this.metrics;
  }
}
```

## 🔗 Service Registry Usage

### Checking Available Services
```typescript
import { SERVICES_SUMMARY } from '../SERVICES_REFERENCE.md';

// Xem tất cả services có sẵn
console.log('Total services:', SERVICES_SUMMARY.total);
console.log('Categories:', SERVICES_SUMMARY.categories);

// Check migration status
console.log('Migration success rate:', SERVICES_SUMMARY.migration.success_rate);
```

### Service Discovery
```typescript
// Tìm service cho specific use case
const needAuthentication = [
  'userService',      // User management
  'authService',      // Login/logout
  'profileService',   // Profile management
  'settingsService'   // User settings
];

const needTournaments = [
  'tournamentService', // Tournament CRUD
  'challengeService',  // Challenge system
  'matchService',      // Match management
  'tableService'       // Table booking
];
```

## ✅ Checklist cho Service Development

### Before Creating New Service
- [ ] Kiểm tra SERVICES_REFERENCE.md xem service đã tồn tại chưa
- [ ] Xác định service thuộc category nào
- [ ] List dependencies cần thiết
- [ ] Design public API methods
- [ ] Plan error handling strategy

### During Implementation
- [ ] Follow naming convention
- [ ] Implement proper validation
- [ ] Add comprehensive error handling
- [ ] Write unit tests
- [ ] Add logging và metrics
- [ ] Document all public methods

### After Implementation
- [ ] Update SERVICES_REFERENCE.md
- [ ] Add service to central index.ts
- [ ] Write integration tests
- [ ] Update documentation
- [ ] Review with team
- [ ] Deploy và monitor

## 📝 Common Patterns & Examples

### CRUD Service Pattern
```typescript
export class CRUDService<T, CreateT, UpdateT> {
  constructor(private tableName: string) {}
  
  async create(data: CreateT): Promise<T> {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw this.handleError(error, 'create');
    return result;
  }
  
  async getById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw this.handleError(error, 'getById');
    }
    
    return data || null;
  }
  
  async update(id: string, updates: UpdateT): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw this.handleError(error, 'update');
    return data;
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw this.handleError(error, 'delete');
  }
}

// Usage
class UserService extends CRUDService<User, CreateUserData, UpdateUserData> {
  constructor() {
    super('users');
  }
  
  // Add custom methods specific to users
  async getUserByEmail(email: string): Promise<User | null> {
    // Custom implementation
  }
}
```

Bây giờ developers có thể:
1. **Xem SERVICES_REFERENCE.md** để biết service nào cần dùng
2. **Follow development guide** để implement đúng pattern
3. **Sử dụng consistent API** across tất cả services
4. **Maintain code quality** thông qua established patterns

Bạn có muốn tôi thêm section nào khác vào guide này không?
