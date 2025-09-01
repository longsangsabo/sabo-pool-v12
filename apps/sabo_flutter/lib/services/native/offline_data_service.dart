import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../bridge/shared_services_bridge.dart';

part 'offline_data_service.g.dart';

/// Offline data service for caching and sync functionality
/// Integrates with shared business logic for data management
class OfflineDataService {
  static const String _tag = 'OfflineDataService';
  
  bool _isInitialized = false;
  final SharedServicesBridge _bridge = SharedServicesBridge.instance;
  
  /// Initialize offline data service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize shared services bridge
      await _bridge.initialize();
      
      // Initialize shared offline data service
      await _bridge.callOfflineDataService('initialize', {
        'storage_type': 'sqlite',
        'max_cache_size': 100 * 1024 * 1024, // 100MB
        'sync_interval': 30000, // 30 seconds
      });
      
      _isInitialized = true;
      debugPrint('$_tag: Initialized successfully with shared logic');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize - $e');
      rethrow;
    }
  }
  
  /// Cache tournament data offline
  Future<void> cacheTournamentData(String tournamentId, Map<String, dynamic> data) async {
    if (!_isInitialized) await initialize();
    
    try {
      await _bridge.callOfflineDataService('cacheData', {
        'collection': 'tournaments',
        'id': tournamentId,
        'data': data,
        'priority': 'high',
      });
      debugPrint('$_tag: Tournament data cached for $tournamentId');
    } catch (e) {
      debugPrint('$_tag: Failed to cache tournament data - $e');
    }
  }
  
  /// Get cached tournament data
  Future<Map<String, dynamic>?> getCachedTournamentData(String tournamentId) async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _bridge.callOfflineDataService('getData', {
        'collection': 'tournaments',
        'id': tournamentId,
      });
      
      if (result != null && result['data'] != null) {
        debugPrint('$_tag: Retrieved cached tournament data for $tournamentId');
        return Map<String, dynamic>.from(result['data']);
      }
      
      return null;
    } catch (e) {
      debugPrint('$_tag: Failed to get cached tournament data - $e');
      return null;
    }
  }
  
  /// Cache user profile data
  Future<void> cacheUserProfile(String userId, Map<String, dynamic> profile) async {
    if (!_isInitialized) await initialize();
    
    try {
      await _bridge.callOfflineDataService('cacheData', {
        'collection': 'user_profiles',
        'id': userId,
        'data': profile,
        'priority': 'medium',
      });
      debugPrint('$_tag: User profile cached for $userId');
    } catch (e) {
      debugPrint('$_tag: Failed to cache user profile - $e');
    }
  }
  
  /// Get cached user profile
  Future<Map<String, dynamic>?> getCachedUserProfile(String userId) async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _bridge.callOfflineDataService('getData', {
        'collection': 'user_profiles',
        'id': userId,
      });
      
      if (result != null && result['data'] != null) {
        debugPrint('$_tag: Retrieved cached user profile for $userId');
        return Map<String, dynamic>.from(result['data']);
      }
      
      return null;
    } catch (e) {
      debugPrint('$_tag: Failed to get cached user profile - $e');
      return null;
    }
  }
  
  /// Sync offline data with server
  Future<bool> syncData() async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _bridge.callOfflineDataService('syncAll', {
        'force_sync': false,
        'batch_size': 50,
      });
      
      bool success = result?['success'] ?? false;
      debugPrint('$_tag: Data sync ${success ? 'completed' : 'failed'}');
      return success;
    } catch (e) {
      debugPrint('$_tag: Failed to sync data - $e');
      return false;
    }
  }
  
  /// Check if device is online
  Future<bool> isOnline() async {
    try {
      final result = await _bridge.callOfflineDataService('getConnectionStatus', {});
      return result?['is_online'] ?? false;
    } catch (e) {
      debugPrint('$_tag: Failed to check online status - $e');
      return false;
    }
  }
  
  /// Get offline storage statistics
  Future<Map<String, dynamic>?> getStorageStats() async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _bridge.callOfflineDataService('getStorageStats', {});
      debugPrint('$_tag: Retrieved storage stats');
      return result;
    } catch (e) {
      debugPrint('$_tag: Failed to get storage stats - $e');
      return null;
    }
  }
  
  /// Clear cached data
  Future<void> clearCache({String? collection}) async {
    if (!_isInitialized) await initialize();
    
    try {
      await _bridge.callOfflineDataService('clearCache', {
        if (collection != null) 'collection': collection,
      });
      debugPrint('$_tag: Cache cleared ${collection != null ? 'for $collection' : 'completely'}');
    } catch (e) {
      debugPrint('$_tag: Failed to clear cache - $e');
    }
  }
}

/// Provider for offline data service
@riverpod
OfflineDataService offlineDataService(OfflineDataServiceRef ref) {
  return OfflineDataService();
}
