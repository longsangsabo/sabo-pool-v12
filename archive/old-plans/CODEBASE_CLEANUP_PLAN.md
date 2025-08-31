# 🧹 **CODEBASE CLEANUP PLAN - SABO POOL V12**
## Dọn dẹp migration files và code, KHÔNG ĐỤN TỚI DATABASE

### 🎯 **MỤC TIÊU CHÍNH**
1. **Archive migration files cũ** - Di chuyển 2700+ files vào thư mục archive
2. **Tổ chức lại cấu trúc** - Tạo structure rõ ràng cho migration files
3. **Dọn dẹp functions trùng lặp** - Loại bỏ các Edge Functions không dùng
4. **Chuẩn hóa naming convention** - Thống nhất cách đặt tên
5. **Tạo documentation** - Ghi chép lại logic hiện tại

---

## 📅 **KẾ HOẠCH THỰC HIỆN**

### **PHASE 1: BACKUP & ARCHIVE (Day 1)**
- [ ] Tạo thư mục archive cho migration files cũ
- [ ] Di chuyển tất cả migration files vào archive
- [ ] Backup Edge Functions hiện tại
- [ ] Tạo inventory của tất cả components

### **PHASE 2: REORGANIZE STRUCTURE (Day 1-2)**  
- [ ] Tạo cấu trúc thư mục mới cho migrations
- [ ] Phân loại migrations theo chức năng
- [ ] Tổ chức lại Edge Functions
- [ ] Chuẩn hóa naming conventions

### **PHASE 3: CODE CLEANUP (Day 2-3)**
- [ ] Loại bỏ duplicate functions
- [ ] Remove unused imports/dependencies
- [ ] Clean up configuration files
- [ ] Optimize build scripts

### **PHASE 4: DOCUMENTATION (Day 3)**
- [ ] Document current database schema
- [ ] Create migration history log
- [ ] Write development guidelines
- [ ] Update README files

---

## 🗂️ **CẤU TRÚC THƯ MỤC MỚI**

```
sabo-pool-v12/
├── database-management/
│   ├── archive/
│   │   ├── migrations-2024/
│   │   ├── migrations-2025-q1/
│   │   ├── migrations-2025-q2/
│   │   └── migrations-2025-q3/
│   ├── current/
│   │   ├── 001-core-schema.md
│   │   ├── 002-user-system.md
│   │   ├── 003-game-system.md
│   │   └── 004-business-logic.md
│   ├── documentation/
│   │   ├── schema-reference.md
│   │   ├── migration-guidelines.md
│   │   └── api-endpoints.md
│   └── tools/
│       ├── schema-analyzer.sh
│       ├── migration-validator.sh
│       └── backup-helper.sh
├── supabase/
│   ├── functions/ (organized)
│   └── migrations/ (clean)
└── docs/
    ├── database/
    └── development/
```

---

## 🔧 **AUTOMATION SCRIPTS**

### **1. Migration Archiver**
```bash
#!/bin/bash
# Archive old migrations without touching database
./scripts/archive-migrations.sh
```

### **2. Code Analyzer** 
```bash
#!/bin/bash
# Analyze codebase for cleanup opportunities
./scripts/analyze-codebase.sh
```

### **3. Structure Validator**
```bash
#!/bin/bash  
# Validate new structure after reorganization
./scripts/validate-structure.sh
```

---

## ⚠️ **SAFETY RULES**

### **❌ KHÔNG ĐƯỢC LÀM:**
- **KHÔNG** xóa hoặc sửa database
- **KHÔNG** chạy migration files
- **KHÔNG** thay đổi Supabase settings
- **KHÔNG** modify production data

### **✅ CHỈ ĐƯỢC LÀM:**
- **DI CHUYỂN** files trong codebase
- **TỔ CHỨC** lại thư mục
- **ARCHIVE** migration files cũ
- **DOCUMENT** logic hiện tại
- **CLEAN UP** unused code

---

## 📊 **SUCCESS METRICS**

### **Code Organization**
- [ ] Migration files: 2700+ → Archived safely
- [ ] Current migrations: Clear and documented  
- [ ] Edge Functions: Organized by purpose
- [ ] Naming conventions: 100% consistent

### **Documentation**
- [ ] Database schema: Fully documented
- [ ] Migration history: Complete log
- [ ] Development guides: Up-to-date
- [ ] API references: Current

### **Maintainability**
- [ ] New developer onboarding: < 30 minutes
- [ ] Code navigation: Intuitive structure
- [ ] Future changes: Clear process
- [ ] Rollback procedures: Documented

---

**CREATED**: August 31, 2025  
**STATUS**: Ready for safe codebase cleanup  
**PRIORITY**: 🟡 Important but Safe
