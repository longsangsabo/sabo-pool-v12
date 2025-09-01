import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'screens/home_screen.dart';
import 'screens/tournament_screen.dart';
import 'screens/club_screen.dart';
import 'screens/challenges_screen.dart';
import 'screens/profile_screen_optimized.dart';
import 'screens/auth_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/rankings_leaderboard_screen.dart';

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

  runApp(const MyApp());
}

// GoRouter configuration
final GoRouter _router = GoRouter(
  routes: [
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
      builder: (context, state) => const AuthScreen(mode: 'forgot-password'),
    ),
    GoRoute(
      path: '/auth/reset-password',
      builder: (context, state) => const AuthScreen(mode: 'reset-password'),
    ),
    // Profile & Settings routes with shared logic
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/rankings',
      builder: (context, state) => const RankingsLeaderboardScreen(currentUserId: 'demo-user-123'),
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
