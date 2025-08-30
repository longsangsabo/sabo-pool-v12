# 👨‍💻 SABO Arena Developer Onboarding Guide

## 🎯 Welcome to SABO Arena Development Team!

This comprehensive guide will get you up and running with the SABO Arena monorepo in minimal time. Follow each step carefully to ensure a smooth onboarding experience.

---

## 📋 Prerequisites Checklist

### Required Software:
- [ ] **Node.js v20.14.0+** - JavaScript runtime
- [ ] **pnpm v9.0.0+** - Package manager (faster than npm)
- [ ] **Git** - Version control
- [ ] **VS Code** - Recommended IDE with extensions
- [ ] **Docker** (optional) - For containerized development

### Recommended VS Code Extensions:
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

---

## 🚀 Quick Setup (5 minutes)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/longsangsabo/sabo-pool-v12.git
cd sabo-pool-v12

# Install dependencies (this will install for all packages)
pnpm install

# Verify installation
pnpm --version
node --version
```

### 2. Environment Setup
```bash
# Copy environment templates
cp apps/sabo-user/.env.example apps/sabo-user/.env.local
cp apps/sabo-admin/.env.example apps/sabo-admin/.env.local

# Edit environment files with your local settings
# (Ask team lead for development credentials)
```

### 3. Build Shared Packages
```bash
# Build all shared packages first
pnpm -r --filter "@sabo/shared-*" build

