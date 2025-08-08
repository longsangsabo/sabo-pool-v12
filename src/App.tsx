import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { CombinedProviders } from '@/contexts/CombinedProviders';
import { AppErrorBoundary } from '@/components/error/AppErrorBoundary';
import { AppLoadingFallback } from '@/components/loading/AppLoadingFallback';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useIsClubOwner } from '@/hooks/club/useClubRole';
import { useAuth } from '@/hooks/useAuth';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import MainLayout from '@/components/MainLayout';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

// ✅ Import debug utilities for tournament refresh
import '@/utils/debugTournamentRefresh';

// Lazy load components - Public pages
const HomePage = lazy(() => import('@/pages/Home'));
// Use enhanced login page with role-based redirect logic
const EnhancedLoginPage = lazy(() => import('@/pages/EnhancedLoginPage'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/SimpleClubContactPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsOfServicePage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));
const NewsPage = lazy(() => import('@/pages/BlogPage'));

// Public pages that should also be accessible to logged-in users
const ClubsPage = lazy(() => import('@/pages/ClubsPage'));
const RankTestPage = lazy(() => import('@/pages/RankTestPage'));
const SABOStyleTestPage = lazy(() => import('@/pages/SABOStyleTestPage'));
const ClubDetailPage = lazy(() => import('@/pages/ClubDetailPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const TournamentPage = lazy(() => import('@/pages/TournamentsPage'));

// Protected pages - User dashboard and features
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const EnhancedChallengesPageV2 = lazy(
  () => import('@/pages/EnhancedChallengesPageV2')
);
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const SettingsPage = lazy(() => import('@/pages/EnhancedSettingsPage'));
const WalletPage = lazy(() => import('@/pages/PaymentPage'));
const ClubRegistrationPage = lazy(() => import('@/pages/ClubRegistrationPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const MarketplacePage = lazy(() => import('@/pages/EnhancedMarketplacePage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));

// Demo pages
// const DemoPlayerPage = lazy(() => import('@/pages/DemoPlayerPage'));
// const DemoPage = lazy(() => import('@/pages/DemoPage'));
const TestAvatarPage = lazy(() => import('@/pages/test-avatar'));

// Admin components
const AdminRouter = lazy(() => import('@/router/AdminRouter'));

// Club components
const ClubManagementPage = lazy(() => import('@/pages/ClubManagementPage'));
const ClubOwnerDashboardPage = lazy(() => import('@/pages/ClubOwnerDashboardPage'));

// Auth pages
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const AuthTestPage = lazy(() => import('@/pages/AuthTestPage'));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword'));

// Create a stable query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Component để sử dụng hooks bên trong providers
const AppContent = () => {
  // ✅ Initialize realtime notifications (now inside AuthProvider)
  const { PopupComponent } = useRealtimeNotifications();

  // Inline component to protect club management routes by owner role
  const ClubOwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { data: isOwner, isLoading } = useIsClubOwner(user?.id, !!user?.id);
    if (isLoading) return <div className='p-8 text-center'>Đang kiểm tra quyền...</div>;
    if (!isOwner) return <div className='p-8 text-center text-red-500'>Bạn không có quyền truy cập khu vực quản lý CLB.</div>;
    return <>{children}</>;
  };

  return (
    <div className='min-h-screen bg-background'>
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path='/' element={<HomePage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/privacy' element={<PrivacyPolicyPage />} />
          <Route path='/terms' element={<TermsOfServicePage />} />
          <Route path='/news' element={<NewsPage />} />
          
          {/* Demo pages */}
          {/* <Route path='/demo' element={<RainbowAvatarDemo />} /> */}
          <Route path='/test-avatar' element={<TestAvatarPage />} />
          <Route path='/test-rank' element={<RankTestPage />} />
          <Route path='/test-sabo-style' element={<SABOStyleTestPage />} />

          {/* Auth routes - only accessible when NOT logged in */}
          <Route
            path='/auth'
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path='/auth/login'
            element={
              <PublicRoute>
                <EnhancedLoginPage />
              </PublicRoute>
            }
          />
          <Route
            path='/auth/register'
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path='/auth/forgot-password'
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route path='/auth/callback' element={<AuthCallbackPage />} />

          {/* Protected routes with MainLayout - layout route without path to avoid overriding public home */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='profile' element={<Profile />} />
            <Route path='challenges' element={<EnhancedChallengesPageV2 />} />
            <Route path='community' element={<CommunityPage />} />
            <Route path='calendar' element={<CalendarPage />} />
            <Route path='settings' element={<SettingsPage />} />
            <Route path='wallet' element={<WalletPage />} />
            <Route
              path='club-registration'
              element={<ClubRegistrationPage />}
            />
            <Route path='feed' element={<FeedPage />} />
            <Route path='marketplace' element={<MarketplacePage />} />
            <Route path='notifications' element={<NotificationsPage />} />
            <Route path='auth-test' element={<AuthTestPage />} />

            {/* Public pages accessible through sidebar when logged in */}
            <Route path='tournaments' element={<TournamentPage />} />
            <Route path='leaderboard' element={<LeaderboardPage />} />
            <Route path='clubs' element={<ClubsPage />} />
            <Route path='clubs/:id' element={<ClubDetailPage />} />
            <Route path='clubs/:id/owner' element={<ClubOwnerDashboardPage />} />
          </Route>

          {/* Admin routes - use wildcard to let AdminRouter handle sub-routes */}
          <Route
            path='/admin/*'
            element={
              <AdminRoute>
                <AdminRouter />
              </AdminRoute>
            }
          />

          {/* Club management routes - protected and require club owner privileges */}
          <Route
            path='/club-management/*'
            element={
              <ProtectedRoute>
                <ClubOwnerRoute>
                  <ClubManagementPage />
                </ClubOwnerRoute>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      {/* ✅ Render notification popup */}
      <PopupComponent />
    </div>
  );
};

const App = () => {
  // ✅ Make query client available globally for debugging
  React.useEffect(() => {
    (window as any).queryClient = queryClient;
  }, []);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Router>
            <CombinedProviders>
              <AppContent />
            </CombinedProviders>
            <Toaster />
          </Router>
        </HelmetProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
