/**
 * SABO Pool Arena - Simplified Authentication Service
 * Quick fix for mobile deployment readiness
 */

import { SupabaseClient, Session } from '@supabase/supabase-js';
import { AuthError } from './AuthError';
import { User, AuthResponse } from './auth-types';

export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        data: {
          user: data.user as User,
          session: data.session || undefined,
        },
      };
    } catch (error: any) {
      return {
        error: new AuthError(error.message || 'Sign in failed', 'SIGN_IN_ERROR'),
      };
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return {
        data: {
          user: data.user as User,
          session: data.session || undefined,
        },
      };
    } catch (error: any) {
      return {
        error: new AuthError(error.message || 'Sign up failed', 'SIGN_UP_ERROR'),
      };
    }
  }

  async signOut(): Promise<{ error?: AuthError }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (error: any) {
      return {
        error: new AuthError(error.message || 'Sign out failed', 'SIGN_OUT_ERROR'),
      };
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user as User;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
