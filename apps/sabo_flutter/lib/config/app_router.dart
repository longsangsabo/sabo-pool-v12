import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

/// Enhanced GoRouter configuration with authentication guards
class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static GoRouter createRouter(WidgetRef ref) {
    return GoRouter(
      navigatorKey: _rootNavigatorKey,
      initialLocation: '/splash',
      debugLogDiagnostics: true,
      redirect: (context, state) {
        // Get current auth and onboarding status
        final authState = ref.read(authStateProvider);
        final onboardingAsync = ref.read(onboardingProvider);
        
        // Handle loading states
        if (onboardingAsync.isLoading) {
          return '/splash';
        }
        
        final onboardingCompleted = onboardingAsync.value ?? false;
        final isAuthenticated = authState.isAuthenticated;
        
        // Current location
        final location = state.uri.path;
        
        // Splash screen logic
        if (location == '/splash') {
          if (!onboardingCompleted) {
            return '/onboarding';
          } else if (!isAuthenticated) {
            return '/auth/login';
          } else {
            return '/home';
          }
        }
        
        // Onboarding flow
        if (location.startsWith('/onboarding')) {
          if (onboardingCompleted) {
            return isAuthenticated ? '/home' : '/auth/login';
          }
          return null; // Allow onboarding
        }
        
        // Auth flow
        if (location.startsWith('/auth')) {
          if (!onboardingCompleted) {
            return '/onboarding';
          }
          if (isAuthenticated) {
            return '/home';
          }
          return null; // Allow auth pages
        }
        
        // Protected routes
        if (!isAuthenticated) {
          return '/auth/login';
        }
        
        // If authenticated and trying to access root, redirect to home
        if (location == '/') {
          return '/home';
        }
        
        return null; // No redirect needed
      },
      routes: [
        // Splash route
        GoRoute(
          path: '/splash',
          builder: (context, state) => const SplashScreen(),
        ),
        
        // Onboarding route
        GoRoute(
          path: '/onboarding',
          builder: (context, state) => const OnboardingScreenWrapper(),
        ),
        
        // Auth routes
        GoRoute(
          path: '/auth/login',
          builder: (context, state) => const AuthScreenWrapper(mode: 'login'),
        ),
        GoRoute(
          path: '/auth/register',
          builder: (context, state) => const AuthScreenWrapper(mode: 'register'),
        ),
        GoRoute(
          path: '/auth/forgot-password',
          builder: (context, state) => const PasswordResetScreenWrapper(),
        ),
        GoRoute(
          path: '/auth/otp-verification',
          builder: (context, state) {
            final extra = state.extra as Map<String, String>?;
            return OTPVerificationScreenWrapper(
              phoneNumber: extra?['phoneNumber'] ?? '',
              email: extra?['email'] ?? '',
              verificationType: extra?['verificationType'] ?? 'phone',
            );
          },
        ),
        
        // Main app shell with bottom navigation
        ShellRoute(
          navigatorKey: _shellNavigatorKey,
          builder: (context, state, child) => MainNavigationWrapper(child: child),
          routes: [
            GoRoute(
              path: '/home',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: HomeScreenWrapper(),
              ),
            ),
            GoRoute(
              path: '/tournaments',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: TournamentScreenWrapper(),
              ),
            ),
            GoRoute(
              path: '/clubs',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ClubScreenWrapper(),
              ),
            ),
            GoRoute(
              path: '/challenges',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ChallengesScreenWrapper(),
              ),
            ),
            GoRoute(
              path: '/profile',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ProfileScreenWrapper(),
              ),
            ),
          ],
        ),
      ],
      errorBuilder: (context, state) => ErrorScreen(error: state.error),
    );
  }
}

// Splash Screen
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF2196F3),
              Color(0xFF121212),
              Color(0xFF9C27B0),
            ],
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.sports_baseball,
                size: 80,
                color: Colors.white,
              ),
              SizedBox(height: 24),
              Text(
                'SABO POOL ARENA',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Cộng đồng Billiards #1 Việt Nam',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
              SizedBox(height: 40),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Error Screen
class ErrorScreen extends StatelessWidget {
  final Exception? error;
  
  const ErrorScreen({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 80,
              color: Colors.red,
            ),
            const SizedBox(height: 24),
            const Text(
              'Oops! Có lỗi xảy ra',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              error?.toString() ?? 'Lỗi không xác định',
              style: const TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2196F3),
                foregroundColor: Colors.white,
              ),
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}

// Screen wrappers will be imported from their respective files
// These are placeholders for the wrapper classes
class OnboardingScreenWrapper extends ConsumerWidget {
  const OnboardingScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual OnboardingScreen
    return Container(); // Placeholder
  }
}

class AuthScreenWrapper extends ConsumerWidget {
  final String mode;
  
  const AuthScreenWrapper({super.key, required this.mode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual AuthScreen
    return Container(); // Placeholder
  }
}

class PasswordResetScreenWrapper extends ConsumerWidget {
  const PasswordResetScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual PasswordResetScreen
    return Container(); // Placeholder
  }
}

class OTPVerificationScreenWrapper extends ConsumerWidget {
  final String phoneNumber;
  final String email;
  final String verificationType;
  
  const OTPVerificationScreenWrapper({
    super.key,
    required this.phoneNumber,
    required this.email,
    required this.verificationType,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual OTPVerificationScreen
    return Container(); // Placeholder
  }
}

class MainNavigationWrapper extends ConsumerWidget {
  final Widget child;
  
  const MainNavigationWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual MainNavigationScreen
    return Container(); // Placeholder
  }
}

class HomeScreenWrapper extends ConsumerWidget {
  const HomeScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual HomeScreen
    return Container(); // Placeholder
  }
}

class TournamentScreenWrapper extends ConsumerWidget {
  const TournamentScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual TournamentScreen
    return Container(); // Placeholder
  }
}

class ClubScreenWrapper extends ConsumerWidget {
  const ClubScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual ClubScreen
    return Container(); // Placeholder
  }
}

class ChallengesScreenWrapper extends ConsumerWidget {
  const ChallengesScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual ChallengesScreen
    return Container(); // Placeholder
  }
}

class ProfileScreenWrapper extends ConsumerWidget {
  const ProfileScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Import the actual ProfileScreen
    return Container(); // Placeholder
  }
}
