import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';

part 'cache_service.g.dart';

/// Cache strategy for different data types
enum CacheStrategy {
  memory,      // Keep in memory only
  persistent,  // Store on disk
  hybrid,      // Memory + disk with TTL
}

/// Cache entry with metadata
class CacheEntry<T> {
  final T data;
  final DateTime timestamp;
  final Duration? ttl;
  final String key;
  
  const CacheEntry({
    required this.data,
    required this.timestamp,
    required this.key,
    this.ttl,
  });
  
  bool get isExpired {
    if (ttl == null) return false;
    return DateTime.now().difference(timestamp) > ttl!;
  }
  
  Map<String, dynamic> toJson() => {
    'data': data,
    'timestamp': timestamp.toIso8601String(),
    'key': key,
    'ttl': ttl?.inMilliseconds,
  };
  
  factory CacheEntry.fromJson(Map<String, dynamic> json, T data) {
    return CacheEntry<T>(
      data: data,
      timestamp: DateTime.parse(json['timestamp']),
      key: json['key'],
      ttl: json['ttl'] != null ? Duration(milliseconds: json['ttl']) : null,
    );
  }
}

/// Data caching service for offline capabilities
/// Handles memory and persistent caching with TTL support
class CacheService {
  static const String _tag = 'CacheService';
  static const String _cachePrefix = 'sabo_cache_';
  
  // Memory cache
  final Map<String, CacheEntry> _memoryCache = {};
  
  /// Store data in cache
  Future<void> store<T>({
    required String key,
    required T data,
    CacheStrategy strategy = CacheStrategy.hybrid,
    Duration? ttl,
  }) async {
    try {
      final entry = CacheEntry<T>(
        data: data,
        timestamp: DateTime.now(),
        key: key,
        ttl: ttl,
      );
      
      // Store in memory cache
      if (strategy == CacheStrategy.memory || strategy == CacheStrategy.hybrid) {
        _memoryCache[key] = entry;
      }
      
      // Store in persistent cache
      if (strategy == CacheStrategy.persistent || strategy == CacheStrategy.hybrid) {
        await _storePersistent(key, entry);
      }
      
      debugPrint('$_tag: Stored data for key: $key');
    } catch (e) {
      debugPrint('$_tag: Failed to store data for key $key - $e');
    }
  }
  
  /// Retrieve data from cache
  Future<T?> get<T>(String key) async {
    try {
      // Try memory cache first
      final memoryEntry = _memoryCache[key];
      if (memoryEntry != null && !memoryEntry.isExpired) {
        debugPrint('$_tag: Retrieved from memory cache: $key');
        return memoryEntry.data as T?;
      }
      
      // Try persistent cache
      final persistentData = await _getPersistent<T>(key);
      if (persistentData != null) {
        // Update memory cache
        _memoryCache[key] = CacheEntry<T>(
          data: persistentData,
          timestamp: DateTime.now(),
          key: key,
        );
        debugPrint('$_tag: Retrieved from persistent cache: $key');
        return persistentData;
      }
      
      debugPrint('$_tag: No cached data found for key: $key');
      return null;
    } catch (e) {
      debugPrint('$_tag: Failed to retrieve data for key $key - $e');
      return null;
    }
  }
  
  /// Check if data exists in cache
  Future<bool> has(String key) async {
    try {
      // Check memory cache
      final memoryEntry = _memoryCache[key];
      if (memoryEntry != null && !memoryEntry.isExpired) {
        return true;
      }
      
      // Check persistent cache
      final prefs = await SharedPreferences.getInstance();
      return prefs.containsKey('$_cachePrefix$key');
    } catch (e) {
      debugPrint('$_tag: Failed to check cache for key $key - $e');
      return false;
    }
  }
  
  /// Remove data from cache
  Future<void> remove(String key) async {
    try {
      // Remove from memory cache
      _memoryCache.remove(key);
      
      // Remove from persistent cache
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('$_cachePrefix$key');
      
      debugPrint('$_tag: Removed cached data for key: $key');
    } catch (e) {
      debugPrint('$_tag: Failed to remove cache for key $key - $e');
    }
  }
  
  /// Clear all cached data
  Future<void> clear() async {
    try {
      // Clear memory cache
      _memoryCache.clear();
      
      // Clear persistent cache
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((key) => key.startsWith(_cachePrefix));
      for (final key in keys) {
        await prefs.remove(key);
      }
      
      debugPrint('$_tag: Cleared all cached data');
    } catch (e) {
      debugPrint('$_tag: Failed to clear cache - $e');
    }
  }
  
  /// Clear expired entries
  Future<void> clearExpired() async {
    try {
      // Clear expired memory entries
      _memoryCache.removeWhere((key, entry) => entry.isExpired);
      
      // Clear expired persistent entries
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((key) => key.startsWith(_cachePrefix));
      
      for (final key in keys) {
        final cachedData = prefs.getString(key);
        if (cachedData != null) {
          try {
            final json = jsonDecode(cachedData);
            final timestamp = DateTime.parse(json['timestamp']);
            final ttl = json['ttl'] != null ? Duration(milliseconds: json['ttl']) : null;
            
            if (ttl != null && DateTime.now().difference(timestamp) > ttl) {
              await prefs.remove(key);
            }
          } catch (e) {
            // Invalid cache entry, remove it
            await prefs.remove(key);
          }
        }
      }
      
      debugPrint('$_tag: Cleared expired cache entries');
    } catch (e) {
      debugPrint('$_tag: Failed to clear expired cache - $e');
    }
  }
  
  /// Get cache size information
  Map<String, int> getCacheInfo() {
    return {
      'memoryEntries': _memoryCache.length,
      // TODO: Add persistent cache size calculation
    };
  }
  
  /// Store data in persistent cache
  Future<void> _storePersistent<T>(String key, CacheEntry<T> entry) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonData = jsonEncode(entry.toJson());
      await prefs.setString('$_cachePrefix$key', jsonData);
    } catch (e) {
      debugPrint('$_tag: Failed to store persistent cache for $key - $e');
    }
  }
  
  /// Get data from persistent cache
  Future<T?> _getPersistent<T>(String key) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonData = prefs.getString('$_cachePrefix$key');
      
      if (jsonData != null) {
        final json = jsonDecode(jsonData);
        final timestamp = DateTime.parse(json['timestamp']);
        final ttl = json['ttl'] != null ? Duration(milliseconds: json['ttl']) : null;
        
        // Check if expired
        if (ttl != null && DateTime.now().difference(timestamp) > ttl) {
          await prefs.remove('$_cachePrefix$key');
          return null;
        }
        
        return json['data'] as T?;
      }
      
      return null;
    } catch (e) {
      debugPrint('$_tag: Failed to get persistent cache for $key - $e');
      return null;
    }
  }
}

@riverpod
CacheService cacheService(CacheServiceRef ref) {
  return CacheService();
}
