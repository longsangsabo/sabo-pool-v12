import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'multi_platform_expansion_service.g.dart';

/// Platform configuration
class PlatformConfig {
  final String platform; // 'web', 'desktop', 'mobile'
  final String targetEnvironment; // 'browser', 'electron', 'tauri', 'flutter'
  final Map<String, dynamic> buildConfiguration;
  final Map<String, String> assetPaths;
  final List<String> supportedFeatures;
  final Map<String, dynamic> platformSpecificSettings;
  final DateTime configuredDate;
  
  const PlatformConfig({
    required this.platform,
    required this.targetEnvironment,
    required this.buildConfiguration,
    required this.assetPaths,
    required this.supportedFeatures,
    required this.platformSpecificSettings,
    required this.configuredDate,
  });
  
  Map<String, dynamic> toJson() => {
    'platform': platform,
    'targetEnvironment': targetEnvironment,
    'buildConfiguration': buildConfiguration,
    'assetPaths': assetPaths,
    'supportedFeatures': supportedFeatures,
    'platformSpecificSettings': platformSpecificSettings,
    'configuredDate': configuredDate.toIso8601String(),
  };
}

/// PWA configuration
class PWAConfig {
  final String name;
  final String shortName;
  final String description;
  final String themeColor;
  final String backgroundColor;
  final String display; // 'standalone', 'fullscreen', 'minimal-ui'
  final String orientation; // 'portrait', 'landscape', 'any'
  final List<Map<String, dynamic>> icons;
  final Map<String, dynamic> shortcuts;
  final Map<String, dynamic> categories;
  final bool offlineSupport;
  final List<String> cacheStrategies;
  final DateTime configuredDate;
  
  const PWAConfig({
    required this.name,
    required this.shortName,
    required this.description,
    required this.themeColor,
    required this.backgroundColor,
    required this.display,
    required this.orientation,
    required this.icons,
    required this.shortcuts,
    required this.categories,
    required this.offlineSupport,
    required this.cacheStrategies,
    required this.configuredDate,
  });
  
  Map<String, dynamic> toJson() => {
    'name': name,
    'shortName': shortName,
    'description': description,
    'themeColor': themeColor,
    'backgroundColor': backgroundColor,
    'display': display,
    'orientation': orientation,
    'icons': icons,
    'shortcuts': shortcuts,
    'categories': categories,
    'offlineSupport': offlineSupport,
    'cacheStrategies': cacheStrategies,
    'configuredDate': configuredDate.toIso8601String(),
  };
}

/// API version configuration
class ApiVersionConfig {
  final String version;
  final String endpoint;
  final Map<String, dynamic> compatibility;
  final Map<String, String> deprecationNotices;
  final DateTime effectiveDate;
  final DateTime? sunsetDate;
  final bool isDefault;
  final List<String> supportedPlatforms;
  
  const ApiVersionConfig({
    required this.version,
    required this.endpoint,
    required this.compatibility,
    required this.deprecationNotices,
    required this.effectiveDate,
    this.sunsetDate,
    required this.isDefault,
    required this.supportedPlatforms,
  });
  
  Map<String, dynamic> toJson() => {
    'version': version,
    'endpoint': endpoint,
    'compatibility': compatibility,
    'deprecationNotices': deprecationNotices,
    'effectiveDate': effectiveDate.toIso8601String(),
    'sunsetDate': sunsetDate?.toIso8601String(),
    'isDefault': isDefault,
    'supportedPlatforms': supportedPlatforms,
  };
}

/// Cross-platform state synchronization
class CrossPlatformState {
  final String stateId;
  final String userId;
  final Map<String, dynamic> data;
  final String platform;
  final DateTime lastModified;
  final int version;
  final List<String> conflictResolution;
  final bool needsSync;
  
  const CrossPlatformState({
    required this.stateId,
    required this.userId,
    required this.data,
    required this.platform,
    required this.lastModified,
    required this.version,
    required this.conflictResolution,
    required this.needsSync,
  });
  
