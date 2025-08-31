# 📚 SABO Arena Documentation

> **Simplified documentation for SABO Arena billiards tournament platform**

## 🎯 What is SABO Arena?

**SABO Arena** là nền tảng quản lý giải đấu bi-da với 5 tính năng chính:
- 🏆 **Tournament System** - SABO Double Elimination tournaments
- ⚔️ **Challenge System** - 1v1 challenges với ELO ranking  
- 💰 **Payment Integration** - VNPay cho tournament fees
- 📊 **Real-time Updates** - Live brackets và notifications
- 📱 **Mobile-First Design** - Responsive user experience

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install
pnpm install

# 2. Environment
cp .env.example .env
# Configure Supabase credentials

# 3. Start development
pnpm dev
# User platform: http://localhost:8080
# Admin interface: http://localhost:8081
```

**Complete setup**: [Getting Started Guide](./01-getting-started/)

## 📖 Documentation Structure

### 🚀 **Development** 
- **[Getting Started](./01-getting-started/)** - Setup và onboarding
- **[Development](./04-development/)** - Coding standards và guidelines
- **[Deployment](./05-deployment/)** - CI/CD và production deployment

### 🎨 **Design & UI**
- **[Design System](./02-design-system/)** - Components, tokens, và styling
- **[Architecture](./03-architecture/)** - System overview và tech stack

### � **Integration**
- **[API Documentation](./06-api/)** - Backend integration và authentication
- **[Tools & Scripts](./07-tools/)** - Development tools và automation

### 📊 **Reference**
- **[Features Overview](./08-features/)** - Core functionality documentation
- **[Reports](./09-reports/)** - Development progress và audit reports
- **[Reference Guides](./10-reference/)** - Technical analysis và optimization

## 🏗️ Architecture Overview

```
User Platform (8080)    Admin Interface (8081)
       ↓                        ↓
    React 18 + TypeScript + Tailwind CSS
       ↓                        ↓
  Shared Business Logic (packages/shared-*)
       ↓                        ↓
    Supabase (Database + Auth + Real-time)
       ↓
    VNPay Payment Gateway
```

## 🎯 Core Features

| Feature | Description | Status |
|---------|-------------|---------|
| **Tournament System** | SABO Double Elimination với brackets | ✅ Complete |
| **Challenge System** | 1v1 challenges với ELO calculation | ✅ Complete |
| **Ranking System** | ELO + SPA points leaderboards | ✅ Complete |
| **Payment Integration** | VNPay cho tournament registration | ✅ Complete |
| **Real-time Updates** | Live brackets và notifications | ✅ Complete |
| **Admin Interface** | Tournament và user management | ✅ Complete |

## � For Different Roles

### 🔧 **Developers**
1. Start with [Quick Start](./01-getting-started/quick-start.md)
2. Follow [Coding Standards](./04-development/coding-standards.md)
3. Use [Design System](./02-design-system/) for consistent UI

### 🎨 **Designers**  
1. Review [Design Tokens](./02-design-system/design-tokens.md)
2. Check [Component Library](./02-design-system/components.md)
3. Follow [Style Guidelines](./02-design-system/style-editing.md)

### 🚀 **DevOps**
1. Setup [CI/CD Pipeline](./05-deployment/ci-cd-setup.md)
2. Configure [Monitoring](./05-deployment/monitoring.md)
3. Follow [Deployment Guide](./05-deployment/deployment-guide.md)

### 📊 **Product Managers**
1. Review [System Overview](../SYSTEM_OVERVIEW.md)
2. Check [Features Documentation](./08-features/)
3. Monitor [Progress Reports](./09-reports/)

## 🔍 Quick Find

| Need | Go To |
|------|-------|
| **Start developing** | [Quick Start](./01-getting-started/quick-start.md) |
| **API integration** | [API Overview](./06-api/api-overview.md) |
| **UI components** | [Component Library](./02-design-system/components.md) |
| **Deployment** | [Deployment Guide](./05-deployment/deployment-guide.md) |
| **Business logic** | [Architecture Overview](./03-architecture/overview.md) |
| **Troubleshooting** | [Archive](./99-archive/) |

## 📞 Need Help?

- **Development Issues**: Check [Development Guidelines](./04-development/guidelines.md)
- **Design Questions**: Review [Design System](./02-design-system/)
- **Deployment Problems**: See [Deployment](./05-deployment/)
- **Legacy Issues**: Check [Archive](./99-archive/)

---

**🎯 Goal**: Simple, maintainable documentation that helps teams be productive

**Last Updated**: August 31, 2025 | **Status**: Production Ready
