# 🎱 SABO Arena - Billiards Tournament Platform

> **Clean Architecture Monorepo** - Modern billiards tournament management platform with separate user and admin applications.

## 🏗️ Architecture Overview

```
sabo-pool-v12/
├── apps/
│   ├── sabo-user/          # User Platform (Port 8080)
│   └── sabo-admin/         # Admin Interface (Port 8081)
├── packages/
│   ├── shared-auth/        # Authentication utilities
│   ├── shared-types/       # TypeScript type definitions
│   ├── shared-ui/          # Reusable UI components
│   ├── shared-utils/       # Common utilities
│   └── shared-hooks/       # React hooks
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
