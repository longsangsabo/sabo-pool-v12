class UnifiedProfile {
  final String id;
  final String userId;
  final String? displayName;
  final String? phone;
  final String? bio;
  final String skillLevel;
  final String? city;
  final String? district;
  final String? avatarUrl;
  final String? memberSince;
  final String role;
  final String activeRole;
  final String? verifiedRank;
  final String? email;
  final String? fullName;
  final String? currentRank;
  final int spaPoints;
  final String createdAt;
  final String updatedAt;
  final int completionPercentage;

  UnifiedProfile({
    required this.id,
    required this.userId,
    this.displayName,
    this.phone,
    this.bio,
    required this.skillLevel,
    this.city,
    this.district,
    this.avatarUrl,
    this.memberSince,
    required this.role,
    required this.activeRole,
    this.verifiedRank,
    this.email,
    this.fullName,
    this.currentRank,
    required this.spaPoints,
    required this.createdAt,
    required this.updatedAt,
    required this.completionPercentage,
  });

  factory UnifiedProfile.fromJson(Map<String, dynamic> json) {
    return UnifiedProfile(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      displayName: json['display_name'],
      phone: json['phone'],
      bio: json['bio'],
      skillLevel: json['skill_level'] ?? 'beginner',
      city: json['city'],
      district: json['district'],
      avatarUrl: json['avatar_url'],
      memberSince: json['member_since'],
      role: json['role'] ?? 'player',
      activeRole: json['active_role'] ?? 'player',
      verifiedRank: json['verified_rank'],
      email: json['email'],
      fullName: json['full_name'],
      currentRank: json['current_rank'],
      spaPoints: json['spa_points'] ?? 1000,
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      updatedAt: json['updated_at'] ?? DateTime.now().toIso8601String(),
      completionPercentage: json['completion_percentage'] ?? 75,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'display_name': displayName,
      'phone': phone,
      'bio': bio,
      'skill_level': skillLevel,
      'city': city,
      'district': district,
      'avatar_url': avatarUrl,
      'member_since': memberSince,
      'role': role,
      'active_role': activeRole,
      'verified_rank': verifiedRank,
      'email': email,
      'full_name': fullName,
      'current_rank': currentRank,
      'spa_points': spaPoints,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'completion_percentage': completionPercentage,
    };
  }

  UnifiedProfile copyWith({
    String? id,
    String? userId,
    String? displayName,
    String? phone,
    String? bio,
    String? skillLevel,
    String? city,
    String? district,
    String? avatarUrl,
    String? memberSince,
    String? role,
    String? activeRole,
    String? verifiedRank,
    String? email,
    String? fullName,
    String? currentRank,
    int? spaPoints,
    String? createdAt,
    String? updatedAt,
    int? completionPercentage,
  }) {
    return UnifiedProfile(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      displayName: displayName ?? this.displayName,
      phone: phone ?? this.phone,
      bio: bio ?? this.bio,
      skillLevel: skillLevel ?? this.skillLevel,
      city: city ?? this.city,
      district: district ?? this.district,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      memberSince: memberSince ?? this.memberSince,
      role: role ?? this.role,
      activeRole: activeRole ?? this.activeRole,
      verifiedRank: verifiedRank ?? this.verifiedRank,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      currentRank: currentRank ?? this.currentRank,
      spaPoints: spaPoints ?? this.spaPoints,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      completionPercentage: completionPercentage ?? this.completionPercentage,
    );
  }
}

class PlayerStats {
  final int elo;
  final int spa;
  final int totalMatches;
  final int winRate;
  final int currentStreak;

  PlayerStats({
    required this.elo,
    required this.spa,
    required this.totalMatches,
    required this.winRate,
    required this.currentStreak,
  });

  factory PlayerStats.fromJson(Map<String, dynamic> json) {
    return PlayerStats(
      elo: json['elo'] ?? 1000,
      spa: json['spa'] ?? 0,
      totalMatches: json['total_matches'] ?? 0,
      winRate: json['win_rate'] ?? 0,
      currentStreak: json['current_streak'] ?? 0,
    );
  }
}

class PlayerRanking {
  final int rankingPosition;
  final String? category;
  final int totalPlayers;

  PlayerRanking({
    required this.rankingPosition,
    this.category,
    required this.totalPlayers,
  });

  factory PlayerRanking.fromJson(Map<String, dynamic> json) {
    return PlayerRanking(
      rankingPosition: json['ranking_position'] ?? 0,
      category: json['category'],
      totalPlayers: json['total_players'] ?? 0,
    );
  }
}

// Utility function to get display name
String getDisplayName(UnifiedProfile profile) {
  return profile.displayName ??
      profile.fullName ??
      profile.email?.split('@').first ??
      'Người chơi';
}
