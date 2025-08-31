import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define local User interface compatible with shared types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  verified_rank?: string;
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      clearError: () => set({ error: null }),

      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual shared-auth service once imports are resolved
          // Check for existing user in storage
          const currentUser = get().user;
          if (currentUser) {
            set({ user: currentUser, isLoading: false, isAuthenticated: true });
          } else {
            set({ user: null, isLoading: false, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, isLoading: false, isAuthenticated: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual shared-auth service
          // const user = await authService.signIn(email, password);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login for development
          const mockUser: User = {
            id: '1',
            email,
            username: email.split('@')[0],
            avatar_url: 'https://via.placeholder.com/100',
            role: 'user',
            verified_rank: 'K',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set({ user: mockUser, isLoading: false, isAuthenticated: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false, isAuthenticated: false });
          throw error;
        }
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual shared-auth service
          // const user = await authService.signUp(email, password, username);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1200));
          
          // Mock successful signup for development
          const mockUser: User = {
            id: Date.now().toString(),
            email,
            username,
            avatar_url: 'https://via.placeholder.com/100',
            role: 'user',
            verified_rank: 'Unranked',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          set({ user: mockUser, isLoading: false, isAuthenticated: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ error: errorMessage, isLoading: false, isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual shared-auth service
          // await authService.signOut();
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set({ user: null, isLoading: false, isAuthenticated: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Logout failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Replace with actual shared-auth service
          // const updatedUser = await authService.updateProfile(updates);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600));
          
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              ...updates,
              updated_at: new Date().toISOString(),
            };
            set({ user: updatedUser, isLoading: false });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not loading states or errors
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
