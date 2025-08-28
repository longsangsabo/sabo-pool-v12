# ✅ SABO Arena - Developer Onboarding Checklist

> **Quick start guide for new team members**

---

## 🚀 Setup & Environment

### **Repository Setup**
- [ ] Clone: `git clone https://github.com/longsangsabo/sabo-pool-v12.git`
- [ ] Install: `pnpm install`
- [ ] Environment: Copy `.env.example` to `.env` and configure
- [ ] Test setup: `pnpm dev` (should start both apps)
- [ ] Verify: Check `localhost:8080` (user) and `localhost:8081` (admin)

### **Development Tools**
- [ ] VS Code with TypeScript support
- [ ] ESLint and Prettier extensions
- [ ] Git configured for this project
- [ ] Node.js 18+ and pnpm 8+ installed

---

## 📖 Understanding the Architecture

### **Project Structure Knowledge**
- [ ] Read main `README.md`
- [ ] Review `docs/DEVELOPMENT_HANDOVER_COMPREHENSIVE.md`
- [ ] Understand monorepo structure (`apps/` and `packages/`)
- [ ] Explore shared libraries in `packages/`

### **Application Understanding**
- [ ] User App (`apps/sabo-user`): Port 8080, public platform
- [ ] Admin App (`apps/sabo-admin`): Port 8081, management interface
- [ ] Shared packages: Common utilities and components
- [ ] Theme system: Light/dark mode support

---

## 🔧 Development Workflow

### **Common Commands**
```bash
# Development
pnpm dev              # Start both apps
pnpm dev:user         # Start user app only
pnpm dev:admin        # Start admin app only

# Building
pnpm build            # Build all apps
pnpm build:user       # Build user app
pnpm build:admin      # Build admin app

# Quality
pnpm lint             # Lint all code
pnpm type-check       # TypeScript check
pnpm test             # Run tests
```

### **Workflow Checklist**
- [ ] Understand pnpm workspace commands
- [ ] Know how to filter packages (`--filter`)
- [ ] Practice development commands
- [ ] Test build process
- [ ] Review code quality tools

---

## 🎨 Code Standards

### **TypeScript & React Patterns**
- [ ] Use TypeScript for all new code
- [ ] Follow React 18 patterns (hooks, functional components)
- [ ] Import shared types from `packages/shared-types`
- [ ] Use shared components from `packages/shared-ui`
- [ ] Follow established folder structure

### **Code Quality**
- [ ] ESLint: Zero lint errors
- [ ] Prettier: Consistent formatting
- [ ] TypeScript: Strict type checking
- [ ] Component patterns: Functional components with hooks
- [ ] Testing: Write tests for new features

---

## 🏗️ Architecture Patterns

### **Application Separation**
- [ ] User-specific code → `apps/sabo-user/src/`
- [ ] Admin-specific code → `apps/sabo-admin/src/`
- [ ] Shared utilities → `packages/shared-utils/`
- [ ] Shared components → `packages/shared-ui/`
- [ ] Shared types → `packages/shared-types/`

### **Authentication Pattern**
- [ ] User app: Anonymous + optional signup
- [ ] Admin app: Service role required
- [ ] Auth context from `packages/shared-auth`
- [ ] Environment variables for Supabase keys

---

## 🔐 Security & Best Practices

### **Security Checklist**
- [ ] Never commit sensitive data (`.env` is in `.gitignore`)
- [ ] Use environment variables for API keys
- [ ] Validate all user inputs
- [ ] Follow authentication patterns
- [ ] Use HTTPS in production

### **Performance Best Practices**
- [ ] Use React.memo for expensive components
- [ ] Implement lazy loading for routes
- [ ] Optimize bundle size (check with build)
- [ ] Use TypeScript for better tree shaking
- [ ] Follow component best practices

---

## 🧪 Testing & Quality

### **Testing Strategy**
- [ ] Unit tests: Vitest + React Testing Library
- [ ] Component testing: Test user interactions
- [ ] Integration tests: API and flow testing
- [ ] E2E tests: Playwright configuration
- [ ] Type checking: `pnpm type-check`

### **Before Committing**
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm type-check` - no type errors
- [ ] Run `pnpm test` - all tests pass
- [ ] Test both apps locally
- [ ] Commit message follows conventions

---

## 📚 Key Documentation

### **Must-Read Documents**
- [ ] `README.md` - Project overview
- [ ] `docs/DEVELOPMENT_HANDOVER_COMPREHENSIVE.md` - Complete guide
- [ ] `docs/EXECUTIVE_DEVELOPMENT_SUMMARY.md` - High-level overview
- [ ] `packages/*/README.md` - Package-specific documentation

### **Reference Materials**
- [ ] React 18 documentation
- [ ] TypeScript handbook
- [ ] Tailwind CSS documentation
- [ ] Supabase documentation
- [ ] Vite documentation

---

## 🤝 Team Collaboration

### **Git Workflow**
- [ ] Branch from `main` for new features
- [ ] Use descriptive commit messages
- [ ] Test locally before pushing
- [ ] Create PRs for code review
- [ ] Keep documentation updated

### **Communication**
- [ ] Ask questions about architecture decisions
- [ ] Share knowledge about new patterns
- [ ] Document any changes or discoveries
- [ ] Coordinate on shared package changes

---

## 🚨 Common Issues & Solutions

### **Development Issues**
```bash
# Port conflicts
pkill -f "vite"  # Kill running dev servers

# Dependency issues
pnpm clean       # Clean all node_modules
pnpm install     # Reinstall dependencies

# Type errors
pnpm type-check  # Check TypeScript errors
```

### **Build Issues**
- Check environment variables are set
- Verify all imports are correct
- Run `pnpm lint` to catch issues
- Check for circular dependencies

---

## 🎯 Ready to Develop!

### **Verification Checklist**
- [ ] Both apps start without errors
- [ ] Can navigate user app features
- [ ] Can access admin interface
- [ ] TypeScript compilation works
- [ ] Lint checks pass
- [ ] Understand project structure

### **First Development Task**
1. Pick a small feature or bug fix
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes following established patterns
4. Test locally: `pnpm dev`
5. Run quality checks: `pnpm lint && pnpm type-check`
6. Commit and create PR

---

**🎉 Welcome to the SABO Arena development team!**

> You're now ready to contribute to a modern, well-architected codebase. The foundation is solid, the documentation is comprehensive, and the development workflow is optimized for productivity.

**Need help?** Check the comprehensive documentation or ask team members about specific architectural decisions.

---

**📅 Checklist Version**: 1.0  
**🗓️ Last Updated**: August 28, 2025  
**🎯 Status**: Ready for team onboarding
