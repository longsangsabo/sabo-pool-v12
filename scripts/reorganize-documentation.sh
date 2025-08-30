#!/bin/bash

# 📚 DOCUMENTATION REORGANIZATION SCRIPT
# Automatically reorganize documentation structure

echo "📚 DOCUMENTATION REORGANIZATION"
echo "==============================="
echo ""

# Base documentation directory
DOCS_DIR="/workspaces/sabo-pool-v12/docs"
BACKUP_DIR="/workspaces/sabo-pool-v12/docs-backup-$(date +%Y%m%d_%H%M%S)"

# Create backup first
echo "💾 Creating backup of current documentation..."
cp -r "$DOCS_DIR" "$BACKUP_DIR"
echo "✅ Backup created at: $BACKUP_DIR"
echo ""

# Create new directory structure
echo "🏗️ Creating new directory structure..."

mkdir -p "$DOCS_DIR/01-getting-started"
mkdir -p "$DOCS_DIR/02-design-system"
mkdir -p "$DOCS_DIR/03-architecture"
mkdir -p "$DOCS_DIR/04-development"
mkdir -p "$DOCS_DIR/05-deployment"
mkdir -p "$DOCS_DIR/06-api"
mkdir -p "$DOCS_DIR/07-tools"
mkdir -p "$DOCS_DIR/08-features"
mkdir -p "$DOCS_DIR/09-reports"
mkdir -p "$DOCS_DIR/10-archive"

echo "✅ Directory structure created"
echo ""

# Function to move and rename files
move_file() {
    local source="$1"
    local destination="$2"
    local new_name="$3"
    
    if [ -f "$DOCS_DIR/$source" ]; then
        mv "$DOCS_DIR/$source" "$DOCS_DIR/$destination/$new_name"
        echo "📁 Moved: $source → $destination/$new_name"
    else
        echo "⚠️  File not found: $source"
    fi
}

echo "📦 Moving and renaming files..."

# 01-getting-started
move_file "QUICK_START_GUIDE.md" "01-getting-started" "quick-start.md"
move_file "DEVELOPER_ONBOARDING.md" "01-getting-started" "onboarding-guide.md"
move_file "DEVELOPER_ONBOARDING_CHECKLIST.md" "01-getting-started" "onboarding-checklist.md"

# 02-design-system
move_file "STYLE_EDITING_GUIDE.md" "02-design-system" "style-editing.md"
move_file "ComponentGuide.md" "02-design-system" "components.md"
move_file "DesignTokens.md" "02-design-system" "design-tokens.md"
move_file "CSS_CHEAT_SHEET.md" "02-design-system" "css-cheat-sheet.md"
move_file "UsageExamples.md" "02-design-system" "usage-examples.md"

# 03-architecture
move_file "ARCHITECTURE.md" "03-architecture" "overview.md"
move_file "TECHNICAL_ARCHITECTURE.md" "03-architecture" "tech-stack.md"
move_file "PROJECT_OVERVIEW.md" "03-architecture" "project-structure.md"

# 04-development
move_file "DEVELOPER_GUIDE.md" "04-development" "coding-standards.md"
move_file "DeveloperGuide.md" "04-development" "guidelines.md"

# 05-deployment
move_file "DEPLOYMENT_GUIDE.md" "05-deployment" "deployment-guide.md"
move_file "CICD_ENHANCEMENT.md" "05-deployment" "ci-cd-setup.md"
move_file "PERFORMANCE_MONITORING.md" "05-deployment" "monitoring.md"

# 06-api
move_file "API_DOCUMENTATION.md" "06-api" "api-overview.md"
move_file "AUTH_ROUTES_AND_CALLBACKS.md" "06-api" "authentication.md"

# 07-tools
move_file "AUTO_REFERENCE_IMPLEMENTATION_GUIDE.md" "07-tools" "auto-reference-system.md"

# 08-features
move_file "FEATURES_DOCUMENTATION.md" "08-features" "user-features.md"
move_file "BUSINESS_REQUIREMENTS.md" "08-features" "business-logic.md"

