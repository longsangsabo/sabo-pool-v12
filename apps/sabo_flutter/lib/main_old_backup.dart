import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

// Core imports
import 'providers/auth_provider.dart';
import 'config/app_router.dart';

// Screen imports
import 'screens/home_screen.dart';
import 'screens/tournament_screen.dart';
import 'screens/club_screen.dart';
import 'screens/challenges_screen.dart';
import 'screens/profile_screen_optimized.dart';
import 'screens/auth_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/auth/otp_verification_screen.dart';
import 'screens/auth/password_reset_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set mobile UI style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF1a1a1a),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      title: 'SABO Pool Arena',
      debugShowCheckedModeBanner: false,
      routerConfig: _createRouter(ref),
      theme: _buildTheme(),
    );
  }

  GoRouter _createRouter(WidgetRef ref) {
    return GoRouter(
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
        
        // Debug logging
        debugPrint('Router redirect: $location | Onboarding: $onboardingCompleted | Auth: $isAuthenticated');
        
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
        if (!isAuthenticated && !location.startsWith('/auth') && !location.startsWith('/onboarding') && location != '/splash') {
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

  ThemeData _buildTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primarySwatch: Colors.blue,
      primaryColor: const Color(0xFF2196F3),
      scaffoldBackgroundColor: const Color(0xFF121212),
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1a1a1a),
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1a1a1a),
        selectedItemColor: Color(0xFF2196F3),
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF2196F3),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
      ),
    );
  }
}

// GoRouter configuration
final GoRouter _router = GoRouter(
  initialLocation: '/onboarding',
  routes: [
    // Onboarding route
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    
    // Main app route
    GoRoute(
      path: '/',
      builder: (context, state) => const MainNavigationScreen(),
    ),
    
    // Auth routes
    GoRoute(
      path: '/auth/login',
      builder: (context, state) => const AuthScreen(mode: 'login'),
    ),
    GoRoute(
      path: '/auth/register',
      builder: (context, state) => const AuthScreen(mode: 'register'),
    ),
    GoRoute(
      path: '/auth/forgot-password',
      builder: (context, state) => const PasswordResetScreen(),
    ),
    GoRoute(
      path: '/auth/otp-verification',
      builder: (context, state) {
        final extra = state.extra as Map<String, String>?;
        return OTPVerificationScreen(
          phoneNumber: extra?['phoneNumber'] ?? '',
          email: extra?['email'] ?? '',
          verificationType: extra?['verificationType'] ?? 'phone',
        );
      },
    ),
    GoRoute(
      path: '/auth/forgot-password',
      builder: (context, state) => const AuthScreen(mode: 'forgot-password'),
    ),
    GoRoute(
      path: '/auth/reset-password',
      builder: (context, state) => const AuthScreen(mode: 'reset-password'),
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SABO Pool Arena',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF2196F3),
        scaffoldBackgroundColor: const Color(0xFF121212),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1a1a1a),
          elevation: 0,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF1a1a1a),
          selectedItemColor: Color(0xFF2196F3),
          unselectedItemColor: Colors.grey,
          type: BottomNavigationBarType.fixed,
          elevation: 8,
        ),
      ),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const TournamentScreenEnhanced(),
    const ClubScreen(),
    const ChallengesScreen(),
    const ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.2),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          backgroundColor: const Color(0xFF1a1a1a),
          selectedItemColor: const Color(0xFF2196F3),
          unselectedItemColor: Colors.grey[600],
          selectedFontSize: 12,
          unselectedFontSize: 12,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_rounded, size: 24),
              activeIcon: Icon(Icons.home_rounded, size: 26),
              label: 'Trang chủ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.emoji_events_rounded, size: 24),
              activeIcon: Icon(Icons.emoji_events_rounded, size: 26),
              label: 'Giải đấu',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sports_bar_rounded, size: 24),
              activeIcon: Icon(Icons.sports_bar_rounded, size: 26),
              label: 'Câu lạc bộ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sports_esports_rounded, size: 24),
              activeIcon: Icon(Icons.sports_esports_rounded, size: 26),
              label: 'Thách đấu',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_rounded, size: 24),
              activeIcon: Icon(Icons.person_rounded, size: 26),
              label: 'Cá nhân',
            ),
          ],
        ),
      ),
    );
  }
}
