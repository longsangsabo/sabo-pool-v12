# 🎯 SABO Arena - AI Assistant Quick Reference

> **INSTANT REFERENCE** for AI Assistants working on SABO Arena project

## 🏗️ PROJECT ESSENTIALS

**SABO Arena** = Billiards tournament management platform
- **User App**: http://localhost:8080 (React + TypeScript)
- **Admin App**: http://localhost:8081 (React + TypeScript)  
- **Backend**: Supabase (Database + Auth + Real-time)
- **Payment**: VNPay integration
- **Documentation**: 66 organized files

---

## 📁 DIRECTORY STRUCTURE

```
/workspaces/sabo-pool-v12/
├── 📱 apps/
│   ├── sabo-admin/          # Admin interface (8081)
│   └── sabo-user/           # User platform (8080)
├── 📦 packages/
│   ├── shared-auth/         # Authentication logic
│   ├── shared-business/     # Business logic
│   ├── shared-types/        # TypeScript types
│   ├── shared-ui/           # UI components
│   └── shared-utils/        # Utility functions
├── 📚 docs/                 # Documentation (66 files)
│   ├── 01-getting-started/
│   ├── 02-design-system/
│   ├── 03-architecture/
│   └── ... (11 sections total)
├── 🗄️ database_migration/   # DB migration files
├── ⚙️ scripts/             # Utility scripts
├── 🧪 e2e/                 # End-to-end tests
└── 🤖 .copilot/            # AI governance rules
```

---

## 📋 NAMING CONVENTIONS

### **File Naming Rules:**
- **Format**: kebab-case (lowercase + hyphens)
- **Length**: Maximum 30 characters
- **Pattern**: `[category]-[function]-[type].md`
- **Examples**: 
  - ✅ `user-authentication.md`
  - ✅ `payment-integration-guide.md`
  - ❌ `USER_AUTHENTICATION.md`
  - ❌ `paymentIntegrationGuideLongName.md`

### **Directory Rules:**
- Follow existing structure in `/docs/[01-11]-*/`
- Use existing shared packages when possible
- Don't create new root-level directories

---

## 🚫 FORBIDDEN ACTIONS

**NEVER DO THESE without asking:**
- ❌ Create files in project root
- ❌ Use UPPER_CASE file names (except README.md)
- ❌ Create duplicate functionality
- ❌ Rename existing files without checking references
- ❌ Skip documentation updates
- ❌ Change core architecture

---

## ✅ REQUIRED WORKFLOW

### **Before ANY Changes:**
1. 📖 Read relevant documentation first
2. 🔍 Check for existing similar implementations  
3. 📝 Plan minimal viable changes
4. 🎯 Follow established patterns

### **When Creating Files:**
1. ✅ Check naming convention compliance
2. ✅ Verify target directory is appropriate
3. ✅ Ensure no duplicates exist
4. ✅ Plan documentation updates

### **When Modifying Code:**
1. ✅ Understand existing patterns
2. ✅ Use shared packages when possible
3. ✅ Follow TypeScript best practices
4. ✅ Update related tests/docs

---

## 🎯 CORE FEATURES TO UNDERSTAND

### **Tournament System**
- SABO Double Elimination brackets
- Real-time bracket updates
- Tournament fee management

### **Challenge System**  
- 1v1 player challenges
- ELO ranking system
- Challenge history tracking

### **Payment Integration**
- VNPay payment gateway
- Tournament fee processing
- Payment status tracking

### **User Management**
- Supabase authentication
- Role-based access control
- User profile management

---

## 📞 WHEN IN DOUBT

1. **🤔 Ask the user** for clarification
2. **📚 Check the documentation** in `/docs/`
3. **🔍 Search for existing patterns** in the codebase
4. **💭 Explain your reasoning** before making changes

---

## 🚨 EMERGENCY CONTACTS

**Documentation Issues**: Check `/docs/README.md`
**Naming Questions**: Check `NAMING_CONVENTION_PLAN.md`
**Architecture Questions**: Check `SYSTEM_OVERVIEW.md`
**Governance Rules**: Check `.copilot/README.md`

---

**Remember**: This is a well-organized project. Keep it that way by following established patterns and asking when unsure! 🎯✨
