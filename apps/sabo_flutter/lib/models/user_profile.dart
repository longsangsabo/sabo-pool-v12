class UserProfile {
  final String id;
  final String email;
  final String? username;
  final String? displayName;
  final String? bio;
  final String? avatarUrl;
  final DateTime? dateOfBirth;
  final String? location;
  final String? phoneNumber;
  final bool emailVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserProfile({
    required this.id,
    required this.email,
    this.username,
    this.displayName,
    this.bio,
    this.avatarUrl,
    this.dateOfBirth,
    this.location,
    this.phoneNumber,
    required this.emailVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      email: json['email'],
      username: json['username'],
      displayName: json['display_name'],
      bio: json['bio'],
      avatarUrl: json['avatar_url'],
      dateOfBirth: json['date_of_birth'] != null ? DateTime.parse(json['date_of_birth']) : null,
      location: json['location'],
      phoneNumber: json['phone_number'],
      emailVerified: json['email_verified'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'display_name': displayName,
      'bio': bio,
      'avatar_url': avatarUrl,
      'date_of_birth': dateOfBirth?.toIso8601String(),
      'location': location,
      'phone_number': phoneNumber,
      'email_verified': emailVerified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class UserProfileStats {
  final int totalGames;
  final int wins;
  final int losses;
  final double winRate;
  final int currentStreak;
  final int longestStreak;
  final int totalPlayTime;
  final int perfectGames;

  UserProfileStats({
    required this.totalGames,
    required this.wins,
    required this.losses,
    required this.winRate,
    required this.currentStreak,
    required this.longestStreak,
    required this.totalPlayTime,
    required this.perfectGames,
  });

  factory UserProfileStats.fromJson(Map<String, dynamic> json) {
    return UserProfileStats(
      totalGames: json['total_games'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      currentStreak: json['current_streak'] ?? 0,
      longestStreak: json['longest_streak'] ?? 0,
      totalPlayTime: json['total_play_time'] ?? 0,
      perfectGames: json['perfect_games'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_games': totalGames,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'current_streak': currentStreak,
      'longest_streak': longestStreak,
      'total_play_time': totalPlayTime,
      'perfect_games': perfectGames,
    };
  }
}