  Map<String, dynamic> toJson() => {
    'stateId': stateId,
    'userId': userId,
    'data': data,
    'platform': platform,
    'lastModified': lastModified.toIso8601String(),
    'version': version,
    'conflictResolution': conflictResolution,
    'needsSync': needsSync,
  };
  
  CrossPlatformState copyWith({
    String? stateId,
    String? userId,
    Map<String, dynamic>? data,
    String? platform,
    DateTime? lastModified,
    int? version,
    List<String>? conflictResolution,
    bool? needsSync,
  }) {
    return CrossPlatformState(
      stateId: stateId ?? this.stateId,
      userId: userId ?? this.userId,
      data: data ?? this.data,
      platform: platform ?? this.platform,
      lastModified: lastModified ?? this.lastModified,
      version: version ?? this.version,
      conflictResolution: conflictResolution ?? this.conflictResolution,
      needsSync: needsSync ?? this.needsSync,
    );
  }
}

/// Desktop app configuration
class DesktopAppConfig {
  final String framework; // 'electron', 'tauri', 'flutter_desktop'
  final Map<String, dynamic> windowSettings;
  final Map<String, dynamic> menuConfiguration;
  final List<String> systemTrayFeatures;
  final Map<String, dynamic> autoUpdaterConfig;
  final Map<String, dynamic> securitySettings;
  final List<String> supportedPlatforms; // 'windows', 'macos', 'linux'
  final DateTime configuredDate;
  
  const DesktopAppConfig({
    required this.framework,
    required this.windowSettings,
    required this.menuConfiguration,
    required this.systemTrayFeatures,
    required this.autoUpdaterConfig,
    required this.securitySettings,
    required this.supportedPlatforms,
    required this.configuredDate,
  });
  
  Map<String, dynamic> toJson() => {
    'framework': framework,
    'windowSettings': windowSettings,
    'menuConfiguration': menuConfiguration,
    'systemTrayFeatures': systemTrayFeatures,
    'autoUpdaterConfig': autoUpdaterConfig,
    'securitySettings': securitySettings,
    'supportedPlatforms': supportedPlatforms,
    'configuredDate': configuredDate.toIso8601String(),
  };
}

/// Web optimization configuration
class WebOptimizationConfig {
  final Map<String, dynamic> bundleOptimization;
  final Map<String, dynamic> cacheStrategies;
  final Map<String, dynamic> performanceSettings;
  final List<String> supportedBrowsers;
  final Map<String, dynamic> responsiveBreakpoints;
  final Map<String, dynamic> accessibilitySettings;
  final DateTime configuredDate;
  
  const WebOptimizationConfig({
    required this.bundleOptimization,
    required this.cacheStrategies,
    required this.performanceSettings,
    required this.supportedBrowsers,
    required this.responsiveBreakpoints,
    required this.accessibilitySettings,
    required this.configuredDate,
  });
  
  Map<String, dynamic> toJson() => {
    'bundleOptimization': bundleOptimization,
    'cacheStrategies': cacheStrategies,
    'performanceSettings': performanceSettings,
    'supportedBrowsers': supportedBrowsers,
    'responsiveBreakpoints': responsiveBreakpoints,
    'accessibilitySettings': accessibilitySettings,
    'configuredDate': configuredDate.toIso8601String(),
  };
}

/// Multi-platform expansion service
/// Handles web optimization, PWA implementation, desktop app preparation, and cross-platform synchronization
class MultiPlatformExpansionService {
  static const String _tag = 'MultiPlatformExpansionService';
  
  bool _isInitialized = false;
  final Map<String, PlatformConfig> _platformConfigs = {};
  PWAConfig? _pwaConfig;
  final Map<String, ApiVersionConfig> _apiVersions = {};
  final Map<String, CrossPlatformState> _stateCache = {};
  DesktopAppConfig? _desktopConfig;
  WebOptimizationConfig? _webOptimizationConfig;
  
  Timer? _syncTimer;
  
  /// Initialize multi-platform expansion service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Configure platform-specific settings
      await _configurePlatforms();
      
      // Setup PWA configuration
      await _setupPWA();
      
