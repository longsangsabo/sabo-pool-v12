import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

// Core imports
import 'providers/real_auth_provider.dart';
import 'models/auth_state_simple.dart';

// Screen imports
import 'screens/home_screen.dart';
import 'screens/tournament_screen.dart';
import 'screens/club_screen.dart';
import 'screens/challenges_screen.dart';
import 'screens/profile_screen_simple.dart';
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
        final authState = ref.read(realAuthStateProvider);
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
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }
}

// Screen Wrappers with Riverpod integration
class OnboardingScreenWrapper extends ConsumerWidget {
  const OnboardingScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return OnboardingScreen(
      onCompleted: () async {
        await ref.read(realAuthStateProvider.notifier).completeOnboarding();
        if (context.mounted) {
          context.go('/auth/login');
        }
      },
    );
  }
}

class AuthScreenWrapper extends ConsumerWidget {
  final String mode;
  
  const AuthScreenWrapper({super.key, required this.mode});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(realAuthStateProvider, (previous, next) {
      next.when(
        initial: () {},
        loading: () {},
        authenticated: (user, token) {
          context.go('/home');
        },
        unauthenticated: () {},
        otpVerified: () {
          // Navigate to complete registration or login
          context.go('/home');
        },
        passwordResetSent: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Email đặt lại mật khẩu đã được gửi!'),
              backgroundColor: Colors.green,
            ),
          );
        },
        error: (message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Colors.red,
            ),
          );
        },
      );
    });

    return AuthScreen(
      mode: mode,
      onSubmit: (data) async {
        final authNotifier = ref.read(realAuthStateProvider.notifier);
        
        if (mode == 'login') {
          await authNotifier.login(
            email: data['identifier'] ?? '',
            password: data['password'] ?? '',
          );
        } else if (mode == 'register') {
          await authNotifier.register(
            fullName: data['fullName'] ?? '',
            email: data['identifier'] ?? '',
            password: data['password'] ?? '',
            phone: data['phone'],
          );
        }
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
    return OTPVerificationScreen(
      phoneNumber: phoneNumber,
      email: email,
      verificationType: verificationType,
      onVerify: (otp) async {
        await ref.read(realAuthStateProvider.notifier).verifyOTP(
          otp: otp,
          identifier: verificationType == 'phone' ? phoneNumber : email,
          verificationType: verificationType,
        );
      },
    );
  }
}

class MainNavigationWrapper extends ConsumerStatefulWidget {
  final Widget child;
  
  const MainNavigationWrapper({super.key, required this.child});

  @override
  ConsumerState<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends ConsumerState<MainNavigationWrapper> {
  int _selectedIndex = 0;

  final List<NavigationItem> _navItems = [
    NavigationItem(icon: Icons.home_rounded, label: 'Trang chủ', route: '/home'),
    NavigationItem(icon: Icons.emoji_events_rounded, label: 'Giải đấu', route: '/tournaments'),
    NavigationItem(icon: Icons.sports_bar_rounded, label: 'Câu lạc bộ', route: '/clubs'),
    NavigationItem(icon: Icons.sports_esports_rounded, label: 'Thách đấu', route: '/challenges'),
    NavigationItem(icon: Icons.person_rounded, label: 'Cá nhân', route: '/profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final currentLocation = GoRouterState.of(context).uri.path;
    
    // Update selected index based on current route
    for (int i = 0; i < _navItems.length; i++) {
      if (currentLocation == _navItems[i].route) {
        if (_selectedIndex != i) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              setState(() {
                _selectedIndex = i;
              });
            }
          });
        }
        break;
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      body: widget.child,
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
          onTap: (index) {
            context.go(_navItems[index].route);
          },
          backgroundColor: const Color(0xFF1a1a1a),
          selectedItemColor: const Color(0xFF2196F3),
          unselectedItemColor: Colors.grey[600],
          selectedFontSize: 12,
          unselectedFontSize: 12,
          elevation: 0,
          items: _navItems.map((item) => BottomNavigationBarItem(
            icon: Icon(item.icon, size: 24),
            activeIcon: Icon(item.icon, size: 26),
            label: item.label,
          )).toList(),
        ),
      ),
    );
  }
}

class NavigationItem {
  final IconData icon;
  final String label;
  final String route;

  NavigationItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}

class HomeScreenWrapper extends ConsumerWidget {
  const HomeScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(realAuthStateProvider);
    return const HomeScreen();
  }
}

class TournamentScreenWrapper extends ConsumerWidget {
  const TournamentScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const TournamentScreenEnhanced();
  }
}

class ClubScreenWrapper extends ConsumerWidget {
  const ClubScreenWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const ClubScreen();
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
    final authState = ref.watch(realAuthStateProvider);
    
    return const ProfileScreen();
  }
}
