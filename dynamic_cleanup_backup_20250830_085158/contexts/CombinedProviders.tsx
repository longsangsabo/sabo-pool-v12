import { memo } from 'react';
import { UserDataProvider } from './UserDataContext';
import { LanguageProvider } from './LanguageContext';
import { ResponsiveLayoutProvider } from './ResponsiveLayoutContext';
import { AppProviders } from './AppProviders';
import { AvatarProvider } from './AvatarContext';

import { AuthErrorBoundary } from '@/components/error/AuthErrorBoundary';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface CombinedProvidersProps {
  children: React.ReactNode;
}

const CombinedProvidersComponent: React.FC<CombinedProvidersProps> = ({
  children,
}) => {
  // Register service worker (safe client-side only)
  try {
    useServiceWorker();
  } catch (e) {
    // Ignore during SSR / tests
  }
  return (
    <AuthErrorBoundary>
      <ThemeProvider defaultTheme='dark' storageKey='sabo-ui-theme'>
        <AuthProvider>
          <AvatarProvider>
            <LanguageProvider>
              <ResponsiveLayoutProvider>
                <UserDataProvider>
                  <AppProviders>{children}</AppProviders>
                </UserDataProvider>
              </ResponsiveLayoutProvider>
            </LanguageProvider>
          </AvatarProvider>
        </AuthProvider>
      </ThemeProvider>
    </AuthErrorBoundary>
  );
};

export const CombinedProviders = memo(CombinedProvidersComponent);
