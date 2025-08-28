import { createClient } from '@supabase/supabase-js';
import type { User, UserRole } from './types';

// Direct environment access for Vite - SIMPLIFIED FIX
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Enhanced debugging for development
if (import.meta.env.DEV) {
  console.log('🔧 Auth Service Environment Check:', {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey, 
    serviceKey: !!supabaseServiceKey,
    actualUrl: supabaseUrl,
    mode: import.meta.env.MODE
  });
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase environment variables not configured - auth service may not work properly');
  console.warn('🐛 DEBUG: URL =', supabaseUrl, '| KEY =', !!supabaseKey);
}

// Create main client for auth (using anon key)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create admin client for admin operations (using service role key if available)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

/**
 * Centralized Authentication Service
 * Handles all auth operations for both user and admin apps
 */
export class AuthService {
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign in');

    return await this.getCurrentUser();
  }

  async signUp(email: string, password: string, username?: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign up');

    return await this.getCurrentUser();
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) throw new Error('No authenticated user');

    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const newProfile = {
          id: user.id,
          email: user.email!,
          role: 'user' as UserRole,
          username: user.user_metadata?.username || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: user.created_at,
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        return createdProfile;
      }
      throw profileError;
    }

    return profile;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data.role;
  }

  isAdmin(user: User | null): boolean {
    return user?.role === 'admin' || user?.role === 'super_admin';
  }

  isSuperAdmin(user: User | null): boolean {
    return user?.role === 'super_admin';
  }

  requireAdminAccess(user: User | null): void {
    if (!this.isAdmin(user)) {
      throw new Error('Admin access required');
    }
  }

  requireSuperAdminAccess(user: User | null): void {
    if (!this.isSuperAdmin(user)) {
      throw new Error('Super admin access required');
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting current user:', error);
          callback(null);
        }
      } else {
        callback(null);
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

  // Role management methods
  hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    // Role checking logic - could be from user metadata or separate profile table
    return this.isAdmin(user) && (role === 'admin' || role === 'super_admin');
  }

  async switchRole(user: User | null, role: UserRole): Promise<void> {
    if (!user) throw new Error('No user provided');
    
    // Update the user's role in the database
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role })
      .eq('user_id', user.id);

    if (error) throw error;
  }
}

// Export singleton instance
export const authService = new AuthService();
