-- Clean up script - Run this BEFORE running the main migration
-- This will remove all existing policies and functions

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Users can create their own claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "Users can cancel their own pending requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "SABO admins can view all claim requests" ON public.legacy_spa_claim_requests;
DROP POLICY IF EXISTS "SABO admins can review claim requests" ON public.legacy_spa_claim_requests;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.submit_legacy_spa_claim_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.review_legacy_spa_claim_request(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_pending_claim_requests();

-- Drop existing view
DROP VIEW IF EXISTS public.legacy_claim_requests_view;

-- Drop trigger
DROP TRIGGER IF EXISTS update_legacy_spa_claim_requests_updated_at ON public.legacy_spa_claim_requests;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

SELECT 'Cleanup completed! Now you can run the main migration.' as result;
