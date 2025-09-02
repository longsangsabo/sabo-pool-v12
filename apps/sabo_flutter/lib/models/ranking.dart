class ELORating {
  final String userId;
  final int rating;
  final int gamesPlayed;
  final int wins;
  final int losses;
  final int? peak;
  final DateTime lastUpdated;
  
  // Additional properties for UI
  int get currentRating => rating;
  int get peakRating => peak ?? rating;
  String get tier => _getTierName(rating);
  int get tierProgress => _calculateProgress(rating);

  ELORating({
    required this.userId,
    required this.rating,
    required this.gamesPlayed,
    required this.wins,
    required this.losses,
    this.peak,
    required this.lastUpdated,
  });

  factory ELORating.fromJson(Map<String, dynamic> json) {
    return ELORating(
      userId: json['user_id'],
      rating: json['rating'],
      gamesPlayed: json['games_played'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      peak: json['peak'],
      lastUpdated: DateTime.parse(json['last_updated']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'rating': rating,
      'games_played': gamesPlayed,
      'wins': wins,
      'losses': losses,
      'peak': peak,
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  String _getTierName(int rating) {
    if (rating >= 2000) return 'Diamond';
    if (rating >= 1500) return 'Gold';
    if (rating >= 1200) return 'Silver';
    return 'Bronze';
  }

  int _calculateProgress(int rating) {
    // Simple tier progress calculation
    if (rating >= 2000) return 100;
    if (rating >= 1500) return ((rating - 1500) / 500 * 100).round();
    if (rating >= 1200) return ((rating - 1200) / 300 * 100).round();
    return ((rating - 800) / 400 * 100).round().clamp(0, 100);
  }
}

class SPAPoints {
  final String userId;
  final int points;
  final int gamesPlayed;
  final int perfectGames;
  final double averageScore;
  final int? peak;
  final DateTime lastUpdated;
  
  // Additional properties for UI
  int get currentPoints => points;
  int get seasonPoints => points; // For season-based display
  String get seasonTier => _getSeasonTier(points);

  SPAPoints({
    required this.userId,
    required this.points,
    required this.gamesPlayed,
    required this.perfectGames,
    required this.averageScore,
    this.peak,
    required this.lastUpdated,
  });

  factory SPAPoints.fromJson(Map<String, dynamic> json) {
    return SPAPoints(
      userId: json['user_id'],
      points: json['points'],
      gamesPlayed: json['games_played'] ?? 0,
      perfectGames: json['perfect_games'] ?? 0,
      averageScore: (json['average_score'] ?? 0.0).toDouble(),
      peak: json['peak'],
      lastUpdated: DateTime.parse(json['last_updated']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'points': points,
      'games_played': gamesPlayed,
      'perfect_games': perfectGames,
      'average_score': averageScore,
      'peak': peak,
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  String _getSeasonTier(int points) {
    if (points >= 5000) return 'Master';
    if (points >= 3000) return 'Expert';
    if (points >= 1500) return 'Advanced';
    if (points >= 500) return 'Intermediate';
    return 'Beginner';
  }
}

class RankTier {
  final String name;
  final int minRating;
  final int maxRating;
  final String iconUrl;
  final String color;
  final String description;
  
  // Additional properties for UI
  String get icon => iconUrl;
  List<String> get benefits => [
    'Access to $name tier features',
    'Special $name badge',
    'Priority matchmaking'
  ];

  RankTier({
    required this.name,
    required this.minRating,
    required this.maxRating,
    required this.iconUrl,
    required this.color,
    required this.description,
  });

  factory RankTier.fromJson(Map<String, dynamic> json) {
    return RankTier(
      name: json['name'],
      minRating: json['min_rating'],
      maxRating: json['max_rating'],
      iconUrl: json['icon_url'],
      color: json['color'],
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'min_rating': minRating,
      'max_rating': maxRating,
      'icon_url': iconUrl,
      'color': color,
      'description': description,
    };
  }
}

class LeaderboardEntry {
  final String userId;
  final String displayName;
  final String? avatarUrl;
  final int rating;
  final int points;
  final int gamesPlayed;
  final int wins;
  final int losses;
  final double winRate;
  final String? clubName;
  final int rank;
  
  // Additional properties for UI
  int get spaPoints => points;
  bool get isCurrentUser => false; // Will be set by UI logic
  String get tier => _getTier();

  LeaderboardEntry({
    required this.userId,
    required this.displayName,
    this.avatarUrl,
    required this.rating,
    required this.points,
    required this.gamesPlayed,
    required this.wins,
    required this.losses,
    required this.winRate,
    this.clubName,
    required this.rank,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      userId: json['user_id'],
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      rating: json['rating'] ?? 0,
      points: json['points'] ?? 0,
      gamesPlayed: json['games_played'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      clubName: json['club_name'],
      rank: json['rank'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'rating': rating,
      'points': points,
      'games_played': gamesPlayed,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'club_name': clubName,
      'rank': rank,
    };
  }

  String _getTier() {
    if (rating >= 2000) return 'Diamond';
    if (rating >= 1500) return 'Gold';
    if (rating >= 1200) return 'Silver';
    return 'Bronze';
  }
}
