/**
 * Challenge Service for Flutter
 * Interfaces with shared challenge business logic via API calls
 */

import 'api/api_service.dart';
import '../types/challenge.dart';

class ChallengeQuery {
  final int page;
  final int limit;
  final String? status;
  final String? category;
  final String? difficulty;

  ChallengeQuery({
    this.page = 1,
    this.limit = 10,
    this.status,
    this.category,
    this.difficulty,
  });

  Map<String, String> toQueryParams() {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (status != null) params['status'] = status!;
    if (category != null) params['category'] = category!;
    if (difficulty != null) params['difficulty'] = difficulty!;

    return params;
  }
}

class ChallengeService {
  final APIService _apiService = apiService;

  /**
   * Get all challenges with filtering
   */
  Future<APIResponse<List<Challenge>>> getChallenges({
    ChallengeQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? ChallengeQuery().toQueryParams();
    
    return await _apiService.get<List<Challenge>>(
      '/api/challenges',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Challenge.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get challenge by ID
   */
  Future<APIResponse<Challenge>> getChallengeById(String challengeId) async {
    return await _apiService.get<Challenge>(
      '/api/challenges/$challengeId',
      fromJson: (data) => Challenge.fromJson(data),
    );
  }

  /**
   * Create new challenge
   */
  Future<APIResponse<Challenge>> createChallenge(
    Map<String, dynamic> challengeData,
  ) async {
    return await _apiService.post<Challenge>(
      '/api/challenges',
      body: challengeData,
      fromJson: (data) => Challenge.fromJson(data),
    );
  }

  /**
   * Accept challenge
   */
  Future<APIResponse<ChallengeMatch>> acceptChallenge(
    String challengeId,
    String userId,
  ) async {
    return await _apiService.post<ChallengeMatch>(
      '/api/challenges/$challengeId/accept',
      body: {'userId': userId},
      fromJson: (data) => ChallengeMatch.fromJson(data),
    );
  }

  /**
   * Decline challenge
   */
  Future<APIResponse<Map<String, dynamic>>> declineChallenge(
    String challengeId,
    String userId,
    String? reason,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/challenges/$challengeId/decline',
      body: {
        'userId': userId,
        'reason': reason,
      },
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Complete challenge match
   */
  Future<APIResponse<ChallengeMatch>> completeChallenge(
    String challengeId,
    Map<String, dynamic> result,
  ) async {
    return await _apiService.post<ChallengeMatch>(
      '/api/challenges/$challengeId/complete',
      body: result,
      fromJson: (data) => ChallengeMatch.fromJson(data),
    );
  }

  /**
   * Get player's sent challenges
   */
  Future<APIResponse<List<Challenge>>> getSentChallenges(
    String userId, {
    ChallengeQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? ChallengeQuery().toQueryParams();
    
    return await _apiService.get<List<Challenge>>(
      '/api/players/$userId/challenges/sent',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Challenge.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get player's received challenges
   */
  Future<APIResponse<List<Challenge>>> getReceivedChallenges(
    String userId, {
    ChallengeQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? ChallengeQuery().toQueryParams();
    
    return await _apiService.get<List<Challenge>>(
      '/api/players/$userId/challenges/received',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Challenge.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get challenge match history
   */
  Future<APIResponse<List<ChallengeMatch>>> getChallengeHistory(
    String userId, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _apiService.get<List<ChallengeMatch>>(
      '/api/players/$userId/challenges/history',
      queryParams: {
        'page': page.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => ChallengeMatch.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get suggested opponents
   */
  Future<APIResponse<List<ChallengeOpponent>>> getSuggestedOpponents(
    String userId, {
    int limit = 10,
  }) async {
    return await _apiService.get<List<ChallengeOpponent>>(
      '/api/players/$userId/challenges/suggestions',
      queryParams: {
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => ChallengeOpponent.fromJson(item))
          .toList(),
    );
  }

  /**
   * Search potential opponents
   */
  Future<APIResponse<List<ChallengeOpponent>>> searchOpponents(
    String query, {
    String? skillLevel,
    String? location,
    int page = 1,
    int limit = 10,
  }) async {
    final queryParams = {
      'q': query,
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (skillLevel != null) queryParams['skill_level'] = skillLevel;
    if (location != null) queryParams['location'] = location;

    return await _apiService.get<List<ChallengeOpponent>>(
      '/api/challenges/opponents/search',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => ChallengeOpponent.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get challenge statistics
   */
  Future<APIResponse<ChallengeStats>> getChallengeStats(
    String userId,
  ) async {
    return await _apiService.get<ChallengeStats>(
      '/api/players/$userId/challenges/stats',
      fromJson: (data) => ChallengeStats.fromJson(data),
    );
  }
}

// Singleton instance
final ChallengeService challengeService = ChallengeService();
