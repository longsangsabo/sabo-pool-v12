-- =============================================================================
-- SABO POOL V12 - MASTER DEMO LOADER
-- Loads complete demo environment with all systems
-- =============================================================================

\echo 'Loading SABO Pool Demo Data...'

\echo '1. Loading user profiles and statistics...'
\i users_demo.sql

\echo '2. Loading challenge system...'  
\i challenges_demo.sql

\echo '3. Loading tournament management...'
\i tournaments_demo.sql

\echo '4. Loading club operations...'
\i clubs_demo.sql

\echo '5. Loading financial system...'
\i wallet_demo.sql

\echo '6. Loading ranking system...'
\i ranking_demo.sql

\echo 'Demo data loaded successfully!'
\echo 'SABO Pool V12 demo environment ready.'
