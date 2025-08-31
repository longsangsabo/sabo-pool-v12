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
