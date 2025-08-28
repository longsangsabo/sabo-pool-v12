import { logger } from '@/services/loggerService';

/**
 * Shared Auth Module Declaration
 * Type declarations for @sabo/shared-auth package
 */

declare module '@sabo/shared-auth' {
  export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    role?: string;
  }

  export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
  }

  export interface AuthContextType extends AuthState {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, userData?: any) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
  }

  export const useAuth: () => AuthContextType;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const ProtectedRoute: React.FC<{ children: React.ReactNode }>;
}
