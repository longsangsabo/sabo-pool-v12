import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/ranking.dart';

/// Flutter service wrapper for shared ranking business logic
/// Integrates with packages/shared-business/src/ranking/*
class RankingService {
  static const String baseUrl = 'http://localhost:3000/api';

  /// Get ELO rating for a user using shared business logic
  static Future<ELORating?> getELORating(String userId) async {
    try {
      // Mock implementation for now
      return ELORating(
        userId: userId,
        rating: 1450,
        gamesPlayed: 25,
        wins: 18,
        losses: 7,
        peak: 1520,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      print('Error getting ELO rating: $e');
      return null;
    }
  }

  /// Get SPA points for a user using shared business logic
  static Future<SPAPoints?> getSPAPoints(String userId) async {
    try {
      // Mock implementation for now
      return SPAPoints(
        userId: userId,
        points: 2800,
        gamesPlayed: 25,
        perfectGames: 5,
        averageScore: 85.5,
        peak: 3200,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      print('Error getting SPA points: $e');
      return null;
    }
  }

  /// Get all rank tiers using shared business logic
  static Future<List<RankTier>> getRankTiers() async {
    try {
      // Mock implementation for now
      return [
        RankTier(
          name: 'Bronze',
          minRating: 800,
          maxRating: 1199,
          iconUrl: 'https://example.com/bronze.png',
          color: '#CD7F32',
          description: 'Bronze tier for beginners',
        ),
        RankTier(
          name: 'Silver',
          minRating: 1200,
          maxRating: 1499,
          iconUrl: 'https://example.com/silver.png',
          color: '#C0C0C0',
          description: 'Silver tier for intermediate players',
        ),
        RankTier(
          name: 'Gold',
          minRating: 1500,
          maxRating: 1999,
          iconUrl: 'https://example.com/gold.png',
          color: '#FFD700',
          description: 'Gold tier for advanced players',
        ),
      ];
    } catch (e) {
      print('Error getting rank tiers: $e');
      return [];
    }
  }

  /// Get ELO leaderboard using shared business logic
  static Future<List<LeaderboardEntry>> getELOLeaderboard({
    int limit = 100,
    int offset = 0,
  }) async {
    try {
      // Mock implementation for now
      return [
        LeaderboardEntry(
          userId: 'user1',
          displayName: 'Pro Player',
          avatarUrl: null,
          rating: 2100,
          points: 4500,
          gamesPlayed: 150,
          wins: 120,
          losses: 30,
          winRate: 80.0,
          clubName: 'Elite Club',
          rank: 1,
        ),
        LeaderboardEntry(
          userId: 'user2',
          displayName: 'Good Player',
          avatarUrl: null,
          rating: 1890,
          points: 3800,
          gamesPlayed: 120,
          wins: 85,
          losses: 35,
          winRate: 70.8,
          clubName: 'Rising Stars',
          rank: 2,
        ),
      ];
    } catch (e) {
      print('Error getting ELO leaderboard: $e');
      return [];
    }
  }

  /// Get SPA leaderboard using shared business logic
  static Future<List<LeaderboardEntry>> getSPALeaderboard({
    int limit = 100,
    int offset = 0,
  }) async {
    try {
      // Mock implementation - same as ELO for now
      return getELOLeaderboard(limit: limit, offset: offset);
    } catch (e) {
      print('Error getting SPA leaderboard: $e');
      return [];
    }
  }

  /// Helper methods for backwards compatibility
  static Future<ELORating?> getUserELO(String userId) async {
    return getELORating(userId);
  }

  static Future<SPAPoints?> getUserSPA(String userId) async {
    return getSPAPoints(userId);
  }

  static Future<int> getUserRankingPosition(String userId) async {
    // Mock implementation
    return 25;
  }
}
