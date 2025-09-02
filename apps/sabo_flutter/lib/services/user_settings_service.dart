import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

/// User settings data model
class UserSettings {
  // Account settings
  final bool emailNotifications;
  final bool pushNotifications;
  final bool smsNotifications;
  
  // Privacy settings
  final bool profilePublic;
  final bool showOnlineStatus;
  final bool allowDirectMessages;
  final bool showRealName;
  
  // App preferences
  final String theme; // light, dark, auto
  final String language; // vi, en
  final bool soundEffects;
  final bool hapticFeedback;
  final bool autoJoinTournaments;
  final double masterVolume;
  
  // Gaming preferences
  final String preferredGameMode;
  final bool showAdvancedStats;
  final bool allowChallenges;
  final int autoDeclineAfterMinutes;

  UserSettings({
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.smsNotifications = false,
    this.profilePublic = true,
    this.showOnlineStatus = true,
    this.allowDirectMessages = true,
    this.showRealName = false,
    this.theme = 'auto',
    this.language = 'vi',
    this.soundEffects = true,
    this.hapticFeedback = true,
    this.autoJoinTournaments = false,
    this.masterVolume = 0.8,
    this.preferredGameMode = 'any',
    this.showAdvancedStats = true,
    this.allowChallenges = true,
    this.autoDeclineAfterMinutes = 30,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      emailNotifications: json['email_notifications'] ?? true,
      pushNotifications: json['push_notifications'] ?? true,
      smsNotifications: json['sms_notifications'] ?? false,
      profilePublic: json['profile_public'] ?? true,
      showOnlineStatus: json['show_online_status'] ?? true,
      allowDirectMessages: json['allow_direct_messages'] ?? true,
      showRealName: json['show_real_name'] ?? false,
      theme: json['theme'] ?? 'auto',
      language: json['language'] ?? 'vi',
      soundEffects: json['sound_effects'] ?? true,
      hapticFeedback: json['haptic_feedback'] ?? true,
      autoJoinTournaments: json['auto_join_tournaments'] ?? false,
      masterVolume: (json['master_volume'] ?? 0.8).toDouble(),
      preferredGameMode: json['preferred_game_mode'] ?? 'any',
      showAdvancedStats: json['show_advanced_stats'] ?? true,
      allowChallenges: json['allow_challenges'] ?? true,
      autoDeclineAfterMinutes: json['auto_decline_after_minutes'] ?? 30,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email_notifications': emailNotifications,
      'push_notifications': pushNotifications,
      'sms_notifications': smsNotifications,
      'profile_public': profilePublic,
      'show_online_status': showOnlineStatus,
      'allow_direct_messages': allowDirectMessages,
      'show_real_name': showRealName,
      'theme': theme,
      'language': language,
      'sound_effects': soundEffects,
      'haptic_feedback': hapticFeedback,
      'auto_join_tournaments': autoJoinTournaments,
      'master_volume': masterVolume,
      'preferred_game_mode': preferredGameMode,
      'show_advanced_stats': showAdvancedStats,
      'allow_challenges': allowChallenges,
      'auto_decline_after_minutes': autoDeclineAfterMinutes,
    };
  }

  UserSettings copyWith({
    bool? emailNotifications,
    bool? pushNotifications,
    bool? smsNotifications,
    bool? profilePublic,
    bool? showOnlineStatus,
    bool? allowDirectMessages,
    bool? showRealName,
    String? theme,
    String? language,
    bool? soundEffects,
    bool? hapticFeedback,
    bool? autoJoinTournaments,
    double? masterVolume,
    String? preferredGameMode,
    bool? showAdvancedStats,
    bool? allowChallenges,
    int? autoDeclineAfterMinutes,
  }) {
    return UserSettings(
      emailNotifications: emailNotifications ?? this.emailNotifications,
      pushNotifications: pushNotifications ?? this.pushNotifications,
      smsNotifications: smsNotifications ?? this.smsNotifications,
      profilePublic: profilePublic ?? this.profilePublic,
      showOnlineStatus: showOnlineStatus ?? this.showOnlineStatus,
      allowDirectMessages: allowDirectMessages ?? this.allowDirectMessages,
      showRealName: showRealName ?? this.showRealName,
      theme: theme ?? this.theme,
      language: language ?? this.language,
      soundEffects: soundEffects ?? this.soundEffects,
      hapticFeedback: hapticFeedback ?? this.hapticFeedback,
      autoJoinTournaments: autoJoinTournaments ?? this.autoJoinTournaments,
      masterVolume: masterVolume ?? this.masterVolume,
      preferredGameMode: preferredGameMode ?? this.preferredGameMode,
      showAdvancedStats: showAdvancedStats ?? this.showAdvancedStats,
      allowChallenges: allowChallenges ?? this.allowChallenges,
      autoDeclineAfterMinutes: autoDeclineAfterMinutes ?? this.autoDeclineAfterMinutes,
    );
  }
}

