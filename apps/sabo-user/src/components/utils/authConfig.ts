/**
 * Authentication Configuration
 * Social login and auth configuration utilities with proper typing
 */

export const authConfig = {
  google: {
    clientId: process.env.VITE_GOOGLE_CLIENT_ID || '' || '',
    redirectUri: `${window.location.origin}/auth/callback/google`
  },
  
  facebook: {
    appId: process.env.VITE_FACEBOOK_APP_ID || '' || '',
    redirectUri: `${window.location.origin}/auth/callback/facebook`
  },
  
  twitter: {
    clientId: process.env.VITE_TWITTER_CLIENT_ID || '' || '',
    redirectUri: `${window.location.origin}/auth/callback/twitter`
  },
  
  github: {
    clientId: process.env.VITE_GITHUB_CLIENT_ID || '' || '',
    redirectUri: `${window.location.origin}/auth/callback/github`
  }
};

export const getAuthProvider = (provider: string) => {
  return authConfig[provider as keyof typeof authConfig];
};

export const isAuthConfigured = (provider: string) => {
  const config = getAuthProvider(provider);
  return config && config.clientId !== '';
};

export const OAUTH_CONFIGS = {
  google: { clientId: process.env.GOOGLE_CLIENT_ID || '' },
  facebook: { appId: process.env.FACEBOOK_APP_ID || '' }
};

import { Provider } from '@supabase/supabase-js';

export interface OAuthConfig {
  provider: Provider;
  options?: {
    redirectTo?: string;
  };
}

export const OAUTH_CONFIGS: Record<string, OAuthConfig> = {
  google: {
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  },
  facebook: {
    provider: 'facebook', 
    options: {
      redirectTo: window.location.origin + '/auth/callback'
    }
  }
};
