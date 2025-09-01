import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase/supabase_service.dart';

class DataService {
  static SupabaseClient get _client => SupabaseService.client;

  // Tournament Data
  static Future<List<Map<String, dynamic>>> getTournaments() async {
    try {
      final response = await _client
          .from('tournaments')
          .select('''
            *,
            tournament_participants(count)
          ''')
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy danh sách giải đấu: $e');
    }
  }

  // Club Data
  static Future<List<Map<String, dynamic>>> getClubs() async {
    try {
      final response = await _client
          .from('clubs')
          .select('''
            *,
            club_members(count)
          ''')
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy danh sách câu lạc bộ: $e');
    }
  }

  // Challenge Data
  static Future<List<Map<String, dynamic>>> getChallenges() async {
    try {
      final response = await _client
          .from('challenges')
          .select('''
            *,
            challenger:users!challenges_challenger_id_fkey(id, full_name, avatar_url),
            challenged:users!challenges_challenged_id_fkey(id, full_name, avatar_url)
          ''')
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy danh sách thử thách: $e');
    }
  }

  // User Stats
  static Future<Map<String, dynamic>?> getUserStats(String userId) async {
    try {
      final response = await _client
          .from('users')
          .select('''
            *,
            match_participants(
              matches(
                id,
                status,
                match_type,
                started_at,
                ended_at
              )
            )
          ''')
          .eq('id', userId)
          .single();

      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Lỗi lấy thống kê người dùng: $e');
    }
  }

  // User Ranking
  static Future<Map<String, dynamic>?> getUserRanking(String userId) async {
    try {
      final response = await _client
          .from('user_rankings')
          .select('*')
          .eq('user_id', userId)
          .single();

      return response as Map<String, dynamic>;
    } catch (e) {
      // Người dùng chưa có ranking, trả về null
      return null;
    }
  }

  // SPA Balance
  static Future<double> getSpaBalance(String userId) async {
    try {
      final response = await _client
          .from('spa_transactions')
          .select('amount')
          .eq('user_id', userId);

      final transactions = List<Map<String, dynamic>>.from(response);
      double balance = 0;
      
      for (final transaction in transactions) {
        balance += (transaction['amount'] as num).toDouble();
      }

      return balance;
    } catch (e) {
      throw Exception('Lỗi lấy số dư SPA: $e');
    }
  }

  // Recent Matches
  static Future<List<Map<String, dynamic>>> getRecentMatches(String userId, {int limit = 10}) async {
    try {
      final response = await _client
          .from('match_participants')
          .select('''
            *,
            matches(
              *,
              player1:users!matches_player1_id_fkey(id, full_name, avatar_url),
              player2:users!matches_player2_id_fkey(id, full_name, avatar_url)
            )
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .limit(limit);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy lịch sử trận đấu: $e');
    }
  }

  // Leaderboard
  static Future<List<Map<String, dynamic>>> getLeaderboard({int limit = 50}) async {
    try {
      final response = await _client
          .from('user_rankings')
          .select('''
            *,
            users(id, full_name, avatar_url, current_rank)
          ''')
          .order('ranking_position')
          .limit(limit);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy bảng xếp hạng: $e');
    }
  }

  // Join Tournament
  static Future<void> joinTournament(String tournamentId, String userId) async {
    try {
      await _client.from('tournament_participants').insert({
        'tournament_id': tournamentId,
        'user_id': userId,
        'joined_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Lỗi tham gia giải đấu: $e');
    }
  }

  // Join Club
  static Future<void> joinClub(String clubId, String userId) async {
    try {
      await _client.from('club_members').insert({
        'club_id': clubId,
        'user_id': userId,
        'joined_at': DateTime.now().toIso8601String(),
        'role': 'member',
      });
    } catch (e) {
      throw Exception('Lỗi tham gia câu lạc bộ: $e');
    }
  }

  // Create Challenge
  static Future<void> createChallenge({
    required String challengerId,
    required String opponentUserId,
    required String gameType,
    required double stakeAmount,
  }) async {
    try {
      await _client.from('challenges').insert({
        'challenger_id': challengerId,
        'challenged_id': opponentUserId,
        'challenge_type': gameType,
        'bet_amount': stakeAmount.toInt(),
        'status': 'pending',
        'created_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      throw Exception('Lỗi tạo thử thách: $e');
    }
  }

  // Update User Profile
  static Future<void> updateUserProfile(String userId, Map<String, dynamic> updates) async {
    try {
      await _client
          .from('users')
          .update({
            ...updates,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', userId);
    } catch (e) {
      throw Exception('Lỗi cập nhật hồ sơ: $e');
    }
  }

  // Get User Tournaments
  static Future<List<Map<String, dynamic>>> getUserTournaments(String userId) async {
    try {
      final response = await _client
          .from('tournament_participants')
          .select('''
            tournaments(*)
          ''')
          .eq('user_id', userId);

      return (response as List)
          .map((item) => item['tournaments'] as Map<String, dynamic>)
          .toList();
    } catch (e) {
      throw Exception('Lỗi lấy giải đấu của user: $e');
    }
  }

  // Get User Clubs
  static Future<List<Map<String, dynamic>>> getUserClubs(String userId) async {
    try {
      final response = await _client
          .from('club_members')
          .select('''
            clubs(*)
          ''')
          .eq('user_id', userId);

      return (response as List)
          .map((item) => item['clubs'] as Map<String, dynamic>)
          .toList();
    } catch (e) {
      throw Exception('Lỗi lấy club của user: $e');
    }
  }

  // Get User Statistics
  static Future<Map<String, dynamic>> getUserStatistics(String userId) async {
    try {
      final response = await _client
          .from('users')
          .select('wins, losses, total_matches, ranking_points, sabo_balance')
          .eq('id', userId)
          .single();

      return response;
    } catch (e) {
      throw Exception('Lỗi lấy thống kê user: $e');
    }
  }

  // Get Rankings
  static Future<List<Map<String, dynamic>>> getRankings() async {
    try {
      final response = await _client
          .from('users')
          .select('id, full_name, ranking_points, wins, losses')
          .order('ranking_points', ascending: false)
          .limit(50);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Lỗi lấy bảng xếp hạng: $e');
    }
  }

  // Get User Profile
  static Future<Map<String, dynamic>> getUserProfile(String userId) async {
    try {
      final response = await _client
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

      return response;
    } catch (e) {
      throw Exception('Lỗi lấy hồ sơ user: $e');
    }
  }
}
