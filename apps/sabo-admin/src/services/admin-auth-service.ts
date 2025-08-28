import { createClient } from '@supabase/supabase-js';
import type { User } from '@sabo/shared-auth';

// Admin-specific Supabase client with service role key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create two clients: one for auth, one for admin operations
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

export class AdminAuthService {
  // Use regular auth for login
  async signIn(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign in');

    return await this.getCurrentUser();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
      
      if (authError || !authUser) {
        return null;
      }

      // Get user profile using admin client for enhanced permissions
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError);
        // Fallback to basic user info
        return {
          id: authUser.id,
          email: authUser.email || '',
          username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || '',
          role: 'user' as const,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        username: profile.username || profile.display_name || profile.email?.split('@')[0] || '',
        role: profile.role || 'user',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    await supabaseAuth.auth.signOut();
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabaseAuth.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        callback(null);
      } else {
        const user = await this.getCurrentUser();
        callback(user);
      }
    });
  }

  // Admin-specific methods using service role
  async getAllUsers() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateUserRole(userId: string, role: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStats() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const stats = {
      total: data.length,
      admins: data.filter(u => u.role === 'admin').length,
      users: data.filter(u => u.role === 'user').length,
      recent: data.filter(u => {
        const created = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length
    };

    return stats;
  }
}

export const adminAuthService = new AdminAuthService();
