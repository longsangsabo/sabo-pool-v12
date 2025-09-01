/**
 * Tournament Service for Flutter
 * Interfaces with shared business logic via API calls
 */

import 'api/api_service.dart';
import '../types/tournament.dart';

class TournamentQuery {
  final int page;
  final int limit;
  final String? status;

  TournamentQuery({
    this.page = 1,
    this.limit = 10,
    this.status,
  });

  Map<String, String> toQueryParams() {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };

    if (status != null) {
      params['status'] = status!;
    }

    return params;
  }
}

class TournamentService {
  final APIService _apiService = apiService;

  /**
   * Get all tournaments with pagination
   */
  Future<APIResponse<List<Tournament>>> getTournaments({
    TournamentQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? TournamentQuery().toQueryParams();
    
    return await _apiService.get<List<Tournament>>(
      '/api/tournaments',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Tournament.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get tournament by ID
   */
  Future<APIResponse<Tournament>> getTournamentById(String tournamentId) async {
    return await _apiService.get<Tournament>(
      '/api/tournaments/$tournamentId',
      fromJson: (data) => Tournament.fromJson(data),
    );
  }

  /**
   * Create new tournament
   */
  Future<APIResponse<Tournament>> createTournament(
    Map<String, dynamic> tournamentData,
  ) async {
    return await _apiService.post<Tournament>(
      '/api/tournaments',
      body: tournamentData,
      fromJson: (data) => Tournament.fromJson(data),
    );
  }

  /**
   * Update tournament
   */
  Future<APIResponse<Tournament>> updateTournament(
    String tournamentId,
    Map<String, dynamic> updateData,
  ) async {
    return await _apiService.put<Tournament>(
      '/api/tournaments/$tournamentId',
      body: updateData,
      fromJson: (data) => Tournament.fromJson(data),
    );
  }

  /**
   * Register player to tournament
   */
  Future<APIResponse<Map<String, dynamic>>> registerPlayer(
    String tournamentId,
    String userId,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/tournaments/$tournamentId/register',
      body: {'userId': userId},
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Get tournament bracket
   */
  Future<APIResponse<TournamentBracket>> getTournamentBracket(
    String tournamentId,
  ) async {
    return await _apiService.get<TournamentBracket>(
      '/api/tournaments/$tournamentId/bracket',
      fromJson: (data) => TournamentBracket.fromJson(data),
    );
  }

  /**
   * Start tournament
   */
  Future<APIResponse<Map<String, dynamic>>> startTournament(
    String tournamentId,
  ) async {
    return await _apiService.post<Map<String, dynamic>>(
      '/api/tournaments/$tournamentId/start',
      fromJson: (data) => data as Map<String, dynamic>,
    );
  }

  /**
   * Get player's tournaments
   */
  Future<APIResponse<List<Tournament>>> getPlayerTournaments(
    String userId, {
    TournamentQuery? query,
  }) async {
    final queryParams = query?.toQueryParams() ?? TournamentQuery().toQueryParams();
    queryParams['userId'] = userId;
    
    return await _apiService.get<List<Tournament>>(
      '/api/players/$userId/tournaments',
      queryParams: queryParams,
      fromJson: (data) => (data as List)
          .map((item) => Tournament.fromJson(item))
          .toList(),
    );
  }

  /**
   * Get tournament matches
   */
  Future<APIResponse<List<TournamentMatch>>> getTournamentMatches(
    String tournamentId, {
    int page = 1,
    int limit = 10,
  }) async {
    return await _apiService.get<List<TournamentMatch>>(
      '/api/tournaments/$tournamentId/matches',
      queryParams: {
        'page': page.toString(),
        'limit': limit.toString(),
      },
      fromJson: (data) => (data as List)
          .map((item) => TournamentMatch.fromJson(item))
          .toList(),
    );
  }

  /**
   * Update match result
   */
  Future<APIResponse<TournamentMatch>> updateMatchResult(
    String tournamentId,
    String matchId,
    Map<String, dynamic> result,
  ) async {
    return await _apiService.put<TournamentMatch>(
      '/api/tournaments/$tournamentId/matches/$matchId',
      body: result,
      fromJson: (data) => TournamentMatch.fromJson(data),
    );
  }
}

// Singleton instance
final TournamentService tournamentService = TournamentService();
