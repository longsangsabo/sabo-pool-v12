/**
 * Auth package types - will be updated to use shared-types once integrated
 */

export type UserRole = 'user' | 'admin' | 'super_admin' | 'club_owner' | 'moderator';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContext {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface AdminAuthContext extends AuthContext {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
  switchRole: (role: UserRole) => Promise<void>;
  checkAdminAccess: () => boolean;
  requireAdminAccess: () => void;
}
