class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String? avatar;
  final int eloRating;
  final String rank;
  final DateTime joinedDate;
  final List<String> achievements;
  final int tournamentsWon;
  final int totalMatches;
  final int winRate;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatar,
    this.eloRating = 1000,
    this.rank = 'Newcomer',
    required this.joinedDate,
    this.achievements = const [],
    this.tournamentsWon = 0,
    this.totalMatches = 0,
    this.winRate = 0,
  });

  String get displayName => name.isNotEmpty ? name : 'Người chơi';
  
  String get rankColor {
    switch (rank.toLowerCase()) {
      case 'newcomer':
        return '#9E9E9E'; // Grey
      case 'beginner':
        return '#4CAF50'; // Green
      case 'intermediate':
        return '#2196F3'; // Blue
      case 'advanced':
        return '#FF9800'; // Orange
      case 'expert':
        return '#F44336'; // Red
      case 'master':
        return '#9C27B0'; // Purple
      case 'grandmaster':
        return '#FFD700'; // Gold
      default:
        return '#9E9E9E';
    }
  }
  
  String get eloDescription {
    if (eloRating < 800) return 'Mới bắt đầu';
    if (eloRating < 1200) return 'Học việc';
    if (eloRating < 1600) return 'Trung bình';
    if (eloRating < 2000) return 'Khá';
    if (eloRating < 2400) return 'Giỏi';
    return 'Xuất sắc';
  }
  
  double get winRatePercentage => totalMatches > 0 ? (winRate / totalMatches) * 100 : 0.0;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'eloRating': eloRating,
      'rank': rank,
      'joinedDate': joinedDate.toIso8601String(),
      'achievements': achievements,
      'tournamentsWon': tournamentsWon,
      'totalMatches': totalMatches,
      'winRate': winRate,
    };
  }

  factory User.fromJson(String jsonString) {
    // Simple JSON parsing for demo
    return User(
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+84961167717',
      joinedDate: DateTime.now(),
    );
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    int? eloRating,
    String? rank,
    DateTime? joinedDate,
    List<String>? achievements,
    int? tournamentsWon,
    int? totalMatches,
    int? winRate,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      eloRating: eloRating ?? this.eloRating,
      rank: rank ?? this.rank,
      joinedDate: joinedDate ?? this.joinedDate,
      achievements: achievements ?? this.achievements,
      tournamentsWon: tournamentsWon ?? this.tournamentsWon,
      totalMatches: totalMatches ?? this.totalMatches,
      winRate: winRate ?? this.winRate,
    );
  }
}
