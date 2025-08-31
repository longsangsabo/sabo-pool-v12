# 📝 AI Assistant Task Templates

> **STANDARDIZED TEMPLATES** for common development tasks

## 🎯 Template Usage Guide

**Before starting any task, use the appropriate template below:**

1. **Read the template completely**
2. **Follow each step in order**
3. **Don't skip validation steps**
4. **Document your work**

---

## 🏗️ 1. Creating New Components

### **Template: React Component Creation**

```markdown
## Task: Create [ComponentName]

### Step 1: Research & Planning
- [ ] Check if similar component exists in `packages/shared-ui/`
- [ ] Review design system in `docs/02-design-system/`
- [ ] Identify required props and variants
- [ ] Plan component location (shared vs app-specific)

### Step 2: Component Structure
- [ ] Create component file with proper naming: `component-name.tsx`
- [ ] Define TypeScript interfaces
- [ ] Implement component with proper structure
- [ ] Add proper exports

### Step 3: Styling
- [ ] Use design tokens from `packages/design-tokens/`
- [ ] Follow Tailwind CSS patterns
- [ ] Ensure responsive design
- [ ] Add proper accessibility attributes

### Step 4: Testing
- [ ] Create test file: `component-name.test.tsx`
- [ ] Test all props and variants
- [ ] Test accessibility
- [ ] Test responsive behavior

### Step 5: Documentation
- [ ] Add JSDoc comments
- [ ] Create stories for Storybook (if applicable)
- [ ] Update package README if needed
- [ ] Add usage examples

### Step 6: Integration
- [ ] Export from package index
- [ ] Update type definitions
- [ ] Test in target application
- [ ] Verify no conflicts with existing components
```

**Example Implementation:**
```typescript
// Step 2: Component Structure
interface TournamentCardProps {
  tournament: Tournament;
  variant?: 'default' | 'compact';
  onClick?: (tournamentId: string) => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  variant = 'default',
  onClick,
}) => {
  // Implementation follows standards
};
```

---

## 🔧 2. Adding New API Endpoints

### **Template: API Endpoint Creation**

```markdown
## Task: Create [EndpointName] API

### Step 1: Planning & Design
- [ ] Define endpoint purpose and requirements
- [ ] Check existing similar endpoints
- [ ] Plan request/response schemas
- [ ] Identify security requirements

### Step 2: Database Schema
- [ ] Review current database schema
- [ ] Plan any needed migrations
- [ ] Create migration files if needed
- [ ] Update RLS policies

### Step 3: Type Definitions
- [ ] Add types to `packages/shared-types/`
- [ ] Define request/response interfaces
- [ ] Add validation schemas with Zod
- [ ] Export from package index

### Step 4: Service Layer
- [ ] Create service class in appropriate package
- [ ] Implement CRUD operations
- [ ] Add proper error handling
- [ ] Include input validation

### Step 5: API Integration
- [ ] Create React Query hooks
- [ ] Implement optimistic updates
- [ ] Add proper caching strategies
- [ ] Handle loading and error states

### Step 6: Testing
- [ ] Unit tests for service layer
- [ ] Integration tests for API calls
- [ ] Test error scenarios
- [ ] Test authentication/authorization

### Step 7: Documentation
- [ ] Update API documentation in `docs/06-api/`
- [ ] Add code examples
- [ ] Document error responses
- [ ] Update integration guides
```

**Example Implementation:**
```typescript
// Step 3: Type Definitions
export interface CreateTournamentRequest {
  name: string;
  description?: string;
  maxParticipants: number;
  entryFee: number;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  status: TournamentStatus;
  // ... other fields
}

// Step 4: Service Layer
export class TournamentService {
  async create(data: CreateTournamentRequest): Promise<Tournament> {
    const validData = CreateTournamentSchema.parse(data);
    // Implementation
  }
}
```

---

## 📊 3. State Management Implementation

### **Template: Zustand Store Creation**

```markdown
## Task: Create [StoreName] Store

### Step 1: Store Planning
- [ ] Identify state requirements
- [ ] Plan store structure and actions
- [ ] Identify side effects and async operations
- [ ] Check for existing similar stores

### Step 2: Type Definitions
- [ ] Define store interface
- [ ] Add action types
- [ ] Define state shape
- [ ] Add to shared types if needed

### Step 3: Store Implementation
- [ ] Create store with proper structure
- [ ] Implement actions with error handling
- [ ] Add loading and error states
- [ ] Include proper TypeScript typing

### Step 4: Integration Hooks
- [ ] Create custom hooks for common operations
- [ ] Add selectors for performance
- [ ] Implement subscription patterns
- [ ] Add debugging helpers

### Step 5: Testing
- [ ] Unit tests for store actions
- [ ] Test async operations
- [ ] Test error scenarios
- [ ] Integration tests with components

### Step 6: Documentation
- [ ] Document store purpose and usage
- [ ] Add code examples
- [ ] Document actions and selectors
- [ ] Update architecture documentation
```

