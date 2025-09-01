/**
 * Club Service for Flutter
 * Interfaces with shared club management business logic via API calls
 */

import 'api/api_service.dart';
import '../types/club.dart';

class ClubQuery {
  final int page;
  final int limit;
  final String? category;
  final String? location;
  final bool? verified;

  ClubQuery({
    this.page = 1,
    this.limit = 10,
    this.category,
    this.location,
    this.verified,
  });

  Map<String, String> toQueryParams() {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (category != null) params['category'] = category!;
    if (location != null) params['location'] = location!;
    if (verified != null) params['verified'] = verified.toString();

    return params;
  }
}

class ClubService {
  final APIService _apiService = apiService;

  /**
   * Get all clubs with filtering
   */
  Future<APIResponse<List<Club>>> getClubs({
    ClubQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? ClubQuery().toQueryParams();
    
    return await _apiService.get<List<Club>>(
      '/api/clubs',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Club.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get club by ID
   */
  Future<APIResponse<Club>> getClubById(String clubId) async {
    return await _apiService.get<Club>(
      '/api/clubs/$clubId',
      fromJson: (data) => Club.fromJson(data),
    );
  }

  /**
   * Create new club
   */
  Future<APIResponse<Club>> createClub(
    Map<String, dynamic> clubData,
  ) async {
    return await _apiService.post<Club>(
      '/api/clubs',
      body: clubData,
      fromJson: (data) => Club.fromJson(data),
    );
  }

  /**
   * Update club
   */
  Future<APIResponse<Club>> updateClub(
    String clubId,
    Map<String, dynamic> updateData,
  ) async {
    return await _apiService.put<Club>(
      '/api/clubs/$clubId',
      body: updateData,
      fromJson: (data) => Club.fromJson(data),
    );
  }

  /**
   * Join club
   */
  Future<APIResponse<Map<String, dynamic>>> joinClub(
    String clubId,
    String userId,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/clubs/$clubId/join',
      body: {'userId': userId},
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Leave club
   */
  Future<APIResponse<Map<String, dynamic>>> leaveClub(
    String clubId,
    String userId,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/clubs/$clubId/leave',
      body: {'userId': userId},
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Get club members
   */
  Future<APIResponse<List<ClubMember>>> getClubMembers(
    String clubId, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _apiService.get<List<ClubMember>>(
      '/api/clubs/$clubId/members',
      queryParams: {
        'page': page.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => ClubMember.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get club tournaments
   */
  Future<APIResponse<List<ClubTournament>>> getClubTournaments(
    String clubId, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _apiService.get<List<ClubTournament>>(
      '/api/clubs/$clubId/tournaments',
      queryParams: {
        'page': page.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => ClubTournament.fromJson(item))
          .toList(),
    );
  }

  /**
   * Request club verification
   */
  Future<APIResponse<Map<String, dynamic>>> requestVerification(
    String clubId,
    List<Map<String, dynamic>> documents,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/clubs/$clubId/verification',
      body: {'documents': documents},
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Get verification status
   */
  Future<APIResponse<ClubVerificationStatus>> getVerificationStatus(
    String clubId,
  ) async {
    return await _apiService.get<ClubVerificationStatus>(
      '/api/clubs/$clubId/verification/status',
      fromJson: (data) => ClubVerificationStatus.fromJson(data),
    );
  }

  /**
   * Get nearby clubs
   */
  Future<APIResponse<List<Club>>> getNearbyClubs(
    double latitude,
    double longitude, {
    double radiusKm = 10.0,
    int limit = 20,
  }) async {
    return await _apiService.get<List<Club>>(
      '/api/clubs/nearby',
      queryParams: {
        'lat': latitude.toString(),
        'lng': longitude.toString(),
        'radius': radiusKm.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => Club.fromJson(item))
          .toList(),
    );
  }

  /**
   * Search clubs
   */
  Future<APIResponse<List<Club>>> searchClubs(
    String query, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _apiService.get<List<Club>>(
      '/api/clubs/search',
      queryParams: {
        'q': query,
        'page': page.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => Club.fromJson(item))
          .toList(),
    );
  }
}

// Singleton instance
final ClubService clubService = ClubService();
