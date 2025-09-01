/// App-wide constants for SABO Pool Arena
class AppConstants {
  // App Information
  static const String appName = 'SABO Pool Arena';
  static const String appVersion = '1.0.0';

  // API Configuration
  static const String supabaseUrl = 'https://your-project.supabase.co';
  static const String supabaseAnonKey = 'your-anon-key';

  // Screen Names
  static const String homeScreen = 'Trang chủ';
  static const String tournamentScreen = 'Giải đấu';
  static const String challengeScreen = 'Thách đấu';
  static const String rankingScreen = 'Xếp hạng';
  static const String clubScreen = 'Câu lạc bộ';
  static const String profileScreen = 'Hồ sơ';

  // Navigation
  static const int homeIndex = 0;
  static const int tournamentIndex = 1;
  static const int challengeIndex = 2;
  static const int rankingIndex = 3;
  static const int profileIndex = 4;

  // Timing
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration debounceDelay = Duration(milliseconds: 500);
  static const Duration apiTimeout = Duration(seconds: 30);

  // UI Constraints
  static const double maxContentWidth = 600;
  static const double minTouchTarget = 44;
  static const double cardBorderRadius = 12;
  static const double buttonBorderRadius = 8;

  // Spacing
  static const double paddingXS = 4;
  static const double paddingSM = 8;
  static const double paddingMD = 16;
  static const double paddingLG = 24;
  static const double paddingXL = 32;

  // Font Sizes
  static const double fontSizeCaption = 12;
  static const double fontSizeBody = 14;
  static const double fontSizeBodyLarge = 16;
  static const double fontSizeHeading = 18;
  static const double fontSizeTitle = 20;
  static const double fontSizeLarge = 24;

  // Asset Paths
  static const String iconPath = 'assets/icons/';
  static const String imagePath = 'assets/images/';

  // Validation
  static const int minPasswordLength = 6;
  static const int maxUsernameLength = 30;
  static const int maxBioLength = 500;

  // Tournament
  static const int maxTournamentParticipants = 64;
  static const int minTournamentParticipants = 4;

  // Challenge
  static const int maxChallengeDescription = 200;
  static const double minStakeAmount = 0;
  static const double maxStakeAmount = 10000000; // 10M VND
}

/// Color constants following SABO design system
class AppColors {
  // Primary Colors
  static const int primaryBlue = 0xFF2563eb;
  static const int primaryBlueDark = 0xFF1d4ed8;
  static const int primaryBlueLight = 0xFF3b82f6;

  // Neutral Colors (Dark Theme)
  static const int backgroundDark = 0xFF0f172a;
  static const int surfaceDark = 0xFF1e293b;
  static const int cardDark = 0xFF2D3748;
  static const int borderDark = 0xFF4A5568;

  // Text Colors
  static const int textPrimary = 0xFFf8fafc;
  static const int textSecondary = 0xFFcbd5e1;
  static const int textMuted = 0xFF94a3b8;

  // Semantic Colors
  static const int success = 0xFF10b981;
  static const int warning = 0xFFf59e0b;
  static const int error = 0xFFef4444;
  static const int info = 0xFF3b82f6;

  // Accent Colors
  static const int accent = 0xFF4CAF50; // Green for ranks, achievements
  static const int accentOrange = 0xFFFF9800; // Tournament highlights
  static const int accentPurple = 0xFF9C27B0; // Special events
}

/// Route names for navigation
class AppRoutes {
  static const String home = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String settings = '/settings';
  static const String tournaments = '/tournaments';
  static const String tournamentDetail = '/tournament';
  static const String challenges = '/challenges';
  static const String challengeDetail = '/challenge';
  static const String rankings = '/rankings';
  static const String clubs = '/clubs';
  static const String clubDetail = '/club';
  static const String wallet = '/wallet';
  static const String messages = '/messages';
  static const String notifications = '/notifications';
  static const String playerProfile = '/player';
}

/// API endpoint constants
class ApiEndpoints {
  // Authentication
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // User
  static const String profile = '/user/profile';
  static const String updateProfile = '/user/profile';
  static const String uploadAvatar = '/user/avatar';
  static const String userStats = '/user/stats';

  // Tournaments
  static const String tournaments = '/tournaments';
  static const String joinTournament = '/tournaments/join';
  static const String leaveTournament = '/tournaments/leave';
  static const String tournamentBrackets = '/tournaments/brackets';

  // Challenges
  static const String challenges = '/challenges';
  static const String createChallenge = '/challenges/create';
  static const String acceptChallenge = '/challenges/accept';
  static const String declineChallenge = '/challenges/decline';
  static const String submitResult = '/challenges/result';

  // Rankings
  static const String globalRankings = '/rankings/global';
  static const String regionalRankings = '/rankings/regional';
  static const String clubRankings = '/rankings/club';
  static const String personalRank = '/rankings/personal';

  // Clubs
  static const String clubs = '/clubs';
  static const String joinClub = '/clubs/join';
  static const String leaveClub = '/clubs/leave';
  static const String clubMembers = '/clubs/members';

  // Social
  static const String messages = '/messages';
  static const String notifications = '/notifications';
  static const String activities = '/activities';

  // Wallet
  static const String walletBalance = '/wallet/balance';
  static const String transactions = '/wallet/transactions';
  static const String deposit = '/wallet/deposit';
  static const String withdraw = '/wallet/withdraw';
}
