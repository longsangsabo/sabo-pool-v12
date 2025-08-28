import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { CombinedProviders } from '@/contexts/CombinedProviders';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppErrorBoundary } from '@/components/error/AppErrorBoundary';
import { AppLoadingFallback } from '@/components/loading/AppLoadingFallback';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useIsClubOwner } from '@/hooks/club/useClubRole';
import { useAuth } from '@/hooks/useAuth';
import { PublicRoute } from '@/components/auth/PublicRoute';
// AdminRoute removed - admin functionality moved to separate app
import MainLayout from '@/components/MainLayout';
import { useUnifiedMessages } from '@/hooks/useUnifiedMessages';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ReAuthModal } from '@/components/auth/ReAuthModal';

// Import CSS optimizations and theme styles
import './styles/avatar-optimizations.css';
import './styles/theme.css';
import './styles/sabo-design-system.css'; // Design system
import './styles/mobile-enhancements.css'; // Mobile optimizations

// ✅ Import debug utilities for tournament refresh
import './utils/debugTournamentRefresh';

// 🔧 Create SABO-32 advancement function
import './utils/createSABO32Function';

// 🔧 Test auth functionality in development - DISABLED FOR PRODUCTION
// import './utils/testAuth';

// 🎯 Test score submission functionality in development - DISABLED FOR PRODUCTION
// import './utils/testScoreSubmission';

