enum TournamentStatus {
  upcoming,
  ongoing,
  completed,
  cancelled,
}

enum TournamentType {
  singleElimination,
  doubleElimination,
  roundRobin,
  swiss,
}

class Tournament {
  final String id;
  final String name;
  final String description;
  final TournamentType type;
  final TournamentStatus status;
  final String organizerId;
  final String? clubId;
  
  // Tournament details
  final int maxParticipants;
  final int currentParticipants;
  final double entryFee;
  final double prizePool;
  final DateTime registrationStart;
  final DateTime registrationEnd;
  final DateTime startTime;
  final DateTime? endTime;
  
  // Location
  final String? venue;
  final String? address;
  final double? latitude;
  final double? longitude;
  
  // Rules and settings
  final String? rules;
  final int? gameMode; // 8-ball, 9-ball, etc.
  final bool isPublic;
  final bool allowSpectators;
  
  // Metadata
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String? imageUrl;
  final List<String> tags;

  const Tournament({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.status,
    required this.organizerId,
    this.clubId,
    required this.maxParticipants,
    this.currentParticipants = 0,
    this.entryFee = 0.0,
    this.prizePool = 0.0,
    required this.registrationStart,
    required this.registrationEnd,
    required this.startTime,
    this.endTime,
    this.venue,
    this.address,
    this.latitude,
    this.longitude,
    this.rules,
    this.gameMode,
    this.isPublic = true,
    this.allowSpectators = true,
    required this.createdAt,
    this.updatedAt,
    this.imageUrl,
    this.tags = const [],
  });

  factory Tournament.fromJson(Map<String, dynamic> json) {
    return Tournament(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      type: TournamentType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => TournamentType.singleElimination,
      ),
      status: TournamentStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TournamentStatus.upcoming,
      ),
      organizerId: json['organizer_id'] as String,
      clubId: json['club_id'] as String?,
      maxParticipants: (json['max_participants'] as num).toInt(),
      currentParticipants: (json['current_participants'] as num?)?.toInt() ?? 0,
      entryFee: (json['entry_fee'] as num?)?.toDouble() ?? 0.0,
      prizePool: (json['prize_pool'] as num?)?.toDouble() ?? 0.0,
      registrationStart: DateTime.parse(json['registration_start'] as String),
      registrationEnd: DateTime.parse(json['registration_end'] as String),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: json['end_time'] != null 
        ? DateTime.parse(json['end_time'] as String) 
        : null,
      venue: json['venue'] as String?,
      address: json['address'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      rules: json['rules'] as String?,
      gameMode: (json['game_mode'] as num?)?.toInt(),
      isPublic: json['is_public'] as bool? ?? true,
      allowSpectators: json['allow_spectators'] as bool? ?? true,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
        ? DateTime.parse(json['updated_at'] as String) 
        : null,
      imageUrl: json['image_url'] as String?,
      tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'type': type.name,
      'status': status.name,
      'organizer_id': organizerId,
      'club_id': clubId,
      'max_participants': maxParticipants,
      'current_participants': currentParticipants,
      'entry_fee': entryFee,
      'prize_pool': prizePool,
      'registration_start': registrationStart.toIso8601String(),
      'registration_end': registrationEnd.toIso8601String(),
      'start_time': startTime.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'venue': venue,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'rules': rules,
      'game_mode': gameMode,
      'is_public': isPublic,
      'allow_spectators': allowSpectators,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
      'image_url': imageUrl,
      'tags': tags,
    };
  }

  Tournament copyWith({
    String? id,
    String? name,
    String? description,
    TournamentType? type,
    TournamentStatus? status,
    String? organizerId,
    String? clubId,
    int? maxParticipants,
    int? currentParticipants,
    double? entryFee,
    double? prizePool,
    DateTime? registrationStart,
    DateTime? registrationEnd,
    DateTime? startTime,
    DateTime? endTime,
    String? venue,
    String? address,
    double? latitude,
    double? longitude,
    String? rules,
    int? gameMode,
    bool? isPublic,
    bool? allowSpectators,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? imageUrl,
    List<String>? tags,
  }) {
    return Tournament(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      organizerId: organizerId ?? this.organizerId,
      clubId: clubId ?? this.clubId,
      maxParticipants: maxParticipants ?? this.maxParticipants,
      currentParticipants: currentParticipants ?? this.currentParticipants,
      entryFee: entryFee ?? this.entryFee,
      prizePool: prizePool ?? this.prizePool,
      registrationStart: registrationStart ?? this.registrationStart,
      registrationEnd: registrationEnd ?? this.registrationEnd,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      venue: venue ?? this.venue,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      rules: rules ?? this.rules,
      gameMode: gameMode ?? this.gameMode,
      isPublic: isPublic ?? this.isPublic,
      allowSpectators: allowSpectators ?? this.allowSpectators,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      imageUrl: imageUrl ?? this.imageUrl,
      tags: tags ?? this.tags,
    );
  }

  bool get isRegistrationOpen {
    final now = DateTime.now();
    return now.isAfter(registrationStart) && 
           now.isBefore(registrationEnd) && 
           status == TournamentStatus.upcoming &&
           currentParticipants < maxParticipants;
  }

  bool get isFull => currentParticipants >= maxParticipants;

  String get statusDisplay {
    switch (status) {
      case TournamentStatus.upcoming:
        return 'Upcoming';
      case TournamentStatus.ongoing:
        return 'Live';
      case TournamentStatus.completed:
        return 'Completed';
      case TournamentStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get typeDisplay {
    switch (type) {
      case TournamentType.singleElimination:
        return 'Single Elimination';
      case TournamentType.doubleElimination:
        return 'Double Elimination';
      case TournamentType.roundRobin:
        return 'Round Robin';
      case TournamentType.swiss:
        return 'Swiss System';
    }
  }

  @override
  String toString() {
    return 'Tournament(id: $id, name: $name, status: $status, participants: $currentParticipants/$maxParticipants)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Tournament && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
