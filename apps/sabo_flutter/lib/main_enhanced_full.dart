import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

// Core imports
import 'providers/real_auth_provider.dart';
import 'models/auth_state_simple.dart';

// Enhanced Screen imports - All Available Screens
import 'screens/home_screen_enhanced.dart';
import 'screens/tournament_screen_enhanced.dart';
import 'screens/club_screen_enhanced.dart';
import 'screens/challenges_screen.dart';
import 'screens/profile_screen_optimized.dart';
import 'screens/auth_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/auth/otp_verification_screen.dart';
import 'screens/auth/password_reset_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Enhanced Mobile UI style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0d1421),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const ProviderScope(child: SaboPoolApp()));
}

class SaboPoolApp extends ConsumerWidget {
  const SaboPoolApp({super.key});

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
        final isAuthenticated = authState is AuthStateAuthenticated;
        
        // Enhanced routing logic
        if (!isAuthenticated) {
          // Allow onboarding, auth routes when not authenticated
          if (state.matchedLocation.startsWith('/onboarding') ||
              state.matchedLocation.startsWith('/auth') ||
              state.matchedLocation.startsWith('/otp') ||
              state.matchedLocation.startsWith('/password-reset')) {
            return null;
          }
          return '/onboarding';
        } else {
          // Redirect to home if authenticated and trying to access auth routes
          if (state.matchedLocation.startsWith('/onboarding') ||
              state.matchedLocation.startsWith('/auth')) {
            return '/home';
          }
        }
        return null;
      },
      routes: [
        // Onboarding & Authentication Routes
        GoRoute(
          path: '/onboarding',
          name: 'onboarding',
          builder: (context, state) => const OnboardingScreenWrapper(),
        ),
        GoRoute(
          path: '/auth/login',
          name: 'login',
          builder: (context, state) => const AuthScreenWrapper(),
        ),
        GoRoute(
          path: '/auth/register',
          name: 'register',
          builder: (context, state) => const AuthScreenWrapper(),
        ),
        GoRoute(
          path: '/otp',
          name: 'otp',
          builder: (context, state) => const OTPVerificationScreenWrapper(),
        ),
        GoRoute(
          path: '/password-reset',
          name: 'password-reset',
          builder: (context, state) => const PasswordResetScreenWrapper(),
        ),
        
        // Main App Routes with Bottom Navigation
        ShellRoute(
          builder: (context, state, child) {
            return MainNavigationShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/home',
              name: 'home',
              builder: (context, state) => const HomeScreenEnhanced(),
            ),
            GoRoute(
              path: '/tournaments',
              name: 'tournaments',
              builder: (context, state) => const TournamentScreenEnhanced(),
            ),
            GoRoute(
              path: '/clubs',
              name: 'clubs',
              builder: (context, state) => const ClubScreenEnhanced(),
            ),
            GoRoute(
              path: '/challenges',
              name: 'challenges',
              builder: (context, state) => const ChallengesScreen(),
            ),
            GoRoute(
              path: '/profile',
              name: 'profile',
              builder: (context, state) => const ProfileScreenOptimized(),
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
        seedColor: const Color(0xFF2E7D32),
        brightness: Brightness.dark,
        surface: const Color(0xFF0d1421),
        primary: const Color(0xFF4CAF50),
        secondary: const Color(0xFF81C784),
        tertiary: const Color(0xFFFFD54F),
      ),
      textTheme: GoogleFonts.interTextTheme(
        ThemeData.dark().textTheme,
      ).apply(
        bodyColor: Colors.white,
        displayColor: Colors.white,
      ),
      scaffoldBackgroundColor: const Color(0xFF0d1421),
      cardTheme: CardTheme(
        color: const Color(0xFF1a1a1a),
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF4CAF50),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1a1a1a),
        selectedItemColor: Color(0xFF4CAF50),
        unselectedItemColor: Color(0xFF666666),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}

// Enhanced Main Navigation Shell with Bottom Navigation
class MainNavigationShell extends ConsumerWidget {
  final Widget child;

  const MainNavigationShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1a1a1a),
          border: Border(
            top: BorderSide(
              color: Color(0xFF333333),
              width: 0.5,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _getCurrentIndex(context),
          onTap: (index) => _onTap(context, index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF4CAF50),
          unselectedItemColor: const Color(0xFF666666),
          selectedFontSize: 12,
          unselectedFontSize: 12,
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
              icon: Icon(Icons.sports_outlined),
              activeIcon: Icon(Icons.sports),
              label: 'Thách đấu',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Hồ sơ',
            ),
          ],
        ),
      ),
    );
  }

  int _getCurrentIndex(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;
    switch (currentRoute) {
      case '/home':
        return 0;
      case '/tournaments':
        return 1;
      case '/clubs':
        return 2;
      case '/challenges':
        return 3;
      case '/profile':
        return 4;
      default:
        return 0;
    }
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/home');
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
  }
}

// Enhanced Screen Wrappers with Provider Integration
class OnboardingScreenWrapper extends ConsumerWidget {
  const OnboardingScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const OnboardingScreen();
  }
}

class AuthScreenWrapper extends ConsumerWidget {
  const AuthScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const AuthScreen();
  }
}

class OTPVerificationScreenWrapper extends ConsumerWidget {
  const OTPVerificationScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OTPVerificationScreen(
      onVerified: () {
        context.go('/home');
      },
    );
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
