-- Nuclear milestone system removal migration
-- Drops all milestone related tables, functions, views, policies, sequences
-- Irreversible cleanup before rebuilding new system
DO $$ BEGIN RAISE NOTICE 'Starting milestone system nuclear removal'; END $$;

DO $$ BEGIN
    -- Core tables
    EXECUTE 'DROP TABLE IF EXISTS spa_milestones CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS spa_reward_milestones CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS player_milestones CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS user_milestone_progress CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS spa_bonus_activities CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS spa_transaction_log CASCADE';

    -- Functions
    EXECUTE 'DROP FUNCTION IF EXISTS award_bonus_activity(uuid, text, jsonb) CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS check_milestone_progress(uuid, text, bigint) CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS update_spa_points(uuid, integer, text, text, uuid) CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS credit_spa_points(uuid, integer, text) CASCADE';

    -- Legacy / helper functions possibly existing
    EXECUTE 'DROP FUNCTION IF EXISTS update_spa_points(uuid, integer, text, text) CASCADE';

    -- Views
    EXECUTE 'DROP VIEW IF EXISTS spa_milestone_progress CASCADE';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Milestone cleanup encountered an error: %', SQLERRM;
END $$;

DO $$ BEGIN RAISE NOTICE 'Milestone system nuclear removal complete'; END $$;
