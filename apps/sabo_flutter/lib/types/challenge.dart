/**
 * Challenge Types for Flutter
 * Mirror of TypeScript challenge types from shared business logic
 */

class Challenge {
  final String id;
  final String challengerId;
  final String challengerName;
  final String? challengerAvatar;
  final String? challengedId;
  final String? challengedName;
  final String? challengedAvatar;
  final String status;
  final String gameType;
  final String? difficulty;
  final double? wager;
  final String? location;
  final DateTime? scheduledTime;
  final String? message;
  final Map<String, dynamic>? rules;
  final DateTime createdAt;
  final DateTime? respondedAt;
  final DateTime? completedAt;

  Challenge({
    required this.id,
    required this.challengerId,
    required this.challengerName,
    this.challengerAvatar,
    this.challengedId,
    this.challengedName,
    this.challengedAvatar,
    required this.status,
    required this.gameType,
    this.difficulty,
    this.wager,
    this.location,
    this.scheduledTime,
    this.message,
    this.rules,
    required this.createdAt,
    this.respondedAt,
    this.completedAt,
  });

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] ?? '',
      challengerId: json['challenger_id'] ?? '',
      challengerName: json['challenger_name'] ?? '',
      challengerAvatar: json['challenger_avatar'],
      challengedId: json['challenged_id'],
      challengedName: json['challenged_name'],
      challengedAvatar: json['challenged_avatar'],
      status: json['status'] ?? 'pending',
      gameType: json['game_type'] ?? 'pool',
      difficulty: json['difficulty'],
      wager: json['wager']?.toDouble(),
      location: json['location'],
      scheduledTime: json['scheduled_time'] != null 
          ? DateTime.parse(json['scheduled_time']) 
          : null,
      message: json['message'],
      rules: json['rules'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      respondedAt: json['responded_at'] != null 
          ? DateTime.parse(json['responded_at']) 
          : null,
      completedAt: json['completed_at'] != null 
          ? DateTime.parse(json['completed_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'challenger_id': challengerId,
      'challenger_name': challengerName,
      'challenger_avatar': challengerAvatar,
      'challenged_id': challengedId,
      'challenged_name': challengedName,
      'challenged_avatar': challengedAvatar,
      'status': status,
      'game_type': gameType,
      'difficulty': difficulty,
      'wager': wager,
      'location': location,
      'scheduled_time': scheduledTime?.toIso8601String(),
      'message': message,
      'rules': rules,
      'created_at': createdAt.toIso8601String(),
      'responded_at': respondedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
    };
  }
}

class ChallengeMatch {
  final String id;
  final String challengeId;
  final String player1Id;
  final String player1Name;
  final String player2Id;
  final String player2Name;
  final String status;
  final String gameType;
  final String? winnerId;
  final int? player1Score;
  final int? player2Score;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? venue;
  final Map<String, dynamic>? matchData;
  final List<ChallengeMatchFrame>? frames;

  ChallengeMatch({
    required this.id,
    required this.challengeId,
    required this.player1Id,
    required this.player1Name,
    required this.player2Id,
    required this.player2Name,
    required this.status,
    required this.gameType,
    this.winnerId,
    this.player1Score,
    this.player2Score,
    this.startTime,
    this.endTime,
    this.venue,
    this.matchData,
    this.frames,
  });

  factory ChallengeMatch.fromJson(Map<String, dynamic> json) {
    return ChallengeMatch(
      id: json['id'] ?? '',
      challengeId: json['challenge_id'] ?? '',
      player1Id: json['player1_id'] ?? '',
      player1Name: json['player1_name'] ?? '',
      player2Id: json['player2_id'] ?? '',
      player2Name: json['player2_name'] ?? '',
      status: json['status'] ?? 'pending',
      gameType: json['game_type'] ?? 'pool',
      winnerId: json['winner_id'],
      player1Score: json['player1_score'],
      player2Score: json['player2_score'],
      startTime: json['start_time'] != null 
          ? DateTime.parse(json['start_time']) 
          : null,
      endTime: json['end_time'] != null 
          ? DateTime.parse(json['end_time']) 
          : null,
      venue: json['venue'],
      matchData: json['match_data'],
      frames: json['frames'] != null 
          ? (json['frames'] as List)
              .map((frame) => ChallengeMatchFrame.fromJson(frame))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'challenge_id': challengeId,
      'player1_id': player1Id,
      'player1_name': player1Name,
      'player2_id': player2Id,
      'player2_name': player2Name,
      'status': status,
      'game_type': gameType,
      'winner_id': winnerId,
      'player1_score': player1Score,
      'player2_score': player2Score,
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'venue': venue,
      'match_data': matchData,
      'frames': frames?.map((frame) => frame.toJson()).toList(),
    };
  }
}

class ChallengeMatchFrame {
  final int frameNumber;
  final String? winnerId;
  final int? player1Score;
  final int? player2Score;
  final Duration? duration;
  final String? breakerId;

  ChallengeMatchFrame({
    required this.frameNumber,
    this.winnerId,
    this.player1Score,
    this.player2Score,
    this.duration,
    this.breakerId,
  });

