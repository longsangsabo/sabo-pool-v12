// Types cho unified profile - port từ TypeScript
class UnifiedProfile {
  final String id;
  final String userId;
  final String? displayName;
  final String? phone;
  final String? bio;
  final String? skillLevel;
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

  const UnifiedProfile({
    required this.id,
    required this.userId,
    this.displayName,
    this.phone,
    this.bio,
    this.skillLevel,
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

// Utility function để get display name giống web app
String getDisplayName(UnifiedProfile profile) {
  return profile.displayName ??
      profile.fullName ??
      profile.email?.split('@').first ??
      'Người chơi';
}

// Player stats cho profile
class PlayerStats {
  final int elo;
  final int spa;
  final int totalMatches;
  final double winRate;

  const PlayerStats({
    required this.elo,
    required this.spa,
    required this.totalMatches,
    required this.winRate,
  });
}

// Player ranking cho profile
class PlayerRanking {
  final int rankingPosition;
  final String tier;

  const PlayerRanking({
    required this.rankingPosition,
    required this.tier,
  });
}
