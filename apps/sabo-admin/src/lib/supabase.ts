/**
 * ADMIN APP SUPABASE CLIENT
 * Dedicated Supabase client configuration for admin application
 * Ensures proper environment variable loading and error handling
 */

import { createClient } from '@supabase/supabase-js';

// Direct environment variable access for admin app
const ADMIN_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ADMIN_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Enhanced error checking and logging
if (import.meta.env.DEV) {
  console.log('🔧 Admin Supabase Client Configuration:', {
    hasUrl: !!ADMIN_SUPABASE_URL,
    hasAnonKey: !!ADMIN_SUPABASE_ANON_KEY,
    hasServiceKey: !!ADMIN_SUPABASE_SERVICE_KEY,
    url: ADMIN_SUPABASE_URL,
    mode: import.meta.env.MODE
  });
}

// Validate required environment variables
if (!ADMIN_SUPABASE_URL) {
  throw new Error('❌ VITE_SUPABASE_URL is required for admin app');
}

if (!ADMIN_SUPABASE_ANON_KEY) {
  throw new Error('❌ VITE_SUPABASE_ANON_KEY is required for admin app');
}

// Create admin Supabase client with unique storage key
export const adminSupabase = createClient(
  ADMIN_SUPABASE_URL,
  ADMIN_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      storageKey: 'sb-admin-auth-token', // Unique storage key for admin
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Create service client for admin operations (if service key available)
export const adminSupabaseService = ADMIN_SUPABASE_SERVICE_KEY 
  ? createClient(
      ADMIN_SUPABASE_URL,
      ADMIN_SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          storageKey: 'sb-admin-service-token', // Unique service storage key
        },
      }
    )
  : null;

// Health check function
export const checkAdminSupabaseHealth = async () => {
  try {
    const { error } = await adminSupabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    return { success: true, message: 'Admin Supabase connection healthy' };
  } catch (error) {
    console.error('❌ Admin Supabase health check failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Log successful initialization
console.log('✅ Admin Supabase client initialized successfully');