  factory ChallengeMatchFrame.fromJson(Map<String, dynamic> json) {
    return ChallengeMatchFrame(
      frameNumber: json['frame_number'] ?? 0,
      winnerId: json['winner_id'],
      player1Score: json['player1_score'],
      player2Score: json['player2_score'],
      duration: json['duration'] != null 
          ? Duration(seconds: json['duration']) 
          : null,
      breakerId: json['breaker_id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'frame_number': frameNumber,
      'winner_id': winnerId,
      'player1_score': player1Score,
      'player2_score': player2Score,
      'duration': duration?.inSeconds,
      'breaker_id': breakerId,
    };
  }
}

class ChallengeOpponent {
  final String userId;
  final String displayName;
  final String? avatarUrl;
  final String skillLevel;
  final int eloRating;
  final int spaPoints;
  final String currentRank;
  final String? location;
  final double? distance;
  final bool isOnline;
  final DateTime? lastActiveAt;
  final ChallengeOpponentStats stats;

  ChallengeOpponent({
    required this.userId,
    required this.displayName,
    this.avatarUrl,
    required this.skillLevel,
    required this.eloRating,
    required this.spaPoints,
    required this.currentRank,
    this.location,
    this.distance,
    required this.isOnline,
    this.lastActiveAt,
    required this.stats,
  });

  factory ChallengeOpponent.fromJson(Map<String, dynamic> json) {
    return ChallengeOpponent(
      userId: json['user_id'] ?? '',
      displayName: json['display_name'] ?? '',
      avatarUrl: json['avatar_url'],
      skillLevel: json['skill_level'] ?? 'beginner',
      eloRating: json['elo_rating'] ?? 1200,
      spaPoints: json['spa_points'] ?? 0,
      currentRank: json['current_rank'] ?? 'Bronze',
      location: json['location'],
      distance: json['distance']?.toDouble(),
      isOnline: json['is_online'] ?? false,
      lastActiveAt: json['last_active_at'] != null 
          ? DateTime.parse(json['last_active_at']) 
          : null,
      stats: ChallengeOpponentStats.fromJson(json['stats'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'skill_level': skillLevel,
      'elo_rating': eloRating,
      'spa_points': spaPoints,
      'current_rank': currentRank,
      'location': location,
      'distance': distance,
      'is_online': isOnline,
      'last_active_at': lastActiveAt?.toIso8601String(),
      'stats': stats.toJson(),
    };
  }
}

class ChallengeOpponentStats {
  final int totalChallenges;
  final int wins;
  final int losses;
  final double winRate;
  final int currentStreak;

  ChallengeOpponentStats({
    required this.totalChallenges,
    required this.wins,
    required this.losses,
    required this.winRate,
    required this.currentStreak,
  });

  factory ChallengeOpponentStats.fromJson(Map<String, dynamic> json) {
    return ChallengeOpponentStats(
      totalChallenges: json['total_challenges'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      currentStreak: json['current_streak'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'total_challenges': totalChallenges,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'current_streak': currentStreak,
    };
  }
}

class ChallengeStats {
  final String userId;
  final int totalSent;
  final int totalReceived;
  final int totalAccepted;
  final int totalDeclined;
  final int totalCompleted;
  final int wins;
  final int losses;
  final double winRate;
  final int currentStreak;
  final int bestStreak;
  final Map<String, int> gameTypeStats;

  ChallengeStats({
    required this.userId,
    required this.totalSent,
    required this.totalReceived,
    required this.totalAccepted,
    required this.totalDeclined,
    required this.totalCompleted,
    required this.wins,
    required this.losses,
    required this.winRate,
    required this.currentStreak,
    required this.bestStreak,
    required this.gameTypeStats,
  });

  factory ChallengeStats.fromJson(Map<String, dynamic> json) {
    return ChallengeStats(
      userId: json['user_id'] ?? '',
      totalSent: json['total_sent'] ?? 0,
      totalReceived: json['total_received'] ?? 0,
      totalAccepted: json['total_accepted'] ?? 0,
      totalDeclined: json['total_declined'] ?? 0,
      totalCompleted: json['total_completed'] ?? 0,
      wins: json['wins'] ?? 0,
      losses: json['losses'] ?? 0,
      winRate: (json['win_rate'] ?? 0.0).toDouble(),
      currentStreak: json['current_streak'] ?? 0,
      bestStreak: json['best_streak'] ?? 0,
      gameTypeStats: Map<String, int>.from(json['game_type_stats'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'total_sent': totalSent,
      'total_received': totalReceived,
      'total_accepted': totalAccepted,
      'total_declined': totalDeclined,
      'total_completed': totalCompleted,
      'wins': wins,
      'losses': losses,
      'win_rate': winRate,
      'current_streak': currentStreak,
      'best_streak': bestStreak,
      'game_type_stats': gameTypeStats,
    };
  }
}

// Challenge Status Constants
class ChallengeStatus {
  static const String pending = 'pending';
  static const String accepted = 'accepted';
  static const String declined = 'declined';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';
  static const String expired = 'expired';
}

// Challenge Match Status Constants
class ChallengeMatchStatus {
  static const String scheduled = 'scheduled';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';
}

// Game Type Constants
class ChallengeGameType {
  static const String pool8Ball = '8_ball';
  static const String pool9Ball = '9_ball';
  static const String snooker = 'snooker';
  static const String carom = 'carom';
}

// Difficulty Level Constants
class ChallengeDifficulty {
  static const String easy = 'easy';
  static const String medium = 'medium';
  static const String hard = 'hard';
  static const String expert = 'expert';
}
