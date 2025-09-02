import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

// Core imports
import 'providers/real_auth_provider.dart';
import 'models/auth_state_simple.dart';

// Enhanced Screen imports - Using all new screens
import 'screens/home_screen_enhanced.dart';
import 'screens/tournament_screen_enhanced.dart';
import 'screens/club_screen_enhanced.dart';
import 'screens/challenges_screen.dart';
import 'screens/profile_screen_simple.dart';
import 'screens/auth_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/auth/otp_verification_screen.dart';
import 'screens/auth/password_reset_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set mobile UI style for better UX
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF1a1a1a),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const ProviderScope(child: SaboEnhancedApp()));
}

class SaboEnhancedApp extends ConsumerWidget {
  const SaboEnhancedApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'SABO Pool Arena - Enhanced',
      debugShowCheckedModeBanner: false,
      routerConfig: _createEnhancedRouter(ref),
      theme: _buildEnhancedTheme(),
    );
  }

  GoRouter _createEnhancedRouter(WidgetRef ref) {
    return GoRouter(
      initialLocation: '/onboarding',
      redirect: (context, state) {
        final authState = ref.read(realAuthStateProvider);
        final currentPath = state.fullPath;

        // Public routes that don't require authentication
        final publicRoutes = [
          '/onboarding',
          '/auth/login',
          '/auth/register', 
          '/auth/password-reset',
          '/auth/otp-verification'
        ];

        // Check if user is authenticated
        final isAuthenticated = authState is AuthStateAuthenticated;
        final isPublicRoute = publicRoutes.contains(currentPath);

        // Redirect logic
        if (!isAuthenticated && !isPublicRoute) {
          return '/onboarding';
        }
        
        if (isAuthenticated && currentPath == '/onboarding') {
          return '/';
        }

        return null; // No redirect needed
      },
      routes: [
        // Onboarding Flow
        GoRoute(
          path: '/onboarding',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const OnboardingScreen(),
            transitionsBuilder: _slideTransition,
          ),
        ),

        // Authentication Routes
        GoRoute(
          path: '/auth/login',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const AuthScreenWrapper(),
            transitionsBuilder: _fadeTransition,
          ),
        ),
        GoRoute(
          path: '/auth/register',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const AuthScreenWrapper(initialTab: 1),
            transitionsBuilder: _fadeTransition,
          ),
        ),
        GoRoute(
          path: '/auth/password-reset',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const PasswordResetScreenWrapper(),
            transitionsBuilder: _slideTransition,
          ),
        ),
        GoRoute(
          path: '/auth/otp-verification',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const OTPVerificationScreenWrapper(),
            transitionsBuilder: _slideTransition,
          ),
        ),

        // Main App Shell with Bottom Navigation
        ShellRoute(
          builder: (context, state, child) {
            return EnhancedMainShell(child: child);
          },
          routes: [
            // Home Screen
            GoRoute(
              path: '/',
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: const HomeScreenEnhancedWrapper(),
              ),
            ),
            
            // Tournament Screen
            GoRoute(
              path: '/tournaments',
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: const TournamentScreenEnhancedWrapper(),
              ),
            ),
            
            // Club Screen
            GoRoute(
              path: '/clubs',
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: const ClubScreenEnhancedWrapper(),
              ),
            ),
            
            // Challenges Screen
            GoRoute(
              path: '/challenges',
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: const ChallengesScreenWrapper(),
              ),
            ),
            
            // Profile Screen
            GoRoute(
              path: '/profile',
              pageBuilder: (context, state) => NoTransitionPage(
                key: state.pageKey,
                child: const ProfileScreenWrapper(),
              ),
            ),
          ],
        ),
      ],
    );
  }

  ThemeData _buildEnhancedTheme() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF2196F3),
        brightness: Brightness.dark,
        surface: const Color(0xFF121212),
        primary: const Color(0xFF2196F3),
        secondary: const Color(0xFF03DAC6),
        error: const Color(0xFFCF6679),
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E1E1E),
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF1E1E1E),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2196F3),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF2A2A2A),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  // Custom transitions
  Widget _slideTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return SlideTransition(
      position: animation.drive(
        Tween(begin: const Offset(1.0, 0.0), end: Offset.zero),
      ),
      child: child,
    );
  }

  Widget _fadeTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(opacity: animation, child: child);
  }
}

// Enhanced Main Shell with Bottom Navigation
class EnhancedMainShell extends ConsumerWidget {
  final Widget child;
  
  const EnhancedMainShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: child,
      bottomNavigationBar: EnhancedBottomNavigation(),
    );
  }
}

class EnhancedBottomNavigation extends ConsumerWidget {
  const EnhancedBottomNavigation({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentPath = GoRouterState.of(context).fullPath;
    
    int selectedIndex = 0;
    switch (currentPath) {
      case '/':
        selectedIndex = 0;
        break;
      case '/tournaments':
        selectedIndex = 1;
        break;
      case '/clubs':
        selectedIndex = 2;
        break;
      case '/challenges':
        selectedIndex = 3;
        break;
      case '/profile':
        selectedIndex = 4;
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E1E),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: selectedIndex,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.transparent,
        elevation: 0,
        selectedItemColor: const Color(0xFF2196F3),
        unselectedItemColor: Colors.grey,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w400),
        onTap: (index) {
          switch (index) {
            case 0:
              context.go('/');
              break;
            case 1:
              context.go('/tournaments');
              break;
            case 2:
              context.go('/clubs');
              break;
            case 3:
              context.go('/challenges');
              break;
            case 4:
              context.go('/profile');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Trang chủ',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events_outlined),
            activeIcon: Icon(Icons.emoji_events),
            label: 'Giải đấu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.groups_outlined),
            activeIcon: Icon(Icons.groups),
            label: 'Câu lạc bộ',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.sports_esports_outlined),
            activeIcon: Icon(Icons.sports_esports),
            label: 'Thách đấu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Hồ sơ',
          ),
        ],
      ),
    );
  }
}

// Screen Wrappers to handle state and navigation
class AuthScreenWrapper extends ConsumerWidget {
  final int initialTab;
  
  const AuthScreenWrapper({super.key, this.initialTab = 0});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AuthScreen(initialTab: initialTab);
  }
}

class HomeScreenEnhancedWrapper extends ConsumerWidget {
  const HomeScreenEnhancedWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const HomeScreenEnhanced();
  }
}

class TournamentScreenEnhancedWrapper extends ConsumerWidget {
  const TournamentScreenEnhancedWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const TournamentScreenEnhanced();
  }
}

class ClubScreenEnhancedWrapper extends ConsumerWidget {
  const ClubScreenEnhancedWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const ClubScreenEnhanced();
  }
}

class ChallengesScreenWrapper extends ConsumerWidget {
  const ChallengesScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const ChallengesScreen();
  }
}

class ProfileScreenWrapper extends ConsumerWidget {
  const ProfileScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const ProfileScreen();
  }
}

class PasswordResetScreenWrapper extends ConsumerWidget {
  const PasswordResetScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PasswordResetScreen(
      onSubmit: (identifier, method) async {
        await ref.read(realAuthStateProvider.notifier).sendPasswordReset(
          email: identifier,
        );
      },
    );
  }
}

class OTPVerificationScreenWrapper extends ConsumerWidget {
  const OTPVerificationScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OTPVerificationScreen(
      onVerify: (otp) async {
        await ref.read(realAuthStateProvider.notifier).verifyOTP(otp);
      },
      onResend: () async {
        // Implement resend OTP logic
      },
    );
  }
}
