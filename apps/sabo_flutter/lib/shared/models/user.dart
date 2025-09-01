class User {
  final String id;
  final String email;
  final String? fullName;
  final String? displayName;
  final String? avatarUrl;
  final int eloRating;
  final int spaPoints;
  final DateTime createdAt;
  final DateTime? updatedAt;
  
  // Stats
  final int totalMatches;
  final int wins;
  final int losses;
  final double winRate;
  
  // Profile
  final String? phone;
  final String? bio;
  final String? location;
  final bool isVerified;
  final bool isActive;

  const User({
    required this.id,
    required this.email,
    this.fullName,
    this.displayName,
    this.avatarUrl,
    this.eloRating = 1200,
    this.spaPoints = 0,
    required this.createdAt,
    this.updatedAt,
    this.totalMatches = 0,
    this.wins = 0,
    this.losses = 0,
    this.winRate = 0.0,
    this.phone,
    this.bio,
    this.location,
    this.isVerified = false,
    this.isActive = true,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['full_name'] as String?,
      displayName: json['display_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      eloRating: (json['elo_rating'] as num?)?.toInt() ?? 1200,
      spaPoints: (json['spa_points'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
        ? DateTime.parse(json['updated_at'] as String) 
        : null,
      totalMatches: (json['total_matches'] as num?)?.toInt() ?? 0,
      wins: (json['wins'] as num?)?.toInt() ?? 0,
      losses: (json['losses'] as num?)?.toInt() ?? 0,
      winRate: (json['win_rate'] as num?)?.toDouble() ?? 0.0,
      phone: json['phone'] as String?,
      bio: json['bio'] as String?,
      location: json['location'] as String?,
      isVerified: json['is_verified'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'elo_rating': eloRating,
      'spa_points': spaPoints,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'total_matches': totalMatches,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'phone': phone,
      'bio': bio,
      'location': location,
      'is_verified': isVerified,
      'is_active': isActive,
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? fullName,
    String? displayName,
    String? avatarUrl,
    int? eloRating,
    int? spaPoints,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? totalMatches,
    int? wins,
    int? losses,
    double? winRate,
    String? phone,
    String? bio,
    String? location,
    bool? isVerified,
    bool? isActive,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      eloRating: eloRating ?? this.eloRating,
      spaPoints: spaPoints ?? this.spaPoints,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      totalMatches: totalMatches ?? this.totalMatches,
      wins: wins ?? this.wins,
      losses: losses ?? this.losses,
      winRate: winRate ?? this.winRate,
      phone: phone ?? this.phone,
      bio: bio ?? this.bio,
      location: location ?? this.location,
      isVerified: isVerified ?? this.isVerified,
      isActive: isActive ?? this.isActive,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, email: $email, displayName: $displayName, eloRating: $eloRating)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is User && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
