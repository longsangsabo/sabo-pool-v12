/**
 * SERVICE SUPABASE CLIENT FOR ADMIN OPERATIONS
 * Uses service role key to bypass RLS for bracket generation and admin operations
 */

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseServiceKey) {
  console.warn('⚠️ VITE_SUPABASE_SERVICE_ROLE_KEY not found. Service operations may fail.');
}

// Service client bypasses RLS - use carefully!
// Only create service client if we have the service key
// export const supabaseService = supabaseServiceKey 
//   ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Regular client for normal operations
// export { supabase } from '@/integrations/supabase/client';
