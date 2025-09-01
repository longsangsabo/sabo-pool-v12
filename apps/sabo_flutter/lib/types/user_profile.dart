/**
 * User Profile Types for Flutter
 * Mirror of TypeScript user profile types from shared business logic
 */

class UserProfile {
  final String userId;
  final String? displayName;
  final String fullName;
  final String? nickname;
  final String? phone;
  final String? email;
  final String? bio;
  final String? skillLevel;
  final String? city;
  final String? district;
  final String? avatarUrl;
  final String? role;
  final double? completionPercentage;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserProfile({
    required this.userId,
    this.displayName,
    required this.fullName,
    this.nickname,
    this.phone,
    this.email,
    this.bio,
    this.skillLevel,
    this.city,
    this.district,
    this.avatarUrl,
    this.role,
    this.completionPercentage,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['user_id'] ?? '',
      displayName: json['display_name'],
      fullName: json['full_name'] ?? '',
      nickname: json['nickname'],
      phone: json['phone'],
      email: json['email'],
      bio: json['bio'],
      skillLevel: json['skill_level'],
      city: json['city'],
      district: json['district'],
      avatarUrl: json['avatar_url'],
      role: json['role'],
      completionPercentage: json['completion_percentage']?.toDouble(),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'display_name': displayName,
      'full_name': fullName,
      'nickname': nickname,
      'phone': phone,
      'email': email,
      'bio': bio,
      'skill_level': skillLevel,
      'city': city,
      'district': district,
      'avatar_url': avatarUrl,
      'role': role,
      'completion_percentage': completionPercentage,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class UserStats {
  final int totalMatches;
  final int wins;
  final int losses;
  final double winRate;
  final String currentRank;
  final int spaPoints;
  final int eloPoints;
  final int? currentStreak;
  final int? bestStreak;

  UserStats({
    required this.totalMatches,
    required this.wins,
    required this.losses,
    required this.winRate,
    required this.currentRank,
    required this.spaPoints,
    required this.eloPoints,
    this.currentStreak,
    this.bestStreak,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalMatches: json['total_matches'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      currentRank: json['current_rank'] ?? 'Bronze',
      spaPoints: json['spa_points'] ?? 0,
      eloPoints: json['elo_points'] ?? 1200,
      currentStreak: json['current_streak'],
      bestStreak: json['best_streak'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_matches': totalMatches,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'current_rank': currentRank,
      'spa_points': spaPoints,
      'elo_points': eloPoints,
      'current_streak': currentStreak,
      'best_streak': bestStreak,
    };
  }
}

class UserAchievement {
  final String id;
  final String title;
  final String description;
  final String category;
  final String iconUrl;
  final DateTime unlockedAt;
  final bool isRare;

  UserAchievement({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.iconUrl,
    required this.unlockedAt,
    required this.isRare,
  });

  factory UserAchievement.fromJson(Map<String, dynamic> json) {
    return UserAchievement(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      iconUrl: json['icon_url'] ?? '',
      unlockedAt: DateTime.parse(json['unlocked_at'] ?? DateTime.now().toIso8601String()),
      isRare: json['is_rare'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'icon_url': iconUrl,
      'unlocked_at': unlockedAt.toIso8601String(),
      'is_rare': isRare,
    };
  }
}

class MatchHistory {
  final String id;
  final String? tournamentId;
  final String? tournamentName;
  final String opponentId;
  final String opponentName;
  final String result; // 'win', 'loss', 'draw'
  final int? playerScore;
  final int? opponentScore;
  final DateTime playedAt;
  final String? venue;
  final Map<String, dynamic>? metadata;

  MatchHistory({
    required this.id,
    this.tournamentId,
    this.tournamentName,
    required this.opponentId,
    required this.opponentName,
    required this.result,
    this.playerScore,
    this.opponentScore,
    required this.playedAt,
    this.venue,
    this.metadata,
  });

  factory MatchHistory.fromJson(Map<String, dynamic> json) {
    return MatchHistory(
      id: json['id'] ?? '',
      tournamentId: json['tournament_id'],
      tournamentName: json['tournament_name'],
      opponentId: json['opponent_id'] ?? '',
      opponentName: json['opponent_name'] ?? '',
      result: json['result'] ?? 'draw',
      playerScore: json['player_score'],
      opponentScore: json['opponent_score'],
      playedAt: DateTime.parse(json['played_at'] ?? DateTime.now().toIso8601String()),
      venue: json['venue'],
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tournament_id': tournamentId,
      'tournament_name': tournamentName,
      'opponent_id': opponentId,
      'opponent_name': opponentName,
      'result': result,
      'player_score': playerScore,
      'opponent_score': opponentScore,
      'played_at': playedAt.toIso8601String(),
      'venue': venue,
      'metadata': metadata,
    };
  }
}

class UserPreferences {
  final String userId;
  final String? preferredLanguage;
  final String? timezone;
  final bool notificationsEnabled;
  final bool emailNotifications;
  final bool pushNotifications;
  final String? theme;
  final Map<String, dynamic>? customSettings;

  UserPreferences({
    required this.userId,
    this.preferredLanguage,
    this.timezone,
    required this.notificationsEnabled,
    required this.emailNotifications,
    required this.pushNotifications,
    this.theme,
    this.customSettings,
  });

  factory UserPreferences.fromJson(Map<String, dynamic> json) {
    return UserPreferences(
      userId: json['user_id'] ?? '',
      preferredLanguage: json['preferred_language'],
      timezone: json['timezone'],
      notificationsEnabled: json['notifications_enabled'] ?? true,
      emailNotifications: json['email_notifications'] ?? true,
      pushNotifications: json['push_notifications'] ?? true,
      theme: json['theme'],
      customSettings: json['custom_settings'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'preferred_language': preferredLanguage,
      'timezone': timezone,
      'notifications_enabled': notificationsEnabled,
      'email_notifications': emailNotifications,
      'push_notifications': pushNotifications,
      'theme': theme,
      'custom_settings': customSettings,
    };
  }
}

class PlayerRanking {
  final String userId;
  final String currentRank;
  final String previousRank;
  final int spaPoints;
  final int eloRating;
  final int position;
  final int totalPlayers;
  final String tier;
  final double progress;

  PlayerRanking({
    required this.userId,
    required this.currentRank,
    required this.previousRank,
    required this.spaPoints,
    required this.eloRating,
    required this.position,
    required this.totalPlayers,
    required this.tier,
    required this.progress,
  });

  factory PlayerRanking.fromJson(Map<String, dynamic> json) {
    return PlayerRanking(
      userId: json['user_id'] ?? '',
      currentRank: json['current_rank'] ?? 'Bronze',
      previousRank: json['previous_rank'] ?? 'Bronze',
      spaPoints: json['spa_points'] ?? 0,
      eloRating: json['elo_rating'] ?? 1200,
      position: json['position'] ?? 0,
      totalPlayers: json['total_players'] ?? 0,
      tier: json['tier'] ?? 'Bronze',
      progress: (json['progress'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'current_rank': currentRank,
      'previous_rank': previousRank,
      'spa_points': spaPoints,
      'elo_rating': eloRating,
      'position': position,
      'total_players': totalPlayers,
      'tier': tier,
      'progress': progress,
    };
  }
}

class ClubMembership {
  final String clubId;
  final String clubName;
  final String role; // 'member', 'admin', 'owner'
  final DateTime joinedAt;
  final bool isActive;

  ClubMembership({
    required this.clubId,
    required this.clubName,
    required this.role,
    required this.joinedAt,
    required this.isActive,
  });

  factory ClubMembership.fromJson(Map<String, dynamic> json) {
    return ClubMembership(
      clubId: json['club_id'] ?? '',
      clubName: json['club_name'] ?? '',
      role: json['role'] ?? 'member',
      joinedAt: DateTime.parse(json['joined_at'] ?? DateTime.now().toIso8601String()),
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'club_id': clubId,
      'club_name': clubName,
      'role': role,
      'joined_at': joinedAt.toIso8601String(),
      'is_active': isActive,
    };
  }
}

// Skill Level Constants
class SkillLevel {
  static const String beginner = 'beginner';
  static const String intermediate = 'intermediate';
  static const String advanced = 'advanced';
  static const String pro = 'pro';
}

// User Role Constants
class UserRole {
  static const String player = 'player';
  static const String clubOwner = 'club_owner';
  static const String both = 'both';
  static const String admin = 'admin';
}
