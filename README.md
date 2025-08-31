# 🎱 SABO Arena - Billiards Tournament Platform

> **Clean Architecture Monorepo** - Modern billiards tournament management platform with complete TypeScript type safety and database synchronization.

## 🤖 FOR COPILOT: Service Discovery Instructions

**IMPORTANT**: Before working with any services, ALWAYS read these files first:

1. **`/apps/sabo-user/src/services/serviceDiscovery.ts`** - 🔥 START HERE - Complete service registry
2. **`.copilot-instructions.md`** - Detailed Copilot workflow instructions  
3. **`SERVICES_REFERENCE.md`** - Complete service documentation
4. **`SERVICES_IMPORTS.md`** - Copy-paste import examples

### Quick Service Discovery for Copilot:
```typescript
// Import discovery functions
import { findServicesFor, getServiceLocation, getServiceInfo } from './apps/sabo-user/src/services/serviceDiscovery';

// Find services for any use case
const services = findServicesFor('create tournament'); 
// Returns: ['tournamentService', 'userService', 'paymentService', 'notificationService']

// Get file location to read
const filePath = getServiceLocation('tournamentService');
// Returns: '/workspaces/sabo-pool-v12/apps/sabo-user/src/services/tournamentService.ts'

// Get complete service info
const info = getServiceInfo('userService');
// Returns: { name, filePath, methods, dependencies, examples }
```

### Service Categories (43 total):
- 🔐 **Authentication** (4): userService, authService, profileService, settingsService
- 🏆 **Tournaments** (4): tournamentService, challengeService, matchService, tableService  
- 🏢 **Clubs** (3): clubService, memberService, roleService
- ⭐ **Verification** (4): verificationService, rankService, handicapService, statisticsService
- 💰 **Payments** (4): walletService, paymentService, transactionService, spaPointsService
- 📢 **Communication** (4): notificationService, emailService, messageService, alertService
- 💾 **Data** (4): storageService, cacheService, backupService, syncService
- 📊 **Analytics** (4): analyticsService, reportingService, metricsService, auditService
- 🖥️ **Dashboard** (4): dashboardService, searchService, filterService, themeService
- 📱 **Mobile** (3): offlineService, webSocketService, pushNotificationService
- 🔒 **Security** (3): securityService, validationService, permissionService

---

## 🎯 Status: Database Synchronization Complete ✅

**Latest Update:** 2025-08-31 - Completed full database schema synchronization with TypeScript types

### 📊 Achievement Summary
- ✅ **74 database tables** fully typed with TypeScript
- ✅ **Type-safe database operations** across all applications  
- ✅ **Schema synchronization** - codebase matches database 100%
- ✅ **Developer experience** enhanced with IntelliSense and compile-time checking
- ✅ **Shared type system** for consistent development

## 🏗️ Architecture Overview

```
sabo-pool-v12/
├── apps/
│   ├── sabo-user/          # User Platform (Port 8080)
│   │   └── src/integrations/supabase/
│   │       └── types.ts    # 🎯 Main Database Types (2,834 lines)
│   └── sabo-admin/         # Admin Interface (Port 8081)
├── packages/
│   ├── shared-types/       # 🎯 TypeScript definitions (74 tables)
│   ├── shared-auth/        # Authentication utilities
│   ├── shared-ui/          # Reusable UI components
│   ├── shared-utils/       # Common utilities
│   └── shared-hooks/       # React hooks
├── scripts/                # 🎯 Database sync tools
│   ├── enhanced-database-types-generator.js
│   └── codebase-sync-verification.js
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Configure your Supabase credentials in .env
```

### Development
```bash
# Start user platform (Port 8080)
cd apps/sabo-user && npm run dev

# Start admin interface (Port 8081)
cd apps/sabo-admin && npm run dev

# Or run both simultaneously
pnpm dev
```

## 📱 Applications

### User Platform (`apps/sabo-user`)
- **Port**: 8080
- **Features**: Tournament registration, challenges, rankings, profile management
- **Design**: Mobile-first responsive design with light/dark theme
- **Auth**: Anonymous authentication with optional signup

### Admin Interface (`apps/sabo-admin`)
- **Port**: 8081  
- **Features**: User management, tournament administration, system analytics
- **Design**: Desktop-optimized with comprehensive navigation
- **Auth**: Service role authentication required

## 🎨 Design System

- **Theme**: Light/Dark mode support
- **Responsive**: Mobile-first approach
- **Colors**: SABO brand gradients and tech aesthetics
- **Components**: Shared UI library with consistent styling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Database, Auth, Real-time)
- **State**: React Query, Context API
- **Monorepo**: pnpm workspaces
- **Testing**: Vitest, Playwright

## 📦 Packages

| Package | Description | Version |
|---------|-------------|---------|
| `shared-auth` | Authentication hooks and services | 1.0.0 |
| `shared-types` | TypeScript type definitions | 1.0.0 |
| `shared-ui` | Reusable UI components | 1.0.0 |
| `shared-utils` | Common utility functions | 1.0.0 |
| `shared-hooks` | React hooks library | 1.0.0 |

## 🔧 Configuration

### Environment Variables
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=1.0.0
```

## 🏃‍♂️ Scripts

```bash
# Development
pnpm dev              # Start both apps
pnpm dev:user         # Start user app only
pnpm dev:admin        # Start admin app only

# Building
pnpm build            # Build all apps
pnpm build:user       # Build user app
pnpm build:admin      # Build admin app

# Testing
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests

# Linting & Formatting
pnpm lint             # Lint all packages
pnpm format           # Format code
```

## 📚 Documentation

- **Migration History**: `docs/migration-history/`
- **Architecture**: `docs/architecture/`
- **Legacy**: `docs/legacy/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Tournament live streaming
- [ ] AI-powered match recommendations

---

**Made with ❤️ by the SABO Team**