# Verify shared packages are built
ls packages/*/dist/
```

### 4. Start Development Servers
```bash
# Option 1: Use optimized dev script (recommended)
./scripts/dev-optimized.sh

# Option 2: Start manually
# Terminal 1 - User App
cd apps/sabo-user && pnpm dev

# Terminal 2 - Admin App  
cd apps/sabo-admin && pnpm dev
```

### 5. Verify Setup
- **User App**: http://localhost:8080
- **Admin App**: http://localhost:8081

---

## 🏗️ Project Architecture Deep Dive

### Monorepo Structure
```
sabo-pool-v12/
├── apps/                    # Applications
│   ├── sabo-user/          # Main user application
│   │   ├── src/            # Source code
│   │   ├── public/         # Static assets
│   │   ├── dist/           # Build output
│   │   └── vite.config.ts  # Vite configuration
│   └── sabo-admin/         # Admin dashboard
│       ├── src/            # Admin source code
│       ├── public/         # Admin static assets
│       ├── dist/           # Admin build output
│       └── vite.config.ts  # Admin Vite config
├── packages/               # Shared packages
│   ├── shared-auth/        # Authentication logic
│   ├── shared-hooks/       # React hooks
│   ├── shared-types/       # TypeScript types
│   ├── shared-ui/          # UI components
│   └── shared-utils/       # Utility functions
├── scripts/                # Development & build scripts
│   ├── build-optimized.sh  # Production build
│   ├── dev-optimized.sh    # Development servers
│   └── bundle-analyzer.sh  # Bundle analysis
└── docs/                   # Documentation
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: Zustand, React Query
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Custom design system + Shadcn/ui
- **Build Tools**: Vite, pnpm workspaces
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel, Docker

---

## 🧩 Working with Shared Packages

### Package Overview:

#### 1. `@sabo/shared-auth`
Authentication and authorization utilities.
```typescript
import { useAuth, AuthProvider } from '@sabo/shared-auth';

// Usage in components
const { user, login, logout, isLoading } = useAuth();
```

#### 2. `@sabo/shared-types`
TypeScript type definitions shared across apps.
```typescript
import type { User, Tournament, Challenge } from '@sabo/shared-types';
```

#### 3. `@sabo/shared-ui`
Reusable UI components with consistent design.
```typescript
import { Button, Modal, Card } from '@sabo/shared-ui';
```

#### 4. `@sabo/shared-hooks`
Custom React hooks for common functionality.
```typescript
import { useLocalStorage, useDebounce } from '@sabo/shared-hooks';
```

#### 5. `@sabo/shared-utils`
Utility functions and helpers.
```typescript
import { formatDate, validateEmail } from '@sabo/shared-utils';
```

### Adding New Shared Components:

1. **Create Component**:
```bash
cd packages/shared-ui/src/components
mkdir MyComponent
touch MyComponent/index.tsx MyComponent/MyComponent.tsx
```

2. **Implement Component**:
```typescript
// packages/shared-ui/src/components/MyComponent/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded" onClick={onClick}>
      {title}
    </div>
  );
};
```

3. **Export Component**:
```typescript
// packages/shared-ui/src/components/MyComponent/index.tsx
export { MyComponent } from './MyComponent';

// packages/shared-ui/src/index.ts
export { MyComponent } from './components/MyComponent';
```

4. **Rebuild Package**:
```bash
cd packages/shared-ui
pnpm build
```

---

## 🔧 Development Workflow

### Daily Development Process:

#### 1. Start Your Day
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Rebuild shared packages if needed
pnpm -r --filter "@sabo/shared-*" build

# Start development servers
./scripts/dev-optimized.sh
```

#### 2. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes to code
# Test your changes locally

# Build and test
./scripts/simple-integration-test.sh
```

#### 3. Code Quality Checks
```bash
# Type checking
pnpm -F @sabo/user-app tsc --noEmit
pnpm -F @sabo/admin-app tsc --noEmit

# Linting
pnpm -r lint

# Formatting
pnpm -r format
```

#### 4. Commit & Push
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add new tournament creation flow"

# Push to remote
git push origin feature/your-feature-name
```

### Branch Strategy:
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Individual feature branches
- **hotfix/**: Critical bug fixes

---

## 🧪 Testing Guide

### Running Tests:
```bash
# Unit tests
pnpm -r test

# Integration tests
./scripts/simple-integration-test.sh

# E2E tests (if configured)
pnpm -r test:e2e
```

### Writing Tests:
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  test('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

---

## 🐛 Debugging Tips

### Common Issues & Solutions:

#### 1. TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf apps/*/tsconfig.tsbuildinfo packages/*/tsconfig.tsbuildinfo

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 2. Build Failures
```bash
# Clear all caches and reinstall
pnpm store prune
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install
```

#### 3. Shared Package Issues
```bash
# Rebuild specific shared package
cd packages/shared-ui
pnpm build

# Rebuild all shared packages
pnpm -r --filter "@sabo/shared-*" build
```

#### 4. Port Conflicts
```bash
# Kill processes on specific ports
kill -9 $(lsof -ti:8080)
kill -9 $(lsof -ti:8081)
```

### Debug Tools:
- **React DevTools**: Browser extension for React debugging
- **VS Code Debugger**: Set breakpoints in VS Code
- **Network Tab**: Monitor API calls and performance
- **Bundle Analyzer**: `./scripts/bundle-analyzer.sh`

---

## 📦 Package Management

### Adding Dependencies:

#### To Specific App:
```bash
# Add to user app
pnpm -F @sabo/user-app add package-name

# Add to admin app  
pnpm -F @sabo/admin-app add package-name
```

#### To Shared Package:
```bash
# Add to shared-ui
pnpm -F @sabo/shared-ui add package-name

# Add dev dependency to shared-types
pnpm -F @sabo/shared-types add -D package-name
```

#### Workspace-wide:
```bash
# Add to root (affects all packages)
pnpm add -w package-name
```

### Managing Versions:
```bash
# Update specific package
pnpm update package-name

# Update all packages
pnpm update -r

# Check outdated packages
pnpm outdated
```

---

## 🎨 Code Style Guidelines

### TypeScript Best Practices:
```typescript
// Use explicit return types for functions
export const calculateScore = (points: number): number => {
  return points * 1.5;
};

// Prefer interfaces over types for object shapes
interface UserProps {
  id: string;
  name: string;
  email: string;
}

// Use proper null checks
const userName = user?.name ?? 'Anonymous';
```

### React Best Practices:
```typescript
// Use functional components with TypeScript
interface ComponentProps {
  title: string;
  isActive?: boolean;
}

export const MyComponent: React.FC<ComponentProps> = ({ title, isActive = false }) => {
  // Use hooks at the top level
  const [count, setCount] = useState(0);
  
  // Use useCallback for expensive operations
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
  
  return (
    <div className={`component ${isActive ? 'active' : ''}`}>
      <h1>{title}</h1>
      <button onClick={handleClick}>Count: {count}</button>
    </div>
  );
};
```

### CSS/Tailwind Guidelines:
```typescript
// Prefer Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  
// Use CSS modules for complex styles
import styles from './Component.module.css';
<div className={styles.complexLayout}>
```

---

## 🔄 Git Workflow

### Commit Message Convention:
```
type(scope): description

feat(user): add tournament registration flow
fix(admin): resolve dashboard loading issue
docs(readme): update installation instructions
refactor(shared): optimize authentication hook
test(utils): add validation function tests
```

### Pull Request Process:
1. **Create Feature Branch**: `git checkout -b feature/description`
2. **Make Changes**: Implement your feature
3. **Test Locally**: Run tests and verify functionality
4. **Commit Changes**: Follow commit message convention
5. **Push Branch**: `git push origin feature/description`
6. **Create PR**: Open pull request with clear description
7. **Code Review**: Address feedback from team members
8. **Merge**: Squash and merge after approval

---

## 📚 Learning Resources

### Essential Documentation:
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/guide/
- **pnpm**: https://pnpm.io/motivation

### Internal Resources:
- **API Documentation**: `/docs/API.md`
- **Component Library**: `/docs/COMPONENTS.md`
- **Architecture Guide**: `/docs/ARCHITECTURE.md`
- **Deployment Guide**: `/docs/DEPLOYMENT_GUIDE.md`

---

## 🆘 Getting Help

### Team Contacts:
- **Tech Lead**: @tech-lead (Architecture & complex issues)
- **Frontend Lead**: @frontend-lead (UI/UX & React questions)
- **DevOps Lead**: @devops-lead (Build & deployment issues)

### Communication Channels:
- **Slack**: #sabo-arena-dev (General development)
- **Slack**: #sabo-arena-help (Quick questions)
- **GitHub Issues**: For bug reports and feature requests

### Office Hours:
- **Daily Standup**: 9:00 AM - Team sync
- **Code Review**: 2:00 PM - Collaborative review session
- **Tech Talk**: Friday 4:00 PM - Knowledge sharing

---

## ✅ Onboarding Checklist

### First Day:
- [ ] Environment setup completed
- [ ] Repository cloned and dependencies installed
- [ ] Both apps running locally
- [ ] VS Code configured with recommended extensions
- [ ] Team introductions completed

### First Week:
- [ ] First feature branch created and merged
- [ ] Attended daily standups
- [ ] Reviewed codebase architecture
- [ ] Completed assigned onboarding tasks
- [ ] Set up development tools and accounts

### First Month:
- [ ] Contributed to shared packages
- [ ] Participated in code reviews
- [ ] Understanding of full development workflow
- [ ] Familiar with testing practices
- [ ] Contributing to documentation

---

## 🎉 Welcome to the Team!

You're now ready to contribute to SABO Arena! Remember:
- **Ask Questions**: No question is too small
- **Share Knowledge**: Help others learn
- **Code Quality**: Follow established patterns
- **Test Everything**: Ensure reliability
- **Document Changes**: Keep docs updated

Happy coding! 🚀

---

*Last Updated: August 28, 2025 - SABO Arena Development Team*
