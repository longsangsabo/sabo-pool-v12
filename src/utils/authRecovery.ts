import { supabase } from '@/integrations/supabase/client';

/**
 * Emergency auth state recovery utility
 * Cleans up corrupted auth state and provides fallback authentication
 */
export const emergencyAuthRecovery = () => {
  console.log('🚨 Emergency auth recovery initiated...');

  // COMPLETELY SKIP RECOVERY ON TOURNAMENT PAGES
  if (window.location.pathname.includes('/tournament') || 
      window.location.pathname.includes('/club-management') ||
      window.location.pathname === '/tournaments') {
    console.log('🚫 Skipping auth recovery on tournament/club pages to preserve user experience');
    return;
  }

  try {
    // Clear all auth-related storage
    const authKeys = Object.keys(localStorage).filter(
      key =>
        key.startsWith('supabase.auth.') ||
        key.includes('sb-') ||
        key.includes('auth')
    );

    authKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log('🧹 Cleared localStorage key:', key);
    });

    // Clear session storage
    sessionStorage.clear();
    console.log('🧹 Cleared sessionStorage');

    // Force sign out on Supabase client
    supabase.auth.signOut({ scope: 'global' }).catch(error => {
      console.warn('⚠️ Emergency signout failed (continuing anyway):', error);
    });

    console.log('✅ Emergency auth recovery completed');

    // Previously forced redirect to /auth?recovery=true (gây khó chịu người dùng)
    // Thay bằng emit sự kiện để UI có thể hiển thị thông báo và mở modal đăng nhập ngay tại trang hiện tại.
    try {
      const recoveryEvent = new CustomEvent('auth-recovery', {
        detail: { ts: Date.now() },
      });
      window.dispatchEvent(recoveryEvent);
      console.log('📣 Dispatched auth-recovery event (no hard redirect)');
    } catch (evtErr) {
      console.warn('Event dispatch failed, but AVOIDING forced reload to preserve user experience');
      // REMOVED: setTimeout(() => window.location.reload(), 800);
      // Instead, just log and let user continue their activity
    }
  } catch (error) {
    console.error('❌ Emergency auth recovery failed:', error);
    // ONLY force reload for critical app-breaking errors, not auth issues
    if (error.message && error.message.includes('critical')) {
      window.location.reload();
    }
  }
};

/**
 * Detect authentication conflicts and corruption
 */
export const detectAuthConflicts = () => {
  const conflicts = [];

  try {
    // Check for multiple auth tokens
    const authKeys = Object.keys(localStorage).filter(
      key => key.startsWith('supabase.auth.') || key.includes('sb-')
    );

    if (authKeys.length > 2) {
      conflicts.push(`Multiple auth keys: ${authKeys.length}`);
    }

    // Check for expired tokens
    authKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value && value.includes('expires_at')) {
          const parsed = JSON.parse(value);
          if (parsed.expires_at && parsed.expires_at < Date.now() / 1000) {
            conflicts.push(`Expired token: ${key}`);
          }
        }
      } catch (parseError) {
        conflicts.push(`Invalid token format: ${key}`);
      }
    });

    // Check for session/localStorage mismatch
    const sessionCount = Object.keys(sessionStorage).length;
    const localAuthCount = authKeys.length;

    if (sessionCount > 0 && localAuthCount === 0) {
      conflicts.push('Session/localStorage mismatch');
    }
  } catch (error) {
    conflicts.push(`Conflict detection error: ${error.message}`);
  }

  return conflicts;
};

/**
 * Monitor and auto-recover from auth issues
 */
export const setupAuthMonitoring = () => {
  // COMPLETELY DISABLE AUTH MONITORING ON TOURNAMENT PAGES
  if (window.location.pathname.includes('/tournament') || 
      window.location.pathname.includes('/club-management') ||
      window.location.pathname === '/tournaments') {
    console.log('🚫 Auth monitoring disabled on tournament/club pages');
    return;
  }

  // Check for conflicts on page load
  const initialConflicts = detectAuthConflicts();
  if (initialConflicts.length > 0) {
    console.warn('🔍 Auth conflicts detected on load:', initialConflicts);

    // Auto-recovery for severe conflicts - BUT NOT ON TOURNAMENT PAGES
    if (initialConflicts.length > 3) {
      console.log('🔧 Auto-triggering emergency recovery...');
      emergencyAuthRecovery();
    }
  }

  // Monitor for auth errors in console - BUT AVOID RECOVERY DURING ACTIVE OPERATIONS
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ').toLowerCase();

    // TEMPORARY DEBUG: Log what's happening when user switches tabs
    console.log('👁️ Auth monitoring intercepted console.error:', message);
    
    // SKIP ALL AUTH ERROR HANDLING ON TOURNAMENT PAGES
    const isTournamentPage = 
      window.location.pathname.includes('/tournament') || 
      window.location.pathname.includes('/club-management') ||
      window.location.pathname === '/tournaments';

    if (isTournamentPage) {
      console.log('🚫 Skipping auth error handling on tournament page');
      originalError.apply(console, args);
      return;
    }

    // Detect auth-related errors - BUT ONLY TRIGGER RECOVERY FOR CRITICAL ISSUES
    if (
      message.includes('auth') &&
      (message.includes('invalid') ||
        message.includes('expired') ||
        message.includes('unauthorized'))
    ) {
      // Check if user is actively doing something - AVOID RECOVERY DURING SCORE SUBMISSION
      const isActiveOperation = 
        document.querySelector('[data-submitting="true"]') || // Score submission
        document.querySelector('.animate-spin') || // Loading states
        window.location.pathname.includes('/tournaments/') || // Tournament pages
        window.location.pathname.includes('/tournament') || // Any tournament page
        message.includes('supabase') === false; // Non-Supabase auth errors

      console.log('🔍 Auth error analysis:', {
        message,
        isActiveOperation,
        pathname: window.location.pathname,
        hasSubmitting: !!document.querySelector('[data-submitting="true"]'),
        hasSpinner: !!document.querySelector('.animate-spin')
      });

      if (!isActiveOperation) {
        console.log('🚨 Critical auth error detected, initiating recovery...');
        setTimeout(() => emergencyAuthRecovery(), 1000);
      } else {
        console.log('⏸️ Auth error detected but user is active, skipping recovery');
      }
    }

    originalError.apply(console, args);
  };

  console.log('🔧 Auth monitoring activated');
};
