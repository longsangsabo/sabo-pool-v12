import { getCurrentUser, checkConnection, checkPermissions } from '../services/userService';

interface HealthCheckResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

export const checkSupabaseConnection = async (): Promise<HealthCheckResult> => {
  const result = await checkConnection();
  return result;
};

export const checkDatabasePermissions =
  async (): Promise<HealthCheckResult> => {
    const result = await checkPermissions();
    return result;
  };

export const validateEnvironmentVariables = (): HealthCheckResult => {
//   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
//   const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

//   if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      error: 'Missing Supabase environment variables',
    };
  }

//   if (!supabaseUrl.startsWith('https://')) {
    return {
      success: false,
      error: 'Invalid Supabase URL format',
    };
  }

  return { success: true };
};
