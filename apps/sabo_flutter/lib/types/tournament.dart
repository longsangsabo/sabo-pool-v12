/**
 * Tournament Types for Flutter
 * Mirror of TypeScript tournament types from shared business logic
 */

class Tournament {
  final String id;
  final String name;
  final String? description;
  final String status;
  final String type;
  final int maxPlayers;
  final int currentPlayers;
  final double entryFee;
  final double prizePool;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? clubId;
  final String organizerId;
  final Map<String, dynamic>? settings;
  final DateTime createdAt;
  final DateTime updatedAt;

  Tournament({
    required this.id,
    required this.name,
    this.description,
    required this.status,
    required this.type,
    required this.maxPlayers,
    required this.currentPlayers,
    required this.entryFee,
    required this.prizePool,
    this.startTime,
    this.endTime,
    this.clubId,
    required this.organizerId,
    this.settings,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Tournament.fromJson(Map<String, dynamic> json) {
    return Tournament(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'draft',
      type: json['type'] ?? 'single_elimination',
      maxPlayers: json['max_players'] ?? 16,
      currentPlayers: json['current_players'] ?? 0,
      entryFee: (json['entry_fee'] ?? 0).toDouble(),
      prizePool: (json['prize_pool'] ?? 0).toDouble(),
      startTime: json['start_time'] != null 
          ? DateTime.parse(json['start_time']) 
          : null,
      endTime: json['end_time'] != null 
          ? DateTime.parse(json['end_time']) 
          : null,
      clubId: json['club_id'],
      organizerId: json['organizer_id'] ?? '',
      settings: json['settings'],
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'status': status,
      'type': type,
      'max_players': maxPlayers,
      'current_players': currentPlayers,
      'entry_fee': entryFee,
      'prize_pool': prizePool,
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'club_id': clubId,
      'organizer_id': organizerId,
      'settings': settings,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class TournamentBracket {
  final String tournamentId;
  final String type;
  final List<BracketRound> rounds;
  final Map<String, dynamic>? metadata;

  TournamentBracket({
    required this.tournamentId,
    required this.type,
    required this.rounds,
    this.metadata,
  });

  factory TournamentBracket.fromJson(Map<String, dynamic> json) {
    return TournamentBracket(
      tournamentId: json['tournament_id'] ?? '',
      type: json['type'] ?? 'single_elimination',
      rounds: (json['rounds'] as List? ?? [])
          .map((round) => BracketRound.fromJson(round))
          .toList(),
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tournament_id': tournamentId,
      'type': type,
      'rounds': rounds.map((round) => round.toJson()).toList(),
      'metadata': metadata,
    };
  }
}

class BracketRound {
  final int roundNumber;
  final String name;
  final List<TournamentMatch> matches;

  BracketRound({
    required this.roundNumber,
    required this.name,
    required this.matches,
  });

  factory BracketRound.fromJson(Map<String, dynamic> json) {
    return BracketRound(
      roundNumber: json['round_number'] ?? 0,
      name: json['name'] ?? '',
      matches: (json['matches'] as List? ?? [])
          .map((match) => TournamentMatch.fromJson(match))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'round_number': roundNumber,
      'name': name,
      'matches': matches.map((match) => match.toJson()).toList(),
    };
  }
}

class TournamentMatch {
  final String id;
  final String tournamentId;
  final int roundNumber;
  final int matchNumber;
  final String? player1Id;
  final String? player2Id;
  final String? player1Name;
  final String? player2Name;
  final String status;
  final String? winnerId;
  final int? player1Score;
  final int? player2Score;
  final DateTime? scheduledTime;
  final DateTime? startTime;
  final DateTime? endTime;
  final Map<String, dynamic>? metadata;

  TournamentMatch({
    required this.id,
    required this.tournamentId,
    required this.roundNumber,
    required this.matchNumber,
    this.player1Id,
    this.player2Id,
    this.player1Name,
    this.player2Name,
    required this.status,
    this.winnerId,
    this.player1Score,
    this.player2Score,
    this.scheduledTime,
    this.startTime,
    this.endTime,
    this.metadata,
  });

  factory TournamentMatch.fromJson(Map<String, dynamic> json) {
    return TournamentMatch(
      id: json['id'] ?? '',
      tournamentId: json['tournament_id'] ?? '',
      roundNumber: json['round_number'] ?? 0,
      matchNumber: json['match_number'] ?? 0,
      player1Id: json['player1_id'],
      player2Id: json['player2_id'],
      player1Name: json['player1_name'],
      player2Name: json['player2_name'],
      status: json['status'] ?? 'pending',
      winnerId: json['winner_id'],
      player1Score: json['player1_score'],
      player2Score: json['player2_score'],
      scheduledTime: json['scheduled_time'] != null 
          ? DateTime.parse(json['scheduled_time']) 
          : null,
      startTime: json['start_time'] != null 
          ? DateTime.parse(json['start_time']) 
          : null,
      endTime: json['end_time'] != null 
          ? DateTime.parse(json['end_time']) 
          : null,
      metadata: json['metadata'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tournament_id': tournamentId,
      'round_number': roundNumber,
      'match_number': matchNumber,
      'player1_id': player1Id,
      'player2_id': player2Id,
      'player1_name': player1Name,
      'player2_name': player2Name,
      'status': status,
      'winner_id': winnerId,
      'player1_score': player1Score,
      'player2_score': player2Score,
      'scheduled_time': scheduledTime?.toIso8601String(),
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'metadata': metadata,
    };
  }
}

// Tournament Status Constants
class TournamentStatus {
  static const String draft = 'draft';
  static const String open = 'open';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String cancelled = 'cancelled';
}

// Tournament Types
class TournamentType {
  static const String singleElimination = 'single_elimination';
  static const String doubleElimination = 'double_elimination';
  static const String roundRobin = 'round_robin';
  static const String swiss = 'swiss';
}

// Match Status Constants
class MatchStatus {
  static const String pending = 'pending';
  static const String ready = 'ready';
  static const String inProgress = 'in_progress';
  static const String completed = 'completed';
  static const String walkover = 'walkover';
}
