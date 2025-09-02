# 🔍 COPILOT DEVELOPMENT PROTOCOL - SHARED LOGIC FIRST

## ⚠️ MANDATORY CHECKLIST - ALWAYS DO BEFORE CODING

### 🎯 **STEP 1: SHARED LOGIC AUDIT** (REQUIRED)
Before implementing ANY feature, ALWAYS check:

1. **packages/shared-business/src/** - Business logic exists?
2. **packages/shared-types/src/** - Type definitions available?
3. **packages/shared-hooks/** - React hooks available?
4. **packages/shared-ui/** - UI components available?
5. **packages/shared-utils/** - Utility functions available?

### 📋 **STEP 2: EXISTING CODE SCAN** (REQUIRED)
Check if similar features already exist:
- `grep_search` for related functionality
- `semantic_search` for similar implementations
- `file_search` for existing screens/components
- `list_dir` to understand project structure

### 🔄 **STEP 3: INTEGRATION STRATEGY** (REQUIRED)
Choose implementation approach:
- **REUSE**: Use existing shared logic (PREFERRED)
- **ENHANCE**: Extend existing shared logic
- **WRAP**: Create Flutter/React wrappers for shared logic
- **CREATE**: Only if no shared logic exists

### ⚡ **STEP 4: SHARED LOGIC INTEGRATION** (REQUIRED)
When using shared logic:
- Import from `packages/shared-*` 
- Create service wrappers for Flutter
- Use existing types and interfaces
- Follow established patterns

---

## 🚫 **NEVER DO THIS:**
- ❌ Create new business logic without checking shared packages
- ❌ Duplicate existing functionality
- ❌ Ignore existing type definitions
- ❌ Skip shared component usage

## ✅ **ALWAYS DO THIS:**
- ✅ Check shared packages FIRST
- ✅ Reuse existing business logic
- ✅ Extend shared functionality when needed
- ✅ Create integration layers for Flutter/React
- ✅ Follow established patterns

---

## 📁 **SHARED PACKAGES REFERENCE:**

### `packages/shared-business/src/`
```
user/           # User profile, settings, auth
ranking/        # ELO, SPA, leaderboards  
tournament/     # Tournament management
club/           # Club management
challenge/      # Challenge system
payment/        # Payment processing
notification/   # Notification system
analytics/      # Analytics tracking
```

### `packages/shared-types/src/`
```
user.ts         # User types
elo.ts          # Ranking types
game.ts         # Game types
database.ts     # Database types
common.ts       # Common types
```

### `packages/shared-ui/src/`
```
components/     # Reusable UI components
design-tokens/  # Design system tokens
```

---

## 🔄 **WORKFLOW EXAMPLE:**

### Before: ❌ Wrong Approach
```
User: "Create user profile management"
Copilot: "I'll create a new profile service..."
```

### After: ✅ Correct Approach
```
User: "Create user profile management"
Copilot: 
1. "Let me check shared logic first..."
2. "Found packages/shared-business/src/user/user-profile.ts"
3. "Found packages/shared-types/src/user.ts"
4. "I'll create Flutter wrapper using existing shared logic..."
```

---

## 🎯 **MANTRAS TO REMEMBER:**

1. **"SHARED LOGIC FIRST"** - Always check before creating
2. **"REUSE OVER RECREATE"** - Extend existing, don't duplicate
3. **"INTEGRATE, DON'T ISOLATE"** - Use shared packages consistently
4. **"PATTERNS OVER PATCHES"** - Follow established patterns

---

## 📝 **RESPONSE TEMPLATE:**

```
🔍 **Shared Logic Check:**
- ✅ Found: packages/shared-business/src/[module]
- ✅ Found: packages/shared-types/src/[types]
- ✅ Strategy: [REUSE/ENHANCE/WRAP/CREATE]

🚀 **Implementation Plan:**
1. Use existing [shared-logic-name]
2. Create [Flutter/React] wrapper service
3. Integrate with [existing-patterns]
```

---

**🎯 REMEMBER: The goal is to build on top of shared foundations, not rebuild them!**
