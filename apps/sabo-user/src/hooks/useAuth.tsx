import {
 createContext,
 useContext,
 useState,
 useEffect,
 useCallback,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setupAuthMonitoring } from '@/utils/authRecovery';
import { milestoneService } from '@/services/milestoneService';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { formatPhoneToE164 } from '@sabo/shared-utils';
import { AUTH_REDIRECTS, getAuthRedirectUrl } from '@/utils/authConfig';

interface AuthError extends Error {
 code?: string;
 details?: string;
 hint?: string;
 status?: number;
}

interface AuthState {
 user: User | null;
 loading: boolean;
 isAuthenticated: boolean;
 profile: any;
 session: Session | null;
 error: string | undefined;
 isInitialized: boolean;
 lastLoginMethod: string | undefined;
 retryCount: number;
}

interface AuthContextType extends AuthState {
 signOut: () => Promise<void>;
 signIn: (
  email: string,
  password: string
 ) => Promise<{ data?: any; error?: any }>;
 signUp: (
  email: string,
  password: string,
  metadata?: any
 ) => Promise<{ data?: any; error?: any }>;
 signInWithGoogle: () => Promise<{ data?: any; error?: any }>;
 signInWithFacebook: () => Promise<{ data?: any; error?: any }>;
 // Phone auth (OTP)
 signInWithPhone: (
  phone: string,
  password?: string
 ) => Promise<{ data?: any; error?: any }>;
 signInWithPhonePassword: (
  phone: string,
  password: string
 ) => Promise<{ data?: any; error?: any }>;
 signUpWithPhone: (
  phone: string,
  password?: string,
  fullName?: string,
  referralCode?: string
 ) => Promise<{ data?: any; error?: any }>;
 requestPhoneOtp: (phone: string) => Promise<{ data?: any; error?: any }>;
 verifyPhoneOtp: (
  phone: string,
  token: string
 ) => Promise<{ data?: any; error?: any }>;
 // Email aliases
 signInWithEmail: (
  email: string,
  password: string
 ) => Promise<{ data?: any; error?: any }>;
 signUpWithEmail: (
  email: string,
  password: string,
  fullName?: string,
  referralCode?: string
 ) => Promise<{ data?: any; error?: any }>;
 // Enhanced methods
 clearError: () => void;
 refreshSession: () => Promise<void>;
 resetPassword: (email: string) => Promise<{ error?: any }>;
 updatePassword: (password: string) => Promise<{ error?: any }>;
 retryLastAction: () => Promise<void>;
 handleAuthError: (error: any, context?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
 children,
}) => {
 const [authState, setAuthState] = useState<AuthState>({
  user: null,
  loading: true,
  isAuthenticated: false,
  profile: null,
  session: null,
  error: null,
  isInitialized: false,
  lastLoginMethod: null,
  retryCount: 0,
 });

 const [lastAction, setLastAction] = useState<(() => Promise<void>) | null>(
  null
 );

 // Enhanced error handling
 const handleAuthError = useCallback(
  (error: any, context = 'Authentication'): string => {
   console.error(`🔧 Auth Error [${context}]:`, error);

   if (!error) return 'Lỗi không xác định';

   // Network errors
   if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
   }

   // Supabase specific errors
   if (error.message) {
    const message = error.message.toLowerCase();

    if (message.includes('email not confirmed')) {
     return 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.';
    }
    if (message.includes('invalid login credentials')) {
     return 'Email hoặc mật khẩu không đúng.';
    }
    if (message.includes('too many requests')) {
     return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
    }
    if (message.includes('signup disabled')) {
     return 'Đăng ký tài khoản hiện tại đang tạm khóa.';
    }
    if (message.includes('phone number')) {
     return 'Số điện thoại không hợp lệ hoặc đã được sử dụng.';
    }
    if (message.includes('session not found')) {
     return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    if (message.includes('weak password')) {
     return 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.';
    }
   }

   // HTTP status codes
   if (error.status) {
    switch (error.status) {
     case 400:
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
     case 401:
      return 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
     case 403:
      return 'Tài khoản bị khóa hoặc không có quyền.';
     case 404:
      return 'Không tìm thấy tài khoản.';
     case 429:
      return 'Quá nhiều lần thử. Vui lòng thử lại sau.';
     case 500:
      return 'Lỗi hệ thống. Vui lòng thử lại sau.';
    }
   }

   return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  },
  []
 );

 const clearError = useCallback(() => {
  setAuthState(prev => ({ ...prev, error: null }));
 }, []);

 const setError = useCallback((error: string) => {
  setAuthState(prev => ({ ...prev, error }));
 }, []);

 const incrementRetryCount = useCallback(() => {
  setAuthState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
 }, []);

 const resetRetryCount = useCallback(() => {
  setAuthState(prev => ({ ...prev, retryCount: 0 }));
 }, []);

 // Setup auth monitoring on mount
 useEffect(() => {
  setupAuthMonitoring();
  const handler = () => {
   toast.warning(
    'Phiên đăng nhập gặp lỗi – đã làm sạch và cần đăng nhập lại.',
    {
     description:
      'Vui lòng đăng nhập lại. Trang không bị chuyển hướng để tránh mất ngữ cảnh.',
    }
   );
  };
  const signedOutHandler = () => {
   toast.success('Đã đăng xuất. Bạn có thể đăng nhập lại bất cứ lúc nào.');
  };
  const signedInHandler = (e: any) => {
   toast.success('Đăng nhập thành công');
  };
  window.addEventListener('auth-recovery', handler as any);
  window.addEventListener('auth-signed-out', signedOutHandler as any);
  window.addEventListener('auth-signed-in', signedInHandler as any);
  return () => {
   window.removeEventListener('auth-recovery', handler as any);
   window.removeEventListener('auth-signed-out', signedOutHandler as any);
   window.removeEventListener('auth-signed-in', signedInHandler as any);
  };
 }, []);

 useEffect(() => {
  let isMounted = true;
  console.log('🔧 Auth: Initializing authentication system...');

  // Set up auth state listener FIRST
  const {
   data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
   if (!isMounted) return;

   console.log(
    '🔧 Auth: State change event:',
    event,
    session?.user?.id || 'no user'
   );

   // Handle authentication state changes
   const newState = {
    user: session?.user || null,
    loading: false,
    isAuthenticated: !!session?.user,
    profile: null,
    session,
    error: null,
    isInitialized: true,
    lastLoginMethod: session?.user?.app_metadata?.provider || null,
    retryCount: 0,
   };

   setAuthState(newState);

   // Handle specific events
   if (event === 'SIGNED_OUT') {
    console.log('🔧 Auth: User signed out, clearing state');
    // Clear any remaining auth data on sign out
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
   } else if (event === 'SIGNED_IN' && session?.user) {
    console.log('🔧 Auth: User signed in:', session.user.id);
    
    // Auto-grant admin role to admin emails
    const adminEmails = [
     'longsangsabo@gmail.com',
     'sabomedia30@gmail.com', 
     'sabomedia23@gmail.com'
    ];
    
    if (adminEmails.includes(session.user.email || '')) {
     console.log(`👑 Auto-granting admin role to ${session.user.email}`);
     
     // Update profile role to admin (if table allows)
     supabase
      .from('profiles')
      .update({ 
       role: 'admin',
       updated_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id)
      .then(({ error }) => {
       if (error && !error.message.includes('check constraint')) {
        console.error('❌ Failed to grant admin role in profiles:', error);
       } else if (!error) {
        console.log('✅ Admin role granted in profiles table');
       } else {
        console.log('⚠️ Profile admin role blocked by constraint, using user_roles instead');
       }
      });
      
     // Add to user_roles table (primary admin system)
     supabase
      .from('user_roles')
      .upsert({
       user_id: session.user.id,
       role: 'admin',
       created_at: new Date().toISOString()
      })
      .then(({ error }) => {
       if (error && !error.message.includes('does not exist')) {
        console.error('❌ Failed to add admin role to user_roles:', error);
       } else if (!error) {
        console.log('✅ Admin role added to user_roles table');
       }
      });
    }
    
    // Trigger milestone for new account creation
    if (session.user) {
     // TEMPORARY DISABLE: Skip milestone initialization to prevent infinite loop
     // TODO: Fix RLS policies for player_milestones table first
     console.log('🏆 [DISABLED] Milestone initialization temporarily disabled');
     
     // Check if this is a new user by checking if they have any milestone progress
     /* DISABLED TO PREVENT INFINITE LOOP
     milestoneService.getPlayerMilestoneProgress(session.user.id)
      .then(progress => {
       // If no milestone progress exists, this is likely a new account
       if (progress.length === 0) {
        console.log('🏆 Triggering account_creation milestone for new user');
        // Initialize milestones first
        return milestoneService.initializePlayerMilestones(session.user.id)
         .then(() => milestoneService.checkAndAwardMilestone(
          session.user.id, 
          'account_creation', 
          1
         ));
       }
      })
      .catch(error => {
       console.error('🔧 Error handling milestone for new user:', error);
      });
     */
    }
   } else if (event === 'TOKEN_REFRESHED') {
    console.log('🔧 Auth: Token refreshed for user:', session?.user?.id);
   }
  });

  // THEN check for existing session
  supabase.auth
   .getSession()
   .then(({ data: { session }, error }) => {
    if (!isMounted) return;

    if (error) {
     console.error('🔧 Auth: Error getting session:', error);
     // Clear corrupted session data
     localStorage.removeItem('supabase.auth.token');
     sessionStorage.clear();
     setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false,
      profile: null,
      session: null,
      error: null,
      isInitialized: true,
      lastLoginMethod: null,
      retryCount: 0,
     });
     return;
    }

    console.log(
     '🔧 Auth: Initial session check:',
     session?.user?.id || 'no user'
    );
    setAuthState({
     user: session?.user || null,
     loading: false,
     isAuthenticated: !!session?.user,
     profile: null,
     session,
     error: null,
     isInitialized: true,
     lastLoginMethod: session?.user?.app_metadata?.provider || null,
     retryCount: 0,
    });
   })
   .catch(error => {
    console.error('🔧 Auth: Session check failed:', error);
    if (isMounted) {
     setAuthState({
      user: null,
      loading: false,
      isAuthenticated: false,
      profile: null,
      session: null,
      error: 'Session check failed',
      isInitialized: true,
      lastLoginMethod: null,
      retryCount: 0,
     });
    }
   });

  return () => {
   isMounted = false;
   subscription.unsubscribe();
  };
 }, []);

 // Proactive token refresh to avoid sudden expiry redirects
 useTokenRefresh(authState.session);

 const signOut = async (): Promise<void> => {
  try {
   console.log('🔧 Auth: Starting sign out process...');

   // Clear local state first to prevent UI flickering
   setAuthState({
    user: null,
    loading: false,
    isAuthenticated: false,
    profile: null,
    session: null,
    error: null,
    isInitialized: true,
    lastLoginMethod: null,
    retryCount: 0,
   });

   // Clear any auth-related storage
   localStorage.removeItem('supabase.auth.token');
   sessionStorage.clear();

   // Perform Supabase sign out
   await supabase.auth.signOut({ scope: 'global' });

   console.log('🔧 Auth: Sign out completed successfully');

   // Redirect to public landing page
   window.location.href = '/';
  } catch (error) {
   console.error('🔧 Auth: Sign out error:', error);

   // Even if sign out fails, clear local state and redirect
   setAuthState({
    user: null,
    loading: false,
    isAuthenticated: false,
    profile: null,
    session: null,
    error: null,
    isInitialized: true,
    lastLoginMethod: null,
    retryCount: 0,
   });

   // Clear storage anyway
   localStorage.removeItem('supabase.auth.token');
   sessionStorage.clear();

   // Force redirect to landing even on error
   window.location.href = '/';
  }
 };

 const signIn = async (email: string, password: string) => {
  try {
   const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
   });
   return { data, error };
  } catch (error) {
   return { error };
  }
 };

 const signUp = async (email: string, password: string, metadata?: any) => {
  try {
   const { AUTH_REDIRECTS } = await import('@/utils/authConfig');
   const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
     emailRedirectTo: AUTH_REDIRECTS.emailSignup,
     data: metadata,
    },
   });
   return { data, error };
  } catch (error) {
   return { error };
  }
 };

 const signInWithGoogle = async () => {
  try {
   const { OAUTH_CONFIGS } = await import('@/utils/authConfig');
   const { data, error } = await supabase.auth.signInWithOAuth(
    OAUTH_CONFIGS.google
   );
   return { data, error };
  } catch (error) {
   return { error };
  }
 };

 const signInWithFacebook = async () => {
  try {
   const { OAUTH_CONFIGS } = await import('@/utils/authConfig');
   const { data, error } = await supabase.auth.signInWithOAuth(
    OAUTH_CONFIGS.facebook
   );
   return { data, error };
  } catch (error) {
   return { error };
  }
 };

 // Phone OTP helpers
 const requestPhoneOtp = async (phone: string) => {
  try {
   const e164 = formatPhoneToE164(phone);
   const { data, error } = await supabase.auth.signInWithOtp({
    phone: e164,
    options: { channel: 'sms' },
   });
   return { data, error };
  } catch (error) {
   return { error } as any;
  }
 };

 const verifyPhoneOtp = async (phone: string, token: string) => {
  try {
   const e164 = formatPhoneToE164(phone);
   const { data, error } = await supabase.auth.verifyOtp({
    phone: e164,
    token,
    type: 'sms',
   });
   return { data, error };
  } catch (error) {
   return { error } as any;
  }
 };

 // Phone login with password (no OTP required)
 const signInWithPhonePassword = async (phone: string, password: string) => {
  try {
   const e164 = formatPhoneToE164(phone);
   console.log('🔐 Attempting phone login with password:', e164);
   
   const { data, error } = await supabase.auth.signInWithPassword({
    phone: e164,
    password,
   });
   
   if (error) {
    console.error('❌ Phone password login failed:', error.message);
    
    // Check if error is due to missing password for OTP-created account
    if (error.message.includes('Invalid login credentials')) {
     console.log('💡 This might be an OTP-created account without password');
     console.log('🔄 Falling back to OTP login flow...');
     
     // Return a special error indicating fallback needed
     return { 
      data: null, 
      error: { 
       ...error,
       fallbackToOtp: true,
       message: 'Tài khoản này được tạo bằng OTP. Vui lòng sử dụng OTP để đăng nhập hoặc đặt lại mật khẩu.'
      }
     };
    }
   }
   
   console.log('✅ Phone password login successful');
   return { data, error };
  } catch (error) {
   console.error('❌ Phone password login exception:', error);
   return { error } as any;
  }
 };

 // Backward-compatible aliases
 const signInWithPhone = async (phone: string, password?: string) => {
  // If password is provided, try password-based login first
  if (password) {
   console.log('📱 Attempting phone login with password...');
   const result = await signInWithPhonePassword(phone, password);
   
   // If password login fails with fallback indicator, continue to OTP
   if (result.error && (result.error as any).fallbackToOtp) {
    console.log('🔄 Password login failed, falling back to OTP...');
    // Don't return the error, continue to OTP flow
    return requestPhoneOtp(phone);
   }
   
   // Return result (success or non-fallback error)
   return result;
  }
  
  // Otherwise, use OTP-based login
  console.log('📱 Using OTP login flow...');
  return requestPhoneOtp(phone);
 };
 const signInWithEmail = signIn;

 const signUpWithPhone = async (
  phone: string,
  _password?: string,
  _fullName?: string,
  _referralCode?: string
 ) => {
  // We use OTP for phone sign-up; metadata can be handled post-verification
  return requestPhoneOtp(phone);
 };

 const signUpWithEmail = async (
  email: string,
  password: string,
  fullName?: string,
  referralCode?: string
 ) => {
  return signUp(email, password, {
   full_name: fullName,
   referral_code: referralCode,
  });
 };

 // Enhanced methods
 const refreshSession = useCallback(async () => {
  try {
   const { data, error } = await supabase.auth.refreshSession();
   if (error) {
    throw error;
   }
   console.log('🔧 Auth: Session refreshed successfully');
  } catch (error) {
   console.error('🔧 Auth: Session refresh failed:', error);
   const errorMessage = handleAuthError(error, 'Session Refresh');
   setError(errorMessage);
   throw error;
  }
 }, [handleAuthError, setError]);

 const resetPassword = useCallback(
  async (email: string) => {
   try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: getAuthRedirectUrl('passwordReset'),
    });
    if (error) throw error;
    return { error: null };
   } catch (error) {
    const errorMessage = handleAuthError(error, 'Password Reset');
    return { error: errorMessage };
   }
  },
  [handleAuthError]
 );

 const updatePassword = useCallback(
  async (password: string) => {
   try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { error: null };
   } catch (error) {
    const errorMessage = handleAuthError(error, 'Password Update');
    return { error: errorMessage };
   }
  },
  [handleAuthError]
 );

 const retryLastAction = useCallback(async () => {
  if (lastAction && authState.retryCount < 3) {
   incrementRetryCount();
   try {
    await lastAction();
    resetRetryCount();
   } catch (error) {
    const errorMessage = handleAuthError(error, 'Retry Action');
    setError(errorMessage);
   }
  }
 }, [
  lastAction,
  authState.retryCount,
  incrementRetryCount,
  resetRetryCount,
  handleAuthError,
  setError,
 ]);

 const value: AuthContextType = {
  ...authState,
  signOut,
  signIn,
  signUp,
  signInWithGoogle,
  signInWithFacebook,
  signInWithPhone,
  signInWithPhonePassword,
  signInWithEmail,
  signUpWithPhone,
  signUpWithEmail,
  requestPhoneOtp,
  verifyPhoneOtp,
  clearError,
  refreshSession,
  resetPassword,
  updatePassword,
  retryLastAction,
  handleAuthError,
 };

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (!context) {
  throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};
