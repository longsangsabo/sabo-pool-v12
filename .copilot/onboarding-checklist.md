# 🤖 AI Assistant Onboarding Checklist

> **NEW COPILOT? START HERE!** Complete this checklist before making any changes.

## ✅ MANDATORY CHECKLIST

### **□ Step 1: Read Project Documentation**
- [ ] Read `/workspaces/sabo-pool-v12/README.md`
- [ ] Read `/workspaces/sabo-pool-v12/SYSTEM_OVERVIEW.md` 
- [ ] Read `/workspaces/sabo-pool-v12/NAMING_CONVENTION_PLAN.md`
- [ ] Read `/workspaces/sabo-pool-v12/docs/README.md`
- [ ] Read `/workspaces/sabo-pool-v12/.copilot/README.md`

### **□ Step 2: Understand Project Structure**
- [ ] SABO Arena = Billiards tournament platform
- [ ] Tech Stack = React 18 + TypeScript + Supabase + VNPay
- [ ] Apps = sabo-user (8080) + sabo-admin (8081)
- [ ] Packages = shared-* for common functionality
- [ ] Documentation = 66 organized files in docs/

### **□ Step 3: Learn File Naming Rules**
- [ ] Use kebab-case for all files (lowercase + hyphens)
- [ ] Maximum 30 characters per filename
- [ ] NO UPPER_CASE except README.md and major docs
- [ ] Check existing patterns before creating files

### **□ Step 4: Understand Forbidden Actions**
- [ ] NEVER create files in root without approval
- [ ] NEVER rename files without checking references
- [ ] NEVER duplicate existing functionality
- [ ] NEVER skip documentation updates
- [ ] ALWAYS ask before major architectural changes

---

## 🎯 QUICK COMMANDS TO RUN

Execute these commands to understand the project:

```bash
# Get project overview
cat /workspaces/sabo-pool-v12/SYSTEM_OVERVIEW.md

# Check current file count
find /workspaces/sabo-pool-v12 -name "*.md" | wc -l

# See documentation structure  
ls /workspaces/sabo-pool-v12/docs/

# View app structure
ls /workspaces/sabo-pool-v12/apps/

# Check shared packages
ls /workspaces/sabo-pool-v12/packages/
```

---

## 📋 BEFORE EVERY TASK

1. **🤔 Understand the Request**
   - What exactly does the user want?
   - Which part of the system is affected?
   - Is this creating new functionality or modifying existing?

2. **🔍 Research Existing Implementation**
   - Search for similar files or functionality
   - Check if this already exists
   - Look for established patterns

3. **📝 Plan Your Approach**
   - What files need to be created/modified?
   - Do they follow naming conventions?
   - What documentation needs updating?

4. **✅ Execute Systematically**
   - Follow established patterns
   - Use proper naming conventions
   - Update related documentation
   - Test your changes

---

## 🚨 RED FLAGS - STOP IF YOU SEE THESE

- 🛑 Creating files with UPPER_CASE names
- 🛑 Making duplicate files without removing old ones
- 🛑 Creating new directories without checking structure
- 🛑 Modifying core architecture without approval
- 🛑 Skipping documentation updates

---

## ✅ SUCCESS INDICATORS

You're doing well if:
- ✅ Following established naming patterns
- ✅ Reusing existing components/patterns
- ✅ Asking questions when unsure
- ✅ Documenting your changes
- ✅ Maintaining project organization

---

**Remember**: Be systematic, not random! The project is well-organized - keep it that way! 🎯
