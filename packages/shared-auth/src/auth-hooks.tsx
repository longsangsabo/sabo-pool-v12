import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from './auth-service';
import type { User, UserRole, AuthContext, AdminAuthContext } from './types';

// Initialize auth service instance
const authService = new AuthService();

// Create auth context
const AuthContextInstance = createContext<AuthContext | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Main Auth Provider
 * Provides authentication state and methods to the entire app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.log('No authenticated user found');
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signIn(email, password);
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signUp(email, password, username);
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile(updates);
      setUser(updatedUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const value: AuthContext = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContextInstance.Provider value={value}>
      {children}
    </AuthContextInstance.Provider>
  );
}

export function useAuth(): AuthContext {
  const context = useContext(AuthContextInstance);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAdminAuth(): AdminAuthContext {
  const auth = useAuth();
  
  const isAdmin = authService.isAdmin(auth.user);
  const isSuperAdmin = authService.isSuperAdmin(auth.user);
  
  const hasRole = (role: UserRole) => {
    return authService.hasRole(auth.user, role);
  };
  
  const switchRole = async (role: UserRole) => {
    // Implement role switching logic
    return authService.switchRole(auth.user, role);
  };
  
  const checkAdminAccess = () => isAdmin;
  
  const requireAdminAccess = () => {
    authService.requireAdminAccess(auth.user);
  };

  return {
    ...auth,
    isAdmin,
    isSuperAdmin,
    hasRole,
    switchRole,
    checkAdminAccess,
    requireAdminAccess,
  };
}
