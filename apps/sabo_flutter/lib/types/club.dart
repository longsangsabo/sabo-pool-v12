/**
 * Club Types for Flutter
 * Mirror of TypeScript club types from shared business logic
 */

class Club {
  final String id;
  final String clubName;
  final String? displayName;
  final String? description;
  final String? address;
  final String? phone;
  final String? email;
  final String? website;
  final String ownerId;
  final String status;
  final String verificationStatus;
  final String? category;
  final String? location;
  final Map<String, dynamic>? contactInfo;
  final Map<String, dynamic>? operatingHours;
  final List<String>? amenities;
  final String? logoUrl;
  final double? rating;
  final int memberCount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Club({
    required this.id,
    required this.clubName,
    this.displayName,
    this.description,
    this.address,
    this.phone,
    this.email,
    this.website,
    required this.ownerId,
    required this.status,
    required this.verificationStatus,
    this.category,
    this.location,
    this.contactInfo,
    this.operatingHours,
    this.amenities,
    this.logoUrl,
    this.rating,
    required this.memberCount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Club.fromJson(Map<String, dynamic> json) {
    return Club(
      id: json['id'] ?? '',
      clubName: json['club_name'] ?? '',
      displayName: json['display_name'],
      description: json['description'],
      address: json['address'],
      phone: json['phone'],
      email: json['email'],
      website: json['website'],
      ownerId: json['user_id'] ?? json['owner_id'] ?? '',
      status: json['status'] ?? 'pending',
      verificationStatus: json['verification_status'] ?? 'unverified',
      category: json['category'],
      location: json['location'],
      contactInfo: json['contact_info'],
      operatingHours: json['operating_hours'],
      amenities: json['amenities']?.cast<String>(),
      logoUrl: json['logo_url'],
      rating: json['rating']?.toDouble(),
      memberCount: json['member_count'] ?? 0,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'club_name': clubName,
      'display_name': displayName,
      'description': description,
      'address': address,
      'phone': phone,
      'email': email,
      'website': website,
      'user_id': ownerId,
      'status': status,
      'verification_status': verificationStatus,
      'category': category,
      'location': location,
      'contact_info': contactInfo,
      'operating_hours': operatingHours,
      'amenities': amenities,
      'logo_url': logoUrl,
      'rating': rating,
      'member_count': memberCount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class ClubMember {
  final String userId;
  final String clubId;
  final String userName;
  final String? displayName;
  final String? avatarUrl;
  final String role;
  final String status;
  final DateTime joinedAt;
  final DateTime? lastActiveAt;

  ClubMember({
    required this.userId,
    required this.clubId,
    required this.userName,
    this.displayName,
    this.avatarUrl,
    required this.role,
    required this.status,
    required this.joinedAt,
    this.lastActiveAt,
  });

  factory ClubMember.fromJson(Map<String, dynamic> json) {
    return ClubMember(
      userId: json['user_id'] ?? '',
      clubId: json['club_id'] ?? '',
      userName: json['user_name'] ?? '',
      displayName: json['display_name'],
      avatarUrl: json['avatar_url'],
      role: json['role'] ?? 'member',
      status: json['status'] ?? 'active',
      joinedAt: DateTime.parse(json['joined_at'] ?? DateTime.now().toIso8601String()),
      lastActiveAt: json['last_active_at'] != null 
          ? DateTime.parse(json['last_active_at']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'club_id': clubId,
      'user_name': userName,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'role': role,
      'status': status,
      'joined_at': joinedAt.toIso8601String(),
      'last_active_at': lastActiveAt?.toIso8601String(),
    };
  }
}

class ClubTournament {
  final String id;
  final String clubId;
  final String name;
  final String? description;
  final String status;
  final int maxPlayers;
  final int currentPlayers;
  final double entryFee;
  final DateTime? startTime;
  final DateTime? registrationDeadline;

  ClubTournament({
    required this.id,
    required this.clubId,
    required this.name,
    this.description,
    required this.status,
    required this.maxPlayers,
    required this.currentPlayers,
    required this.entryFee,
    this.startTime,
    this.registrationDeadline,
  });

  factory ClubTournament.fromJson(Map<String, dynamic> json) {
    return ClubTournament(
      id: json['id'] ?? '',
      clubId: json['club_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'draft',
      maxPlayers: json['max_players'] ?? 16,
      currentPlayers: json['current_players'] ?? 0,
      entryFee: (json['entry_fee'] ?? 0).toDouble(),
      startTime: json['start_time'] != null 
          ? DateTime.parse(json['start_time']) 
          : null,
      registrationDeadline: json['registration_deadline'] != null 
          ? DateTime.parse(json['registration_deadline']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'club_id': clubId,
      'name': name,
      'description': description,
      'status': status,
      'max_players': maxPlayers,
      'current_players': currentPlayers,
      'entry_fee': entryFee,
      'start_time': startTime?.toIso8601String(),
      'registration_deadline': registrationDeadline?.toIso8601String(),
    };
  }
}

class ClubVerificationStatus {
  final String clubId;
  final String status;
  final String? reason;
  final List<ClubVerificationDocument> documents;
  final DateTime? submittedAt;
  final DateTime? reviewedAt;
  final String? reviewedBy;

  ClubVerificationStatus({
    required this.clubId,
    required this.status,
    this.reason,
    required this.documents,
    this.submittedAt,
    this.reviewedAt,
    this.reviewedBy,
  });

  factory ClubVerificationStatus.fromJson(Map<String, dynamic> json) {
    return ClubVerificationStatus(
      clubId: json['club_id'] ?? '',
      status: json['status'] ?? 'unverified',
      reason: json['reason'],
      documents: (json['documents'] as List? ?? [])
          .map((doc) => ClubVerificationDocument.fromJson(doc))
          .toList(),
      submittedAt: json['submitted_at'] != null 
          ? DateTime.parse(json['submitted_at']) 
          : null,
      reviewedAt: json['reviewed_at'] != null 
          ? DateTime.parse(json['reviewed_at']) 
          : null,
      reviewedBy: json['reviewed_by'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'club_id': clubId,
      'status': status,
      'reason': reason,
      'documents': documents.map((doc) => doc.toJson()).toList(),
      'submitted_at': submittedAt?.toIso8601String(),
      'reviewed_at': reviewedAt?.toIso8601String(),
      'reviewed_by': reviewedBy,
    };
  }
}

class ClubVerificationDocument {
  final String id;
  final String type;
  final String name;
  final String url;
  final String status;
  final String? notes;

  ClubVerificationDocument({
    required this.id,
    required this.type,
    required this.name,
    required this.url,
    required this.status,
    this.notes,
  });

  factory ClubVerificationDocument.fromJson(Map<String, dynamic> json) {
    return ClubVerificationDocument(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      name: json['name'] ?? '',
      url: json['url'] ?? '',
      status: json['status'] ?? 'pending',
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'name': name,
      'url': url,
      'status': status,
      'notes': notes,
    };
  }
}

// Club Status Constants
class ClubStatus {
  static const String pending = 'pending';
  static const String approved = 'approved';
  static const String rejected = 'rejected';
  static const String suspended = 'suspended';
}

// Club Verification Status Constants
class ClubVerificationStatusType {
  static const String unverified = 'unverified';
  static const String pending = 'pending';
  static const String verified = 'verified';
  static const String rejected = 'rejected';
}

// Club Member Role Constants
class ClubMemberRole {
  static const String member = 'member';
  static const String admin = 'admin';
  static const String owner = 'owner';
}

// Club Categories
class ClubCategory {
  static const String billiards = 'billiards';
  static const String pool = 'pool';
  static const String snooker = 'snooker';
  static const String mixed = 'mixed';
}