/// Enhanced user settings service using shared business logic
/// Integrates with packages/shared-business/src/user/user-settings.ts
class UserSettingsService {
  static const String baseUrl = 'http://localhost:3000/api';
  static const String _localStorageKey = 'user_settings';

  /// Get user settings using shared business logic
  /// Calls: packages/shared-business/src/user/user-settings.ts
  static Future<UserSettings> getUserSettings(String userId) async {
    try {
      // Try to fetch from server first
      final response = await http.get(
        Uri.parse('$baseUrl/user/settings/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final settings = UserSettings.fromJson(data);
        
        // Cache locally
        await _cacheSettingsLocally(settings);
        return settings;
      }
    } catch (e) {
      print('Error fetching settings from server: $e');
    }

    // Fallback to local cache
    return await _getLocalSettings();
  }

  /// Update user settings using shared business logic
  /// Calls: packages/shared-business/src/user/user-settings.ts
  static Future<UserSettings?> updateUserSettings(
    String userId,
    UserSettings settings,
  ) async {
    try {
      // Cache locally first for immediate response
      await _cacheSettingsLocally(settings);

      // Then sync with server
      final response = await http.put(
        Uri.parse('$baseUrl/user/settings/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(settings.toJson()),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return UserSettings.fromJson(data);
      }
      
      return settings; // Return cached version if server update fails
    } catch (e) {
      print('Error updating user settings: $e');
      return settings; // Return cached version on error
    }
  }

  /// Reset settings to default using shared business logic
  static Future<UserSettings> resetToDefaults(String userId) async {
    final defaultSettings = UserSettings();
    return await updateUserSettings(userId, defaultSettings) ?? defaultSettings;
  }

  /// Get notification settings specifically
  static Future<Map<String, bool>> getNotificationSettings(String userId) async {
    final settings = await getUserSettings(userId);
    return {
      'email': settings.emailNotifications,
      'push': settings.pushNotifications,
      'sms': settings.smsNotifications,
    };
  }

  /// Update notification settings specifically
  static Future<UserSettings?> updateNotificationSettings(
    String userId, {
    bool? email,
    bool? push,
    bool? sms,
  }) async {
    final currentSettings = await getUserSettings(userId);
    final updatedSettings = currentSettings.copyWith(
      emailNotifications: email,
      pushNotifications: push,
      smsNotifications: sms,
    );
    return await updateUserSettings(userId, updatedSettings);
  }

  /// Get privacy settings specifically
  static Future<Map<String, bool>> getPrivacySettings(String userId) async {
    final settings = await getUserSettings(userId);
    return {
      'profile_public': settings.profilePublic,
      'show_online_status': settings.showOnlineStatus,
      'allow_direct_messages': settings.allowDirectMessages,
      'show_real_name': settings.showRealName,
    };
  }

  /// Update privacy settings specifically
  static Future<UserSettings?> updatePrivacySettings(
    String userId, {
    bool? profilePublic,
    bool? showOnlineStatus,
    bool? allowDirectMessages,
    bool? showRealName,
  }) async {
    final currentSettings = await getUserSettings(userId);
    final updatedSettings = currentSettings.copyWith(
      profilePublic: profilePublic,
      showOnlineStatus: showOnlineStatus,
      allowDirectMessages: allowDirectMessages,
      showRealName: showRealName,
    );
    return await updateUserSettings(userId, updatedSettings);
  }

  /// Get app preferences specifically
  static Future<Map<String, dynamic>> getAppPreferences(String userId) async {
    final settings = await getUserSettings(userId);
    return {
      'theme': settings.theme,
      'language': settings.language,
      'sound_effects': settings.soundEffects,
      'haptic_feedback': settings.hapticFeedback,
      'master_volume': settings.masterVolume,
    };
  }

  /// Update app preferences specifically
  static Future<UserSettings?> updateAppPreferences(
    String userId, {
    String? theme,
    String? language,
    bool? soundEffects,
    bool? hapticFeedback,
    double? masterVolume,
  }) async {
    final currentSettings = await getUserSettings(userId);
    final updatedSettings = currentSettings.copyWith(
      theme: theme,
      language: language,
      soundEffects: soundEffects,
      hapticFeedback: hapticFeedback,
      masterVolume: masterVolume,
    );
    return await updateUserSettings(userId, updatedSettings);
  }

  /// Get gaming preferences specifically
  static Future<Map<String, dynamic>> getGamingPreferences(String userId) async {
    final settings = await getUserSettings(userId);
    return {
      'preferred_game_mode': settings.preferredGameMode,
      'show_advanced_stats': settings.showAdvancedStats,
      'allow_challenges': settings.allowChallenges,
      'auto_decline_after_minutes': settings.autoDeclineAfterMinutes,
      'auto_join_tournaments': settings.autoJoinTournaments,
    };
  }

  /// Update gaming preferences specifically
  static Future<UserSettings?> updateGamingPreferences(
    String userId, {
    String? preferredGameMode,
    bool? showAdvancedStats,
    bool? allowChallenges,
    int? autoDeclineAfterMinutes,
    bool? autoJoinTournaments,
  }) async {
    final currentSettings = await getUserSettings(userId);
    final updatedSettings = currentSettings.copyWith(
      preferredGameMode: preferredGameMode,
      showAdvancedStats: showAdvancedStats,
      allowChallenges: allowChallenges,
      autoDeclineAfterMinutes: autoDeclineAfterMinutes,
      autoJoinTournaments: autoJoinTournaments,
    );
    return await updateUserSettings(userId, updatedSettings);
  }

  /// Export user settings for backup
  static Future<String> exportSettings(String userId) async {
    final settings = await getUserSettings(userId);
    return json.encode(settings.toJson());
  }

  /// Import user settings from backup
  static Future<UserSettings?> importSettings(String userId, String settingsJson) async {
    try {
      final data = json.decode(settingsJson);
      final settings = UserSettings.fromJson(data);
      return await updateUserSettings(userId, settings);
    } catch (e) {
      print('Error importing settings: $e');
      return null;
    }
  }

  /// Validate settings data
  static bool validateSettings(Map<String, dynamic> settingsData) {
    // Basic validation
    final requiredFields = ['theme', 'language'];
    for (final field in requiredFields) {
      if (!settingsData.containsKey(field)) {
        return false;
      }
    }

    // Validate theme values
    if (!['light', 'dark', 'auto'].contains(settingsData['theme'])) {
      return false;
    }

    // Validate language values
    if (!['vi', 'en'].contains(settingsData['language'])) {
      return false;
    }

    // Validate volume range
    if (settingsData.containsKey('master_volume')) {
      final volume = settingsData['master_volume'];
      if (volume is! num || volume < 0 || volume > 1) {
        return false;
      }
    }

    return true;
  }

  /// Private helper methods
  static Future<void> _cacheSettingsLocally(UserSettings settings) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localStorageKey, json.encode(settings.toJson()));
    } catch (e) {
      print('Error caching settings locally: $e');
    }
  }

  static Future<UserSettings> _getLocalSettings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final settingsJson = prefs.getString(_localStorageKey);
      
      if (settingsJson != null) {
        final data = json.decode(settingsJson);
        return UserSettings.fromJson(data);
      }
    } catch (e) {
      print('Error getting local settings: $e');
    }
    
    // Return default settings if no cache found
    return UserSettings();
  }

  /// Clear local cache
  static Future<void> clearLocalCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_localStorageKey);
    } catch (e) {
      print('Error clearing settings cache: $e');
    }
  }
        soundEnabled: json['sound_enabled'] ?? true,
        animationsEnabled: json['animations_enabled'] ?? true,
        autoSave: json['auto_save'] ?? true,
        showTooltips: json['show_tooltips'] ?? true,
        compactMode: json['compact_mode'] ?? false,
        highContrast: json['high_contrast'] ?? false,
        createdAt: DateTime.parse(json['created_at']),
        updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at']) : null,
      );
    }

    Map<String, dynamic> toJson() {
      return {
        'user_id': userId,
        'theme': theme,
        'language': language,
        'date_format': dateFormat,
        'time_format': timeFormat,
        'currency': currency,
        'sound_enabled': soundEnabled,
        'animations_enabled': animationsEnabled,
        'auto_save': autoSave,
        'show_tooltips': showTooltips,
        'compact_mode': compactMode,
        'high_contrast': highContrast,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt?.toIso8601String(),
      };
    }
  }

  /// Notification Settings Model
  class NotificationSettings {
    final String userId;
    final bool emailNotifications;
    final bool pushNotifications;
    final bool smsNotifications;
    final bool tournamentReminders;
    final bool challengeNotifications;
    final bool clubUpdates;
    final bool promotions;
    final bool weeklyReports;
    final bool achievementAlerts;
    final String quietHoursStart;
    final String quietHoursEnd;

    NotificationSettings({
      required this.userId,
      required this.emailNotifications,
      required this.pushNotifications,
      required this.smsNotifications,
      required this.tournamentReminders,
      required this.challengeNotifications,
      required this.clubUpdates,
      required this.promotions,
      required this.weeklyReports,
      required this.achievementAlerts,
      required this.quietHoursStart,
      required this.quietHoursEnd,
    });

    factory NotificationSettings.fromJson(Map<String, dynamic> json) {
      return NotificationSettings(
        userId: json['user_id'],
        emailNotifications: json['email_notifications'] ?? true,
        pushNotifications: json['push_notifications'] ?? true,
        smsNotifications: json['sms_notifications'] ?? false,
        tournamentReminders: json['tournament_reminders'] ?? true,
        challengeNotifications: json['challenge_notifications'] ?? true,
        clubUpdates: json['club_updates'] ?? true,
        promotions: json['promotions'] ?? false,
        weeklyReports: json['weekly_reports'] ?? true,
        achievementAlerts: json['achievement_alerts'] ?? true,
        quietHoursStart: json['quiet_hours_start'] ?? '22:00',
        quietHoursEnd: json['quiet_hours_end'] ?? '08:00',
      );
    }
  }

  /// Privacy Settings Model
  class PrivacySettings {
    final String userId;
    final String profileVisibility; // 'public' | 'friends' | 'private'
    final bool showOnlineStatus;
    final bool allowFriendRequests;
    final bool allowChallenges;
    final bool showMatchHistory;
    final bool showStatistics;
    final bool allowDataCollection;
    final bool allowTargetedAds;

    PrivacySettings({
      required this.userId,
      required this.profileVisibility,
      required this.showOnlineStatus,
      required this.allowFriendRequests,
      required this.allowChallenges,
      required this.showMatchHistory,
      required this.showStatistics,
      required this.allowDataCollection,
      required this.allowTargetedAds,
    });

    factory PrivacySettings.fromJson(Map<String, dynamic> json) {
      return PrivacySettings(
        userId: json['user_id'],
        profileVisibility: json['profile_visibility'] ?? 'public',
        showOnlineStatus: json['show_online_status'] ?? true,
        allowFriendRequests: json['allow_friend_requests'] ?? true,
        allowChallenges: json['allow_challenges'] ?? true,
        showMatchHistory: json['show_match_history'] ?? true,
        showStatistics: json['show_statistics'] ?? true,
        allowDataCollection: json['allow_data_collection'] ?? false,
        allowTargetedAds: json['allow_targeted_ads'] ?? false,
      );
    }
  }

  /// Get user settings (uses shared business logic)
  static Future<UserSettings?> getUserSettings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/settings/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return UserSettings.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error getting user settings: $e');
      return null;
    }
  }

  /// Update user settings (uses shared validation)
  static Future<bool> updateSettings(String userId, Map<String, dynamic> settings) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/user/settings/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(settings),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error updating settings: $e');
      return false;
    }
  }

  /// Get notification settings (uses shared logic)
  static Future<NotificationSettings?> getNotificationSettings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/notifications/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return NotificationSettings.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error getting notification settings: $e');
      return null;
    }
  }

  /// Get privacy settings (uses shared logic)
  static Future<PrivacySettings?> getPrivacySettings(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/privacy/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PrivacySettings.fromJson(data);
      }
      return null;
    } catch (e) {
      print('Error getting privacy settings: $e');
      return null;
    }
  }

  /// Reset settings to default (uses shared default logic)
  static Future<bool> resetToDefault(String userId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/user/settings/$userId/reset'),
        headers: {'Content-Type': 'application/json'},
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error resetting settings: $e');
      return false;
    }
  }

  /// Export user data (uses shared export logic)
  static Future<Map<String, dynamic>?> exportUserData(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/user/export/$userId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Error exporting user data: $e');
      return null;
    }
  }
}