      // Configure API versioning
      await _configureApiVersioning();
      
      // Setup desktop app configuration
      await _setupDesktopApp();
      
      // Configure web optimization
      await _configureWebOptimization();
      
      // Start cross-platform state synchronization
      await _startStateSynchronization();
      
      _isInitialized = true;
      debugPrint('$_tag: Multi-platform expansion service initialized successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize multi-platform expansion service - $e');
      rethrow;
    }
  }
  
  /// Configure platform-specific settings
  Future<void> _configurePlatforms() async {
    try {
      // Web platform configuration
      _platformConfigs['web'] = PlatformConfig(
        platform: 'web',
        targetEnvironment: 'browser',
        buildConfiguration: {
          'output_format': 'spa',
          'bundle_splitting': true,
          'tree_shaking': true,
          'minification': true,
          'source_maps': kDebugMode,
          'compression': 'gzip',
        },
        assetPaths: {
          'icons': '/assets/icons/',
          'images': '/assets/images/',
          'fonts': '/assets/fonts/',
          'manifest': '/manifest.json',
        },
        supportedFeatures: [
          'responsive_design',
          'offline_support',
          'push_notifications',
          'background_sync',
          'file_system_access',
          'camera_access',
          'geolocation',
        ],
        platformSpecificSettings: {
          'viewport': 'width=device-width, initial-scale=1.0',
          'theme_color': '#2196F3',
          'background_color': '#FFFFFF',
          'start_url': '/',
          'scope': '/',
        },
        configuredDate: DateTime.now(),
      );
      
      // Desktop platform configuration
      _platformConfigs['desktop'] = PlatformConfig(
        platform: 'desktop',
        targetEnvironment: 'flutter_desktop',
        buildConfiguration: {
          'target_os': Platform.operatingSystem,
          'architecture': 'x64',
          'package_format': Platform.isWindows ? 'msix' : Platform.isMacOS ? 'dmg' : 'appimage',
          'code_signing': true,
          'auto_updater': true,
        },
        assetPaths: {
          'app_icon': 'assets/icons/app_icon.ico',
          'installer_background': 'assets/installer_bg.png',
          'license': 'LICENSE',
        },
        supportedFeatures: [
          'native_menus',
          'system_tray',
          'auto_updater',
          'file_associations',
          'deep_linking',
          'native_notifications',
          'window_management',
        ],
        platformSpecificSettings: {
          'window_title': 'SABO Pool Arena',
          'window_size': {'width': 1200, 'height': 800},
          'min_window_size': {'width': 800, 'height': 600},
          'resizable': true,
          'center_window': true,
        },
        configuredDate: DateTime.now(),
      );
      
      // Mobile platform configuration (existing)
      _platformConfigs['mobile'] = PlatformConfig(
        platform: 'mobile',
        targetEnvironment: 'flutter_mobile',
        buildConfiguration: {
          'target_sdk': Platform.isAndroid ? 'android-33' : 'ios-16.0',
          'min_sdk': Platform.isAndroid ? 'android-21' : 'ios-12.0',
          'architecture': ['arm64-v8a', 'armeabi-v7a'],
          'obfuscation': true,
          'proguard': Platform.isAndroid,
        },
        assetPaths: {
          'app_icon': 'assets/icons/app_icon.png',
          'splash_screen': 'assets/splash.png',
          'adaptive_icons': 'assets/icons/adaptive/',
        },
        supportedFeatures: [
          'biometric_auth',
          'camera_access',
          'push_notifications',
          'offline_storage',
          'background_sync',
          'geolocation',
          'contacts_access',
        ],
        platformSpecificSettings: {
          'orientation': 'portrait',
          'status_bar_style': 'dark',
          'navigation_bar_style': 'dark',
          'immersive_mode': false,
        },
        configuredDate: DateTime.now(),
      );
      
      debugPrint('$_tag: Platform configurations setup - ${_platformConfigs.length} platforms');
    } catch (e) {
      debugPrint('$_tag: Platform configuration failed - $e');
      rethrow;
    }
  }
  
  /// Setup Progressive Web App (PWA) configuration
  Future<void> _setupPWA() async {
    try {
      _pwaConfig = PWAConfig(
        name: 'SABO Pool Arena',
        shortName: 'SABO Pool',
        description: 'Professional pool tournament platform',
        themeColor: '#2196F3',
        backgroundColor: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            'src': '/assets/icons/icon-192.png',
            'sizes': '192x192',
            'type': 'image/png',
            'purpose': 'any maskable',
          },
          {
            'src': '/assets/icons/icon-512.png',
            'sizes': '512x512',
            'type': 'image/png',
            'purpose': 'any maskable',
          },
        ],
        shortcuts: {
          'tournament_list': {
            'name': 'Tournaments',
            'url': '/tournaments',
            'description': 'View active tournaments',
          },
          'leaderboard': {
            'name': 'Leaderboard',
            'url': '/leaderboard',
            'description': 'View rankings',
          },
          'profile': {
            'name': 'Profile',
            'url': '/profile',
            'description': 'Manage your profile',
          },
        },
        categories: {
          'primary': 'sports',
          'secondary': ['games', 'entertainment', 'social'],
        },
        offlineSupport: true,
        cacheStrategies: [
          'cache_first', // Static assets
          'network_first', // API calls
          'stale_while_revalidate', // User content
        ],
        configuredDate: DateTime.now(),
      );
      
      debugPrint('$_tag: PWA configuration setup completed');
    } catch (e) {
      debugPrint('$_tag: PWA setup failed - $e');
      rethrow;
    }
  }
  
  /// Configure API versioning strategy
  Future<void> _configureApiVersioning() async {
    try {
      // API v1 (current)
      _apiVersions['v1'] = ApiVersionConfig(
        version: 'v1',
        endpoint: '/api/v1',
        compatibility: {
          'mobile': ['1.0.0', '1.1.0', '1.2.0'],
          'web': ['1.0.0', '1.1.0'],
          'desktop': ['1.0.0'],
        },
        deprecationNotices: {},
        effectiveDate: DateTime.now().subtract(const Duration(days: 30)),
        isDefault: true,
        supportedPlatforms: ['mobile', 'web', 'desktop'],
      );
      
      // API v2 (future)
      _apiVersions['v2'] = ApiVersionConfig(
        version: 'v2',
        endpoint: '/api/v2',
        compatibility: {
          'mobile': ['2.0.0'],
          'web': ['2.0.0'],
          'desktop': ['2.0.0'],
        },
        deprecationNotices: {
          'v1_deprecation': 'API v1 will be deprecated in 6 months',
        },
        effectiveDate: DateTime.now().add(const Duration(days: 60)),
        sunsetDate: DateTime.now().add(const Duration(days: 365)),
        isDefault: false,
        supportedPlatforms: ['mobile', 'web', 'desktop'],
      );
      
      debugPrint('$_tag: API versioning configured - ${_apiVersions.length} versions');
    } catch (e) {
      debugPrint('$_tag: API versioning configuration failed - $e');
      rethrow;
    }
  }
  
  /// Setup desktop app configuration
  Future<void> _setupDesktopApp() async {
    try {
      _desktopConfig = DesktopAppConfig(
        framework: 'flutter_desktop',
        windowSettings: {
          'default_width': 1200,
          'default_height': 800,
          'min_width': 800,
          'min_height': 600,
          'max_width': 1920,
          'max_height': 1080,
          'resizable': true,
          'center_on_start': true,
          'remember_position': true,
          'title': 'SABO Pool Arena',
        },
        menuConfiguration: {
          'file_menu': [
            {'label': 'New Tournament', 'action': 'new_tournament'},
            {'label': 'Open Tournament', 'action': 'open_tournament'},
            {'separator': true},
            {'label': 'Settings', 'action': 'open_settings'},
            {'separator': true},
            {'label': 'Exit', 'action': 'exit_app'},
          ],
          'view_menu': [
            {'label': 'Tournaments', 'action': 'view_tournaments'},
            {'label': 'Leaderboard', 'action': 'view_leaderboard'},
            {'label': 'Profile', 'action': 'view_profile'},
            {'separator': true},
            {'label': 'Toggle Fullscreen', 'action': 'toggle_fullscreen'},
          ],
          'help_menu': [
            {'label': 'User Guide', 'action': 'open_help'},
            {'label': 'Keyboard Shortcuts', 'action': 'show_shortcuts'},
            {'separator': true},
            {'label': 'About', 'action': 'show_about'},
          ],
        },
        systemTrayFeatures: [
          'minimize_to_tray',
          'close_to_tray',
          'quick_actions',
          'notifications',
        ],
        autoUpdaterConfig: {
          'enabled': true,
          'check_interval': 'daily',
          'auto_download': true,
          'auto_install': false, // Require user confirmation
          'update_channel': kDebugMode ? 'beta' : 'stable',
        },
        securitySettings: {
          'content_security_policy': true,
          'disable_node_integration': true,
          'enable_context_isolation': true,
          'sandbox': true,
        },
        supportedPlatforms: ['windows', 'macos', 'linux'],
        configuredDate: DateTime.now(),
      );
      
      debugPrint('$_tag: Desktop app configuration setup completed');
    } catch (e) {
      debugPrint('$_tag: Desktop app setup failed - $e');
      rethrow;
    }
  }
  
  /// Configure web optimization
  Future<void> _configureWebOptimization() async {
    try {
      _webOptimizationConfig = WebOptimizationConfig(
        bundleOptimization: {
          'code_splitting': true,
          'tree_shaking': true,
          'minification': true,
          'compression': 'brotli',
          'source_maps': kDebugMode,
          'lazy_loading': true,
          'preloading': true,
        },
        cacheStrategies: {
          'static_assets': 'cache_first',
          'api_calls': 'network_first',
          'user_content': 'stale_while_revalidate',
          'images': 'cache_first',
          'fonts': 'cache_first',
        },
        performanceSettings: {
          'image_optimization': true,
          'font_optimization': true,
          'critical_css_inlining': true,
          'resource_hints': true,
          'service_worker': true,
          'http2_push': true,
        },
        supportedBrowsers: [
          'Chrome >= 80',
          'Firefox >= 78',
          'Safari >= 13',
          'Edge >= 80',
        ],
        responsiveBreakpoints: {
          'xs': 320,
          'sm': 576,
          'md': 768,
          'lg': 992,
          'xl': 1200,
          'xxl': 1400,
        },
        accessibilitySettings: {
          'wcag_level': 'AA',
          'screen_reader_support': true,
          'keyboard_navigation': true,
          'high_contrast_mode': true,
          'focus_indicators': true,
        },
        configuredDate: DateTime.now(),
      );
      
      debugPrint('$_tag: Web optimization configuration setup completed');
    } catch (e) {
      debugPrint('$_tag: Web optimization setup failed - $e');
      rethrow;
    }
  }
  
  /// Start cross-platform state synchronization
  Future<void> _startStateSynchronization() async {
    try {
      // Start periodic sync timer
      _syncTimer?.cancel();
      _syncTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
        _syncPlatformStates();
      });
      
      debugPrint('$_tag: Cross-platform state synchronization started');
    } catch (e) {
      debugPrint('$_tag: State synchronization startup failed - $e');
      rethrow;
    }
  }
  
  /// Sync platform states
  Future<void> _syncPlatformStates() async {
    try {
      final statesToSync = _stateCache.values.where((state) => state.needsSync).toList();
      
      if (statesToSync.isEmpty) return;
      
      for (final state in statesToSync) {
        await _syncStateToCloud(state);
      }
      
      debugPrint('$_tag: Synced ${statesToSync.length} states to cloud');
    } catch (e) {
      debugPrint('$_tag: State synchronization failed - $e');
    }
  }
  
  /// Sync state to cloud
  Future<void> _syncStateToCloud(CrossPlatformState state) async {
    try {
      // Simulate cloud sync
      await Future.delayed(const Duration(milliseconds: 100));
      
      // Mark as synced
      _stateCache[state.stateId] = state.copyWith(needsSync: false);
      
    } catch (e) {
      debugPrint('$_tag: Cloud sync failed for state ${state.stateId} - $e');
    }
  }
  
  /// Update cross-platform state
  Future<void> updateCrossPlatformState(
    String stateId,
    String userId,
    Map<String, dynamic> data, {
    String? platform,
  }) async {
    try {
      final currentPlatform = platform ?? _getCurrentPlatform();
      final existingState = _stateCache[stateId];
      
      final newState = CrossPlatformState(
        stateId: stateId,
        userId: userId,
        data: data,
        platform: currentPlatform,
        lastModified: DateTime.now(),
        version: (existingState?.version ?? 0) + 1,
        conflictResolution: [],
        needsSync: true,
      );
      
      _stateCache[stateId] = newState;
      
      debugPrint('$_tag: Updated cross-platform state: $stateId');
    } catch (e) {
      debugPrint('$_tag: Cross-platform state update failed - $e');
      rethrow;
    }
  }
  
  /// Get cross-platform state
  CrossPlatformState? getCrossPlatformState(String stateId) {
    return _stateCache[stateId];
  }
  
  /// Get current platform
  String _getCurrentPlatform() {
    if (kIsWeb) return 'web';
    if (Platform.isAndroid || Platform.isIOS) return 'mobile';
    return 'desktop';
  }
  
  /// Generate PWA manifest
  Map<String, dynamic> generatePWAManifest() {
    if (_pwaConfig == null) {
      throw Exception('PWA not configured');
    }
    
    return {
      'name': _pwaConfig!.name,
      'short_name': _pwaConfig!.shortName,
      'description': _pwaConfig!.description,
      'theme_color': _pwaConfig!.themeColor,
      'background_color': _pwaConfig!.backgroundColor,
      'display': _pwaConfig!.display,
      'orientation': _pwaConfig!.orientation,
      'start_url': '/',
      'scope': '/',
      'icons': _pwaConfig!.icons,
      'shortcuts': _pwaConfig!.shortcuts.entries.map((entry) => {
        'name': entry.value['name'],
        'url': entry.value['url'],
        'description': entry.value['description'],
      }).toList(),
      'categories': _pwaConfig!.categories['secondary'],
    };
  }
  
  /// Generate service worker configuration
  Map<String, dynamic> generateServiceWorkerConfig() {
    return {
      'version': '1.0.0',
      'cacheStrategies': _pwaConfig?.cacheStrategies ?? [],
      'staticAssets': [
        '/',
        '/manifest.json',
        '/assets/icons/icon-192.png',
        '/assets/icons/icon-512.png',
        '/assets/fonts/',
        '/assets/images/',
      ],
      'apiEndpoints': [
        '/api/v1/tournaments',
        '/api/v1/users',
        '/api/v1/matches',
      ],
      'offlinePages': [
        '/offline',
        '/tournaments',
        '/profile',
      ],
    };
  }
  
  /// Get API version for platform
  ApiVersionConfig? getApiVersionForPlatform(String platform, String appVersion) {
    for (final apiVersion in _apiVersions.values) {
      final compatibility = apiVersion.compatibility[platform];
      if (compatibility != null && compatibility.contains(appVersion)) {
        return apiVersion;
      }
    }
    
    // Return default version
    return _apiVersions.values.firstWhere(
      (version) => version.isDefault,
      orElse: () => _apiVersions.values.first,
    );
  }
  
  /// Check platform feature support
  bool isPlatformFeatureSupported(String platform, String feature) {
    final config = _platformConfigs[platform];
    return config?.supportedFeatures.contains(feature) ?? false;
  }
  
  /// Generate platform-specific build configuration
  Map<String, dynamic> generateBuildConfig(String platform) {
    final config = _platformConfigs[platform];
    if (config == null) {
      throw Exception('Platform not configured: $platform');
    }
    
    return {
      'platform': platform,
      'target_environment': config.targetEnvironment,
      'build_configuration': config.buildConfiguration,
      'asset_paths': config.assetPaths,
      'supported_features': config.supportedFeatures,
      'platform_settings': config.platformSpecificSettings,
    };
  }
  
  /// Generate multi-platform expansion report
  Map<String, dynamic> generateExpansionReport() {
    return {
      'reportGenerated': DateTime.now().toIso8601String(),
      'platforms': {
        'configured_platforms': _platformConfigs.keys.toList(),
        'total_platforms': _platformConfigs.length,
        'platform_configs': _platformConfigs.map((key, value) => MapEntry(key, value.toJson())),
      },
      'pwa': {
        'configured': _pwaConfig != null,
        'config': _pwaConfig?.toJson(),
      },
      'api_versioning': {
        'total_versions': _apiVersions.length,
        'active_versions': _apiVersions.values.where((v) => v.effectiveDate.isBefore(DateTime.now())).length,
        'default_version': _apiVersions.values.firstWhere((v) => v.isDefault).version,
        'versions': _apiVersions.map((key, value) => MapEntry(key, value.toJson())),
      },
      'desktop_app': {
        'configured': _desktopConfig != null,
        'config': _desktopConfig?.toJson(),
      },
      'web_optimization': {
        'configured': _webOptimizationConfig != null,
        'config': _webOptimizationConfig?.toJson(),
      },
      'cross_platform_state': {
        'total_states': _stateCache.length,
        'states_needing_sync': _stateCache.values.where((s) => s.needsSync).length,
        'sync_enabled': _syncTimer?.isActive ?? false,
      },
      'expansion_readiness': _calculateExpansionReadiness(),
    };
  }
  
  /// Calculate expansion readiness
  Map<String, dynamic> _calculateExpansionReadiness() {
    int score = 0;
    final components = <String, bool>{};
    
    // Platform configurations
    if (_platformConfigs.isNotEmpty) {
      score += 25;
      components['platform_configs'] = true;
    }
    
    // PWA setup
    if (_pwaConfig != null) {
      score += 20;
      components['pwa_ready'] = true;
    }
    
    // API versioning
    if (_apiVersions.isNotEmpty) {
      score += 20;
      components['api_versioning'] = true;
    }
    
    // Desktop app
    if (_desktopConfig != null) {
      score += 15;
      components['desktop_ready'] = true;
    }
    
    // Web optimization
    if (_webOptimizationConfig != null) {
      score += 10;
      components['web_optimized'] = true;
    }
    
    // State synchronization
    if (_syncTimer?.isActive ?? false) {
      score += 10;
      components['state_sync'] = true;
    }
    
    return {
      'overallScore': score,
      'isReady': score >= 80,
      'components': components,
      'recommendations': _generateExpansionRecommendations(score),
    };
  }
  
  /// Generate expansion recommendations
  List<String> _generateExpansionRecommendations(int score) {
    final recommendations = <String>[];
    
    if (score < 40) {
      recommendations.add('Complete basic platform configurations');
      recommendations.add('Setup PWA and web optimization');
    } else if (score < 60) {
      recommendations.add('Implement API versioning strategy');
      recommendations.add('Configure desktop app framework');
    } else if (score < 80) {
      recommendations.add('Enable cross-platform state synchronization');
      recommendations.add('Optimize web performance settings');
    } else {
      recommendations.add('Ready for multi-platform expansion');
      recommendations.add('Consider gradual rollout strategy');
      recommendations.add('Monitor cross-platform analytics');
    }
    
    return recommendations;
  }
  
  /// Dispose service
  void dispose() {
    _syncTimer?.cancel();
    _stateCache.clear();
    debugPrint('$_tag: Multi-platform expansion service disposed');
  }
}

/// Provider for multi-platform expansion service
@riverpod
MultiPlatformExpansionService multiPlatformExpansionService(MultiPlatformExpansionServiceRef ref) {
  final service = MultiPlatformExpansionService();
  service.initialize();
  
  ref.onDispose(() {
    service.dispose();
  });
  
  return service;
}
