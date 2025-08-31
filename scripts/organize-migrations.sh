#!/bin/bash

# 🚀 PHASE 2: MIGRATION ORGANIZATION
# Di chuyển migration files hiện tại vào structure mới

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🚀 PHASE 2: ORGANIZING CURRENT MIGRATIONS${NC}"
echo -e "${CYAN}=======================================${NC}"

# Create organized structure
LEGACY_DIR="./database-management/legacy"
ACTIVE_DIR="./database-management/active"
TEMP_DIR="./database-management/temp"

mkdir -p "$LEGACY_DIR" "$ACTIVE_DIR" "$TEMP_DIR"

# Move current migrations to legacy (vì có quá nhiều duplicates)
echo -e "${YELLOW}📦 Moving current migrations to legacy...${NC}"

if [ -d "./supabase/migrations" ] && [ "$(ls -A ./supabase/migrations)" ]; then
    # Count before move
    CURRENT_COUNT=$(find ./supabase/migrations -name "*.sql" | wc -l)
    echo -e "${BLUE}Moving $CURRENT_COUNT migration files...${NC}"
    
    # Move to legacy
    mv ./supabase/migrations/* "$LEGACY_DIR/" 2>/dev/null || true
    
    # Verify move
    MOVED_COUNT=$(find "$LEGACY_DIR" -name "*.sql" | wc -l)
    echo -e "${GREEN}✅ Moved $MOVED_COUNT files to legacy${NC}"
else
    echo -e "${YELLOW}ℹ️  No migration files to move${NC}"
fi

# Create clean migration directory
mkdir -p ./supabase/migrations

# Create starter migration for new development
cat > ./supabase/migrations/00000000000001_initial_setup.sql << 'EOF'
-- Initial setup migration for clean development
-- This file serves as the starting point for new migrations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create basic audit trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration tracking
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES ('00000000000001', 1, 'initial_setup');
EOF

echo -e "${GREEN}✅ Created clean migration starting point${NC}"

# Create development guide
cat > "./database-management/documentation/development-workflow.md" << 'EOF'
# Development Workflow

## Migration Strategy

### Current State
- **Legacy migrations**: Moved to `database-management/legacy/`
- **Clean start**: New migrations begin from `00000000000001_initial_setup.sql`
- **Database**: Unchanged (production safe)

### New Migration Process
1. **Create migration**: `supabase migration new <descriptive_name>`
2. **Write SQL**: Add your schema changes
3. **Test locally**: `supabase db reset` (local only)
4. **Review**: Check migration before pushing
5. **Deploy**: Apply to staging first

### File Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Migration Best Practices
- One logical change per migration
- Always include rollback strategy
- Test on staging environment
- Document complex changes
- Never modify existing migrations

## Database Schema Management

### Schema Documentation
- Keep schema docs updated
- Document all table relationships
- Maintain API documentation
- Track breaking changes

### Safety Rules
- Never drop tables without backup
- Always test migrations locally first
- Use transactions for complex changes
- Keep migration files small and focused
EOF

# Create clean supabase config
cat > ./supabase/config.toml << 'EOF'
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "sabo-pool-v12"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. public and storage are always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a table or view. Limits payload size for accidental
# or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version_num;` on the remote database to check.
major_version = 15

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://localhost:54321"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 2500
# pop3_port = 1100

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = true
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false

# Configure one of the supported SMS providers: `twilio`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_TWILIO_AUTH_TOKEN)"

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectURL.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""

[analytics]
enabled = false
port = 54327
vector_port = 54328
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"
EOF

echo -e "${GREEN}✅ Created clean Supabase configuration${NC}"

# Summary
echo -e "\n${CYAN}📊 ORGANIZATION COMPLETE${NC}"
echo -e "${GREEN}✅ Legacy migrations: database-management/legacy/${NC}"
echo -e "${GREEN}✅ Clean start: supabase/migrations/00000000000001_initial_setup.sql${NC}"
echo -e "${GREEN}✅ New config: supabase/config.toml${NC}"
echo -e "${GREEN}✅ Workflow docs: database-management/documentation/development-workflow.md${NC}"

echo -e "\n${YELLOW}🎯 Next Steps:${NC}"
echo -e "${BLUE}1. Review current database schema${NC}"
echo -e "${BLUE}2. Plan new migration strategy${NC}"
echo -e "${BLUE}3. Set up development workflow${NC}"
echo -e "${BLUE}4. Create schema documentation${NC}"
