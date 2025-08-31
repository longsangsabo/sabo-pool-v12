-- Remove Legacy Claim Request System (Admin Approval)
-- This removes the admin approval system and keeps only direct code claim

-- Drop functions first (due to dependencies)
DROP FUNCTION IF EXISTS public.review_legacy_spa_claim_request(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.submit_legacy_spa_claim_request(text, text, text);
DROP FUNCTION IF EXISTS public.get_pending_claim_requests();

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Users can insert their own claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Users can update their own claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Admins can view all claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Admins can update claim requests" ON public.legacy_spa_claim_requests;

-- Drop indexes
DROP INDEX IF EXISTS idx_legacy_spa_claim_requests_requester;
DROP INDEX IF EXISTS idx_legacy_spa_claim_requests_legacy;
DROP INDEX IF EXISTS idx_legacy_spa_claim_requests_status;
DROP INDEX IF EXISTS idx_legacy_spa_claim_requests_created;

-- Drop table
DROP TABLE IF EXISTS public.legacy_spa_claim_requests;

-- Add comment
COMMENT ON SCHEMA public IS 'Legacy Claim Request System (Admin Approval) removed. Now using direct code claim system only.';