// Lazy load components - Public pages
const HomePage = lazy(() => import('./pages/Home'));
const LegacyClaim = lazy(() => import('./pages/LegacyClaim'));
const ClaimCodePage = lazy(() => import('./pages/ClaimCodePage'));
// Use enhanced login page with role-based redirect logic
const EnhancedLoginPage = lazy(() => import('./pages/EnhancedLoginPage'));
const EnhancedRegisterPage = lazy(() => import('./pages/EnhancedRegisterPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/SimpleClubContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));
const NewsPage = lazy(() => import('./pages/BlogPage'));

// Public pages that should also be accessible to logged-in users
const ClubsPage = lazy(() => import('./pages/ClubsPage'));
const RankTestPage = lazy(() => import('./pages/RankTestPage'));
const SABOStyleTestPage = lazy(() => import('./pages/SABOStyleTestPage'));
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const TournamentPage = lazy(() => import('./pages/TournamentsPage'));

// Social Profile - Public access
const SocialProfileCard = lazy(() => import('./components/mobile/SocialProfileCard'));
const SocialProfileDemo = lazy(() => import('./pages/SocialProfileDemo'));

// SABO-32 Tournament Demo
const SABO32DemoPage = lazy(() => import('./pages/SABO32DemoPage'));

// Protected pages - User dashboard and features
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
// Enhanced Challenges V3 - Main implementation
const EnhancedChallengesPageV3 = lazy(
  () => import('./pages/challenges/EnhancedChallengesPageV3')
);

// Debug component
const ChallengeTabsDebug = lazy(() => import('./pages/ChallengeTabsDebug'));
const HandicapDebugger = lazy(() => import('./components/debug/HandicapDebugger'));
const ScoreSubmissionDemo = lazy(() => import('./pages/ScoreSubmissionDemo'));
const ClubApprovalDemo = lazy(() => import('./pages/ClubApprovalDemo'));
const ClubApprovalManagement = lazy(() => import('./pages/ClubApprovalManagement'));
const IntegratedScoreSystemDemo = lazy(() => import('./pages/IntegratedScoreSystemDemo'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/EnhancedSettingsPage'));
const WalletPage = lazy(() => import('./pages/PaymentPage'));
const ClubRegistrationPage = lazy(() => import('./pages/ClubRegistrationPage'));
const FeedPage = lazy(() => import('./pages/FeedPage'));
const MarketplacePage = lazy(() => import('./pages/EnhancedMarketplacePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsFullPage'));
// Milestones
const MilestonePage = lazy(() => import('./pages/MilestonePage'));

// Demo pages
// const DemoPlayerPage = lazy(() => import('./pages/DemoPlayerPage'));
// const DemoPage = lazy(() => import('./pages/DemoPage'));
const TestAvatarPage = lazy(() => import('./pages/test-avatar'));

// Testing components
const NavigationIntegrationDashboard = lazy(() => import('./components/testing/NavigationIntegrationDashboard'));

// Design System Testing and Standardized Pages
const DesignSystemAudit = lazy(() => import('./components/testing/DesignSystemAudit'));
const StandardizedDashboardPage = lazy(() => import('./pages/StandardizedDashboardPage'));
const StandardizedTournamentsPage = lazy(() => import('./pages/StandardizedTournamentsPage'));
const StandardizedChallengesPage = lazy(() => import('./pages/StandardizedChallengesPage'));
const StandardizedProfilePage = lazy(() => import('./pages/StandardizedProfilePage'));
const ThemeDemoPage = lazy(() => import('./pages/ThemeDemoPage'));
const ThemeImprovementSummary = lazy(() => import('./pages/ThemeImprovementSummary'));

// Admin components - REMOVED - Now redirects to separate admin app
// const AdminRouter = lazy(() => import('./router/AdminRouter'));

// Club components
const ClubManagementPage = lazy(() => import('./pages/ClubManagementPage'));
const ClubOwnerDashboardPage = lazy(
  () => import('./pages/ClubOwnerDashboardPage')
);

// Auth pages
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const AuthRouteGuard = lazy(() => import('./pages/AuthRouteGuard'));
const OtpTestPage = lazy(() => import('./pages/OtpTestPage'));

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
  // ✅ Initialize unified messages system
  const { isConnected } = useUnifiedMessages();

  // Inline component to protect club management routes by owner role
  const ClubOwnerRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const { user } = useAuth();
    const { data: isOwner, isLoading } = useIsClubOwner(user?.id, !!user?.id);
    if (isLoading)
      return <div className='p-8 text-center'>Đang kiểm tra quyền...</div>;
    if (!isOwner)
      return (
        <div className='p-8 text-center text-red-500'>
          Bạn không có quyền truy cập khu vực quản lý CLB.
        </div>
      );
    return <>{children}</>;
  };

  // Landing route component to handle root path redirection
  const LandingRoute: React.FC = () => {
    const { user, session, loading } = useAuth();
    if (loading) return <div className='p-8 text-center'>Đang tải...</div>;
    if (user && session) return <Navigate to='/dashboard' replace />;
    return <HomePage />;
  };

  return (
    <div className='min-h-screen bg-background'>
      <Suspense fallback={<AppLoadingFallback />}>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path='/' element={<LandingRoute />} />
          <Route path='/legacy-claim' element={<LegacyClaim />} />
          <Route path='/claim-code' element={<ClaimCodePage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/contact' element={<ContactPage />} />
          <Route path='/privacy' element={<PrivacyPolicyPage />} />
          <Route path='/terms' element={<TermsOfServicePage />} />
          <Route path='/news' element={<NewsPage />} />

          {/* Demo pages */}
          {/* PRODUCTION: All demo/test routes removed for better mobile performance */}

          {/* Auth routes - only accessible when NOT logged in */}
          <Route
            path='/auth'
            element={
              <PublicRoute>
                <AuthRouteGuard />
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
                <EnhancedRegisterPage />
              </PublicRoute>
            }
          />
          {/* Friendly redirects for legacy paths */}
          <Route
            path='/login'
            element={<Navigate to='/auth/login' replace />}
          />
          <Route
            path='/register'
            element={<Navigate to='/auth/register' replace />}
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
          <Route path='/test/otp' element={<OtpTestPage />} />

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
            <Route path='challenges' element={<EnhancedChallengesPageV3 />} />
            {/* Legacy challenge routes removed for production */}
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
            <Route path='messages' element={<MessagesPage />} />
            <Route path='notifications' element={<NotificationsPage />} />
            <Route path='milestones' element={<MilestonePage />} />
            {/* Test routes removed for production - cleaner mobile experience */}

            {/* Public pages accessible through sidebar when logged in */}
            <Route path='tournaments' element={<TournamentPage />} />
            <Route path='leaderboard' element={<LeaderboardPage />} />
            <Route path='clubs' element={<ClubsPage />} />
            <Route path='clubs/:id' element={<ClubDetailPage />} />
            <Route
              path='clubs/:id/owner'
              element={<ClubOwnerDashboardPage />}
            />
            
            {/* Legacy Claim Admin route removed - now using direct code claim system */}
            
            {/* Standardized Pages with Navigation */}
            <Route path='standardized-dashboard' element={<Navigate to="/dashboard" replace />} />
            <Route path='standardized-tournaments' element={<StandardizedTournamentsPage />} />
            <Route path='standardized-challenges' element={<StandardizedChallengesPage />} />
            <Route path='standardized-profile' element={<StandardizedProfilePage />} />
          </Route>

        {/* Social Profile - Public route accessible without login */}
        <Route path='/players/:userId' element={<SocialProfileCard />} />
        
        {/* Admin routes - REDIRECT to separate admin app */}
        <Route
          path='/admin/*'
          element={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">🔄 Redirecting to Admin Panel</h1>
                <p className="text-gray-400 mb-6">
                  The admin panel has been moved to a separate application for better performance and security.
                </p>
                <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 max-w-md mx-auto mb-6">
                  <p className="text-blue-300 text-sm">
                    You are being redirected to the admin application...
                  </p>
                </div>
                <a
                  href="http://localhost:8081"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Go to Admin Panel
                </a>
              </div>
            </div>
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
      {/* ✅ Connection indicator for unified messages */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm">
          🔄 Đang kết nối lại...
        </div>
      )}
      <OfflineIndicator />
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
          <ThemeProvider defaultTheme="dark">{/* 🛡️ LOCKED: Dark mode protected */}
            <Router>
              <CombinedProviders>
                <AppContent />
                <ReAuthModal />
              </CombinedProviders>
              <Toaster />
            </Router>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
