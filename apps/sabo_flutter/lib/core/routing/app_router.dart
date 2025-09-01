import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/tournament/screens/tournament_list_screen.dart';
import '../../features/club/screens/club_list_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../shared/widgets/bottom_navigation.dart';
import '../../shared/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/home',
    redirect: (context, state) {
      return authState.when(
        data: (user) {
          final isAuthenticated = user != null;
          final isAuthRoute = state.fullPath?.startsWith('/auth') ?? false;
          
          if (!isAuthenticated && !isAuthRoute) {
            return '/auth/login';
          }
          if (isAuthenticated && isAuthRoute) {
            return '/home';
          }
          return null;
        },
        loading: () => null,
        error: (_, __) => '/auth/login',
      );
    },
    routes: [
      // Auth Routes
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/auth/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      
      // Main App Shell with Bottom Navigation
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/tournaments',
            builder: (context, state) => const TournamentListScreen(),
          ),
          GoRoute(
            path: '/clubs',
            builder: (context, state) => const ClubListScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});

class AppShell extends StatelessWidget {
  final Widget child;
  
  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: const AppBottomNavigation(),
    );
  }
}