---

## 🎨 4. UI Feature Implementation

### **Template: Complete Feature Development**

```markdown
## Task: Implement [FeatureName]

### Step 1: Feature Analysis
- [ ] Understand feature requirements
- [ ] Break down into smaller components
- [ ] Identify existing components to reuse
- [ ] Plan data flow and state management

### Step 2: Backend Requirements
- [ ] Identify needed API endpoints
- [ ] Plan database schema changes
- [ ] Implement backend services
- [ ] Add proper validation and security

### Step 3: Frontend Implementation
- [ ] Create/update necessary components
- [ ] Implement state management
- [ ] Add API integration
- [ ] Implement proper error handling

### Step 4: Styling & UX
- [ ] Follow design system guidelines
- [ ] Ensure responsive design
- [ ] Add loading states
- [ ] Implement proper accessibility

### Step 5: Testing
- [ ] Unit tests for components
- [ ] Integration tests for feature flow
- [ ] E2E tests for critical paths
- [ ] Test error scenarios

### Step 6: Documentation
- [ ] Update feature documentation
- [ ] Add user guides if needed
- [ ] Update API documentation
- [ ] Add troubleshooting guides
```

---

## 🐛 5. Bug Fix Template

### **Template: Bug Investigation & Fix**

```markdown
## Task: Fix [BugDescription]

### Step 1: Bug Reproduction
- [ ] Reproduce the bug locally
- [ ] Identify steps to reproduce
- [ ] Document expected vs actual behavior
- [ ] Check browser console for errors

### Step 2: Investigation
- [ ] Review relevant code sections
- [ ] Check recent changes in git history
- [ ] Identify root cause
- [ ] Assess impact scope

### Step 3: Solution Planning
- [ ] Plan fix approach
- [ ] Consider edge cases
- [ ] Identify potential side effects
- [ ] Plan testing strategy

### Step 4: Implementation
- [ ] Implement fix following coding standards
- [ ] Add proper error handling
- [ ] Update types if needed
- [ ] Add comments explaining the fix

### Step 5: Testing
- [ ] Test the specific bug scenario
- [ ] Test related functionality
- [ ] Add regression tests
- [ ] Test in different environments

### Step 6: Documentation
- [ ] Update relevant documentation
- [ ] Add to changelog if needed
- [ ] Document any API changes
- [ ] Update troubleshooting guides
```

---

## 📦 6. Package/Module Creation

### **Template: New Package Development**

```markdown
## Task: Create [PackageName] Package

### Step 1: Package Planning
- [ ] Define package purpose and scope
- [ ] Identify dependencies
- [ ] Plan API surface
- [ ] Check naming conventions

### Step 2: Package Structure
- [ ] Create package directory in `packages/`
- [ ] Set up package.json with proper config
- [ ] Create src/ directory structure
- [ ] Add proper TypeScript configuration

### Step 3: Core Implementation
- [ ] Implement main functionality
- [ ] Add proper TypeScript types
- [ ] Follow coding standards
- [ ] Add proper error handling

### Step 4: Build Configuration
- [ ] Configure build scripts
- [ ] Set up proper exports
- [ ] Configure TypeScript compilation
- [ ] Test build output

### Step 5: Testing
- [ ] Add comprehensive unit tests
- [ ] Test integration with other packages
- [ ] Add performance tests if needed
- [ ] Test in consumer applications

### Step 6: Documentation
- [ ] Create comprehensive README
- [ ] Add API documentation
- [ ] Include usage examples
- [ ] Document any limitations
```

---

## 🔍 7. Code Review Template

### **Template: Self-Review Checklist**

```markdown
## Self-Review: [ChangeDescription]

### Code Quality
- [ ] Follows TypeScript best practices
- [ ] Proper error handling implemented
- [ ] No console.log or debug code
- [ ] Proper variable and function naming
- [ ] Code is well-commented where needed

### Architecture Compliance
- [ ] Follows established patterns
- [ ] Uses shared packages appropriately
- [ ] No duplication of existing functionality
- [ ] Proper separation of concerns

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization where needed
- [ ] Efficient database queries
- [ ] Images optimized

### Security
- [ ] Input validation implemented
- [ ] No sensitive data exposed
- [ ] Proper authentication checks
- [ ] SQL injection prevention

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests included
- [ ] Edge cases covered
- [ ] Error scenarios tested

### Documentation
- [ ] README updated if needed
- [ ] API docs updated
- [ ] Comments added for complex logic
- [ ] Examples provided
```

---

## 📋 8. Validation Script Template

Each template should end with running validation:

```bash
# Run before committing
./.copilot/validate-compliance.sh

# Check code quality
npm run lint
npm run type-check
npm run test

# Verify build
npm run build
```

---

**Remember**: These templates ensure consistency and quality across all AI assistant work. Use them religiously! 🎯✨