# 10-archive (move miscellaneous and outdated files)
move_file "DEVELOPER_INFORMATION_REPORT.md" "10-archive" "developer-information-report.md"
move_file "DEVELOPMENT_HANDOVER_COMPREHENSIVE.md" "10-archive" "development-handover.md"
move_file "EXECUTIVE_DEVELOPMENT_SUMMARY.md" "10-archive" "executive-summary.md"
move_file "TASK_4_DOCUMENTATION_PLAN.md" "10-archive" "task-4-plan.md"
move_file "DOCUMENTATION_REORGANIZATION_PLAN.md" "10-archive" "reorganization-plan.md"

echo ""
echo "📝 Creating category README files..."

# Create README for each category
create_category_readme() {
    local category="$1"
    local title="$2"
    local description="$3"
    
    cat > "$DOCS_DIR/$category/README.md" << EOF
# $title

$description

## 📋 Files in this category:

$(ls -1 "$DOCS_DIR/$category"/*.md 2>/dev/null | sed 's|.*/||' | sed 's|^|- [|' | sed 's|\.md$|](./&)|' || echo "No files yet")

## 🔗 Quick Links

- [Main Documentation](../README.md)
- [Getting Started](../01-getting-started/README.md)
- [Design System](../02-design-system/README.md)

---
Last updated: $(date)
EOF
}

# Create category READMEs
create_category_readme "01-getting-started" "🚀 Getting Started" "New developer onboarding and quick setup guides"
create_category_readme "02-design-system" "🎨 Design System" "UI components, design tokens, and styling guidelines"
create_category_readme "03-architecture" "🏗️ Architecture" "System architecture and technical documentation"
create_category_readme "04-development" "⚙️ Development" "Development guidelines, standards, and best practices"
create_category_readme "05-deployment" "🚀 Deployment" "Deployment guides, CI/CD, and operations"
create_category_readme "06-api" "📡 API Documentation" "API endpoints, authentication, and integration guides"
create_category_readme "07-tools" "🔧 Tools & Scripts" "Development tools, automation, and helper scripts"
create_category_readme "08-features" "📋 Features" "Feature documentation and business requirements"
create_category_readme "09-reports" "📊 Reports" "Progress reports, audits, and analysis"
create_category_readme "10-archive" "🗂️ Archive" "Archived and deprecated documentation"

echo "✅ Category README files created"
echo ""

# Create main navigation README
echo "📖 Creating main documentation index..."

cat > "$DOCS_DIR/README.md" << 'EOF'
# 📚 Sabo Pool V12 Documentation

Welcome to the comprehensive documentation for Sabo Pool V12 project.

## 🗂️ Documentation Categories

### 🚀 [Getting Started](./01-getting-started/)
New to the project? Start here for quick onboarding and setup.
- [Quick Start Guide](./01-getting-started/quick-start.md) - 5-minute setup
- [Onboarding Checklist](./01-getting-started/onboarding-checklist.md) - Complete checklist
- [Environment Setup](./01-getting-started/onboarding-guide.md) - Development environment

### 🎨 [Design System](./02-design-system/)
UI components, design tokens, and styling guidelines.
- [Style Editing Guide](./02-design-system/style-editing.md) - How to edit styles
- [Component Library](./02-design-system/components.md) - All UI components
- [Design Tokens](./02-design-system/design-tokens.md) - Colors, fonts, spacing
- [CSS Cheat Sheet](./02-design-system/css-cheat-sheet.md) - Quick reference

### 🏗️ [Architecture](./03-architecture/)
System architecture and technical documentation.
- [System Overview](./03-architecture/overview.md) - High-level architecture
- [Tech Stack](./03-architecture/tech-stack.md) - Technologies used
- [Project Structure](./03-architecture/project-structure.md) - Codebase organization

### ⚙️ [Development](./04-development/)
Development guidelines and best practices.
- [Coding Standards](./04-development/coding-standards.md) - Code style & conventions
- [Development Guidelines](./04-development/guidelines.md) - Best practices

### 🚀 [Deployment](./05-deployment/)
Deployment guides and operations.
- [Deployment Guide](./05-deployment/deployment-guide.md) - How to deploy
- [CI/CD Setup](./05-deployment/ci-cd-setup.md) - Continuous integration
- [Monitoring](./05-deployment/monitoring.md) - Performance monitoring

### 📡 [API Documentation](./06-api/)
API endpoints and integration guides.
- [API Overview](./06-api/api-overview.md) - API architecture
- [Authentication](./06-api/authentication.md) - Auth & callbacks

### 🔧 [Tools & Scripts](./07-tools/)
Development tools and automation.
- [Auto-Reference System](./07-tools/auto-reference-system.md) - Design system automation

### 📋 [Features](./08-features/)
Feature documentation and business requirements.
- [User Features](./08-features/user-features.md) - User-facing features
- [Business Logic](./08-features/business-logic.md) - Business requirements

### 📊 [Reports](./09-reports/)
Progress reports and analysis.
- Migration reports and audits

### 🗂️ [Archive](./10-archive/)
Archived and deprecated documentation.

## 🔍 Quick Find

### For New Developers:
1. [Quick Start Guide](./01-getting-started/quick-start.md) - Get up and running in 5 minutes
2. [Onboarding Checklist](./01-getting-started/onboarding-checklist.md) - Complete setup checklist

### For UI/UX Work:
1. [Style Editing Guide](./02-design-system/style-editing.md) - How to edit styles properly
2. [CSS Cheat Sheet](./02-design-system/css-cheat-sheet.md) - Quick reference for daily work
3. [Design Tokens](./02-design-system/design-tokens.md) - All design variables

### For Feature Development:
1. [Component Library](./02-design-system/components.md) - Available UI components
2. [API Documentation](./06-api/api-overview.md) - Backend integration
3. [Coding Standards](./04-development/coding-standards.md) - Code guidelines

### For Deployment:
1. [Deployment Guide](./05-deployment/deployment-guide.md) - Step-by-step deployment
2. [CI/CD Setup](./05-deployment/ci-cd-setup.md) - Automation setup

## 📞 Need Help?

- **Can't find what you're looking for?** Check the [Archive](./10-archive/) for older documentation
- **Found an issue?** Please update the documentation and help others
- **Need to add new docs?** Follow the [naming conventions](./10-archive/reorganization-plan.md)

---

**Last Updated**: $(date)  
**Maintained by**: Development Team
EOF

echo "✅ Main documentation index created"
echo ""

# Update links in moved files (basic link updates)
echo "🔗 Updating internal links..."

# Function to update links in a file
update_links_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # Update common link patterns
        sed -i 's|/docs/QUICK_START_GUIDE\.md|../01-getting-started/quick-start.md|g' "$file"
        sed -i 's|/docs/STYLE_EDITING_GUIDE\.md|../02-design-system/style-editing.md|g' "$file"
        sed -i 's|/docs/ComponentGuide\.md|../02-design-system/components.md|g' "$file"
        sed -i 's|/docs/DesignTokens\.md|../02-design-system/design-tokens.md|g' "$file"
        sed -i 's|/docs/CSS_CHEAT_SHEET\.md|../02-design-system/css-cheat-sheet.md|g' "$file"
        sed -i 's|./ComponentGuide\.md|./components.md|g' "$file"
        sed -i 's|./DesignTokens\.md|./design-tokens.md|g' "$file"
        sed -i 's|./UsageExamples\.md|./usage-examples.md|g' "$file"
        sed -i 's|./DeveloperGuide\.md|../04-development/guidelines.md|g' "$file"
    fi
}

# Update links in all moved files
find "$DOCS_DIR" -name "*.md" -type f | while read -r file; do
    update_links_in_file "$file"
done

echo "✅ Internal links updated"
echo ""

# Show final structure
echo "📊 REORGANIZATION COMPLETE!"
echo "==========================="
echo ""
echo "📁 New Documentation Structure:"
tree "$DOCS_DIR" -I 'archive|shared-infrastructure|scripts' 2>/dev/null || find "$DOCS_DIR" -type d | head -20

echo ""
echo "📋 Summary:"
echo "  ✅ Created organized directory structure"
echo "  ✅ Moved and renamed $(find "$DOCS_DIR" -name "*.md" | wc -l) documentation files"
echo "  ✅ Created category README files"
echo "  ✅ Updated main documentation index"
echo "  ✅ Updated internal links"
echo "  ✅ Created backup at: $BACKUP_DIR"
echo ""
echo "🎯 Next Steps:"
echo "  1. Review the new structure: $DOCS_DIR/README.md"
echo "  2. Test navigation and links"
echo "  3. Update any external references to documentation"
echo "  4. Clean up any remaining broken links"
echo ""
echo "📖 Access: code $DOCS_DIR/README.md"
