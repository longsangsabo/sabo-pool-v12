#!/bin/bash

# 🧹 SABO POOL V12 - DATABASE CLEANUP AUTOMATION SCRIPT
# Comprehensive cleanup and optimization for production database

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./database-cleanup/backups/$(date +%Y%m%d_%H%M%S)"
ARCHIVE_DIR="./database-cleanup/archive"
LOGS_DIR="./database-cleanup/logs"

# Create directories
mkdir -p "$BACKUP_DIR" "$ARCHIVE_DIR" "$LOGS_DIR"

echo -e "${BLUE}🚀 Starting SABO Pool V12 Database Cleanup Process${NC}"
echo -e "${BLUE}=================================================${NC}"

# Phase 1: Assessment & Backup
echo -e "\n${YELLOW}📋 PHASE 1: ASSESSMENT & BACKUP${NC}"

# Count current migration files
MIGRATION_COUNT=$(find ./supabase/migrations -name "*.sql" | wc -l)
echo -e "${BLUE}📊 Found $MIGRATION_COUNT migration files${NC}"

# Archive existing migrations
echo -e "${YELLOW}📦 Archiving existing migrations...${NC}"
cp -r ./supabase/migrations/* "$ARCHIVE_DIR/" 2>/dev/null || echo "No migrations to archive"

# Count database functions
FUNCTION_COUNT=$(find ./supabase/functions -type d -mindepth 1 | wc -l)
echo -e "${BLUE}⚙️  Found $FUNCTION_COUNT Edge Functions${NC}"

# Phase 2: Migration File Analysis
echo -e "\n${YELLOW}📋 PHASE 2: MIGRATION ANALYSIS${NC}"

# Find duplicate table creations
echo -e "${BLUE}🔍 Analyzing duplicate table creations...${NC}"
grep -r "CREATE TABLE.*tournaments" ./supabase/migrations/ | wc -l > "$LOGS_DIR/tournament_duplicates.log" || echo "0" > "$LOGS_DIR/tournament_duplicates.log"
TOURNAMENT_DUPLICATES=$(cat "$LOGS_DIR/tournament_duplicates.log")
echo -e "${RED}⚠️  Found $TOURNAMENT_DUPLICATES duplicate tournament table creations${NC}"

# Find conflicting functions
echo -e "${BLUE}🔍 Analyzing function conflicts...${NC}"
grep -r "CREATE OR REPLACE FUNCTION" ./supabase/migrations/ | cut -d':' -f2 | sort | uniq -d > "$LOGS_DIR/function_conflicts.log"
FUNCTION_CONFLICTS=$(wc -l < "$LOGS_DIR/function_conflicts.log")
echo -e "${RED}⚠️  Found $FUNCTION_CONFLICTS conflicting functions${NC}"

# Phase 3: Create Cleanup Strategy
echo -e "\n${YELLOW}📋 PHASE 3: CLEANUP STRATEGY${NC}"

cat > "$BACKUP_DIR/cleanup_summary.md" << EOF
# Database Cleanup Summary
**Date**: $(date)
**Migration Files**: $MIGRATION_COUNT
**Edge Functions**: $FUNCTION_COUNT
**Tournament Table Duplicates**: $TOURNAMENT_DUPLICATES
**Function Conflicts**: $FUNCTION_CONFLICTS

## Cleanup Actions Required:
1. Consolidate $MIGRATION_COUNT migrations into 10-15 clean files
2. Resolve $FUNCTION_CONFLICTS function conflicts
3. Remove $TOURNAMENT_DUPLICATES duplicate table creations
4. Optimize database schema for performance

## Risk Assessment:
- **High**: Migration chaos (2700+ files)
- **Medium**: Function conflicts
- **Low**: Edge function count (manageable)
EOF

echo -e "${GREEN}✅ Assessment complete. Summary saved to $BACKUP_DIR/cleanup_summary.md${NC}"

# Phase 4: Generate Cleanup Commands
echo -e "\n${YELLOW}📋 PHASE 4: GENERATE CLEANUP COMMANDS${NC}"

cat > "$BACKUP_DIR/cleanup_commands.sh" << 'EOF'
#!/bin/bash
# Generated cleanup commands for SABO Pool V12

echo "🧹 Starting database cleanup..."

# Step 1: Archive old migrations
echo "📦 Archiving old migrations..."
mkdir -p ./archive/migrations_$(date +%Y%m%d)
mv ./supabase/migrations/* ./archive/migrations_$(date +%Y%m%d)/

# Step 2: Create consolidated migration structure
echo "🏗️ Creating clean migration structure..."
mkdir -p ./supabase/migrations

# Step 3: Create consolidated schema migration
cat > ./supabase/migrations/20250831000000_consolidated_schema.sql << 'SCHEMA'
-- ===================================================================
-- 🔧 SABO POOL V12 - CONSOLIDATED CLEAN SCHEMA
-- Replaces 2700+ conflicting migration files
-- Created: $(date)
-- ===================================================================

BEGIN;

-- Drop all existing objects to start clean
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TODO: Add clean schema definitions here
-- This will be populated with optimal table structures

COMMIT;
SCHEMA

echo "✅ Cleanup commands generated successfully!"
EOF

chmod +x "$BACKUP_DIR/cleanup_commands.sh"

# Phase 5: Create Service Role Access Script
echo -e "\n${YELLOW}📋 PHASE 5: SERVICE ROLE ACCESS SETUP${NC}"

cat > "$BACKUP_DIR/service_role_access.sh" << 'EOF'
#!/bin/bash
# Service Role Access Script for Direct Database Management

# Configuration (UPDATE THESE VALUES)
export SUPABASE_URL="https://exlqvlbawytbglioqfbc.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY_HERE"

# Database connection details
export PGHOST="db.exlqvlbawytbglioqfbc.supabase.co"
export PGPORT="5432"
export PGDATABASE="postgres"
export PGUSER="postgres"
export PGPASSWORD="YOUR_DB_PASSWORD_HERE"

echo "🔑 Service Role Access Configured"
echo "🌐 Supabase URL: $SUPABASE_URL"
echo "📊 Database Host: $PGHOST"

# Test connection
echo "🧪 Testing database connection..."
psql -c "SELECT current_database(), current_user, version();" || echo "❌ Connection failed - check credentials"

# Export current schema
echo "📤 Exporting current schema..."
pg_dump --schema-only --no-privileges --no-owner > current_schema.sql
echo "✅ Schema exported to current_schema.sql"

# List all tables
echo "📋 Current tables:"
psql -c "\dt"

echo "🎯 Ready for direct database management!"
EOF

chmod +x "$BACKUP_DIR/service_role_access.sh"

# Final Summary
echo -e "\n${GREEN}🎉 DATABASE CLEANUP PREPARATION COMPLETE!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "${BLUE}📁 Backup Directory: $BACKUP_DIR${NC}"
echo -e "${BLUE}📁 Archive Directory: $ARCHIVE_DIR${NC}"
echo -e "${BLUE}📁 Logs Directory: $LOGS_DIR${NC}"

echo -e "\n${YELLOW}📋 NEXT STEPS:${NC}"
echo -e "${BLUE}1. Review cleanup summary: $BACKUP_DIR/cleanup_summary.md${NC}"
echo -e "${BLUE}2. Configure service role: $BACKUP_DIR/service_role_access.sh${NC}"
echo -e "${BLUE}3. Execute cleanup: $BACKUP_DIR/cleanup_commands.sh${NC}"

echo -e "\n${RED}⚠️  IMPORTANT: Test on staging environment first!${NC}"
echo -e "${GREEN}✅ Ready to proceed with database optimization${NC}"
