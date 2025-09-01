import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../services/native/push_notification_service.dart';
import '../services/native/camera_service.dart';
import '../services/native/biometric_service.dart';
import '../services/native/connectivity_service.dart';
import '../services/native/offline_data_service.dart';
import '../utils/performance/performance_service.dart';
import '../utils/performance/error_boundary_service.dart';

part 'device_hooks.g.dart';

/// Hook for device camera functionality
@riverpod
class DeviceCameraNotifier extends _$DeviceCameraNotifier {
  @override
  AsyncValue<CameraService> build() {
    final service = CameraService();
    service.initialize();
    return AsyncValue.data(service);
  }
  
  /// Capture profile photo
  Future<String?> captureProfilePhoto() async {
    return await asyncValue.when(
      data: (service) async {
        final photo = await service.captureProfilePhoto();
        return photo?.path;
      },
      loading: () => null,
      error: (error, stack) {
        debugPrint('DeviceCameraNotifier: Error capturing photo - $error');
        return null;
      },
    );
  }
  
  /// Pick photo from gallery
  Future<String?> pickFromGallery() async {
    return await asyncValue.when(
      data: (service) async {
        final photo = await service.pickFromGallery();
        return photo?.path;
      },
      loading: () => null,
      error: (error, stack) {
        debugPrint('DeviceCameraNotifier: Error picking photo - $error');
        return null;
      },
    );
  }
}

/// Hook for biometric authentication
@riverpod
class DeviceBiometricNotifier extends _$DeviceBiometricNotifier {
  @override
  AsyncValue<BiometricService> build() {
    final service = BiometricService();
    service.initialize();
    return AsyncValue.data(service);
  }
  
  /// Check if biometric authentication is available
  Future<bool> isAvailable() async {
    return await asyncValue.when(
      data: (service) => service.isAvailable(),
      loading: () => false,
      error: (error, stack) => false,
    );
  }
  
  /// Authenticate user for login
  Future<bool> authenticateForLogin() async {
    return await asyncValue.when(
      data: (service) => service.authenticateForLogin(),
      loading: () => false,
      error: (error, stack) => false,
    );
  }
  
  /// Authenticate user for payment
  Future<bool> authenticateForPayment() async {
    return await asyncValue.when(
      data: (service) => service.authenticateForPayment(),
      loading: () => false,
      error: (error, stack) => false,
    );
  }
}

/// Hook for push notifications
@riverpod
class DeviceNotificationNotifier extends _$DeviceNotificationNotifier {
  @override
  AsyncValue<PushNotificationService> build() {
    final service = PushNotificationService();
    service.initialize();
    return AsyncValue.data(service);
  }
  
  /// Subscribe to tournament notifications
  Future<void> subscribeToTournament(String tournamentId) async {
    await asyncValue.when(
      data: (service) => service.subscribeToTournament(tournamentId),
      loading: () async {},
      error: (error, stack) async {
        debugPrint('DeviceNotificationNotifier: Error subscribing - $error');
      },
    );
  }
  
  /// Unsubscribe from tournament notifications
  Future<void> unsubscribeFromTournament(String tournamentId) async {
    await asyncValue.when(
      data: (service) => service.unsubscribeFromTournament(tournamentId),
      loading: () async {},
      error: (error, stack) async {
        debugPrint('DeviceNotificationNotifier: Error unsubscribing - $error');
      },
    );
  }
}

/// Hook for connectivity status
@riverpod
class DeviceConnectivityNotifier extends _$DeviceConnectivityNotifier {
  @override
  Stream<ConnectivityStatus> build() {
    final service = ref.watch(connectivityServiceProvider);
    return service.statusStream;
  }
  
  /// Check if device is connected
  bool isConnected() {
    final service = ref.read(connectivityServiceProvider);
    return service.isConnected;
  }
  
  /// Check if connection is fast
  bool isFastConnection() {
    final service = ref.read(connectivityServiceProvider);
    return service.isFastConnection;
  }
  
  /// Force connectivity check
  Future<ConnectivityStatus> forceCheck() async {
    final service = ref.read(connectivityServiceProvider);
    return await service.forceCheck();
  }
}

/// Hook for offline data management
@riverpod
class DeviceOfflineDataNotifier extends _$DeviceOfflineDataNotifier {
  @override
  AsyncValue<OfflineDataService> build() {
    final service = OfflineDataService();
    service.initialize();
    return AsyncValue.data(service);
  }
  
  /// Cache tournament data
  Future<void> cacheTournamentData(String tournamentId, Map<String, dynamic> data) async {
    await asyncValue.when(
      data: (service) => service.cacheTournamentData(tournamentId, data),
      loading: () async {},
      error: (error, stack) async {
        debugPrint('DeviceOfflineDataNotifier: Error caching tournament - $error');
      },
    );
  }
  
  /// Get cached tournament data
  Future<Map<String, dynamic>?> getCachedTournamentData(String tournamentId) async {
    return await asyncValue.when(
      data: (service) => service.getCachedTournamentData(tournamentId),
      loading: () => null,
      error: (error, stack) => null,
    );
  }
  
  /// Sync offline data
  Future<bool> syncData() async {
    return await asyncValue.when(
      data: (service) => service.syncData(),
      loading: () => false,
      error: (error, stack) => false,
    );
  }
}

/// Hook for performance monitoring
@riverpod
class DevicePerformanceNotifier extends _$DevicePerformanceNotifier {
  @override
  AsyncValue<PerformanceService> build() {
    final service = ref.watch(performanceServiceProvider);
    service.startMonitoring();
    return AsyncValue.data(service);
  }
  
  /// Get current performance metrics
  Future<PerformanceMetrics?> getCurrentMetrics() async {
    return await asyncValue.when(
      data: (service) => service.getCurrentMetrics(),
      loading: () => null,
      error: (error, stack) => null,
    );
  }
  
  /// Get average performance metrics
  PerformanceMetrics? getAverageMetrics() {
    return asyncValue.when(
      data: (service) => service.getAverageMetrics(),
      loading: () => null,
      error: (error, stack) => null,
    );
  }
  
  /// Optimize memory usage
  Future<void> optimizeMemory() async {
    await asyncValue.when(
      data: (service) => service.optimizeMemoryUsage(),
      loading: () async {},
      error: (error, stack) async {
        debugPrint('DevicePerformanceNotifier: Error optimizing memory - $error');
      },
    );
  }
}

/// Hook for error boundary management
@riverpod
class DeviceErrorBoundaryNotifier extends _$DeviceErrorBoundaryNotifier {
  @override
  Stream<ErrorReport> build() {
    final service = ref.watch(errorBoundaryServiceProvider);
    return service.errorStream;
  }
  
  /// Report manual error
  void reportError(
    String message, {
    Object? exception,
    StackTrace? stackTrace,
    ErrorSeverity severity = ErrorSeverity.medium,
    ErrorCategory category = ErrorCategory.unknown,
    Map<String, dynamic>? context,
  }) {
    final service = ref.read(errorBoundaryServiceProvider);
    service.reportError(
      message,
      exception: exception,
      stackTrace: stackTrace,
      severity: severity,
      category: category,
      context: context,
    );
  }
  
  /// Set user context for error reporting
  void setUserContext(String userId) {
    final service = ref.read(errorBoundaryServiceProvider);
    service.setUserContext(userId);
  }
  
  /// Set screen context for error reporting
  void setScreenContext(String screenName) {
    final service = ref.read(errorBoundaryServiceProvider);
    service.setScreenContext(screenName);
  }
}

/// Composite hook for all device functionality
@riverpod
class DeviceIntegrationNotifier extends _$DeviceIntegrationNotifier {
  @override
  AsyncValue<Map<String, bool>> build() {
    return const AsyncValue.loading();
  }
  
  /// Initialize all device services
  Future<void> initializeAllServices() async {
    state = const AsyncValue.loading();
    
    try {
      final results = <String, bool>{};
      
      // Initialize camera
      try {
        final camera = ref.read(deviceCameraNotifierProvider);
        await camera.when(
          data: (service) async {
            await service.initialize();
            results['camera'] = true;
          },
          loading: () => results['camera'] = false,
          error: (_, __) => results['camera'] = false,
        );
      } catch (e) {
        results['camera'] = false;
      }
      
      // Initialize biometric
      try {
        final biometric = ref.read(deviceBiometricNotifierProvider);
        await biometric.when(
          data: (service) async {
            await service.initialize();
            results['biometric'] = true;
          },
          loading: () => results['biometric'] = false,
          error: (_, __) => results['biometric'] = false,
        );
      } catch (e) {
        results['biometric'] = false;
      }
      
      // Initialize notifications
      try {
        final notifications = ref.read(deviceNotificationNotifierProvider);
        await notifications.when(
          data: (service) async {
            await service.initialize();
            results['notifications'] = true;
          },
          loading: () => results['notifications'] = false,
          error: (_, __) => results['notifications'] = false,
        );
      } catch (e) {
        results['notifications'] = false;
      }
      
      // Initialize offline data
      try {
        final offlineData = ref.read(deviceOfflineDataNotifierProvider);
        await offlineData.when(
          data: (service) async {
            await service.initialize();
            results['offline_data'] = true;
          },
          loading: () => results['offline_data'] = false,
          error: (_, __) => results['offline_data'] = false,
        );
      } catch (e) {
        results['offline_data'] = false;
      }
      
      state = AsyncValue.data(results);
      debugPrint('DeviceIntegrationNotifier: All services initialized - $results');
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
      debugPrint('DeviceIntegrationNotifier: Failed to initialize services - $error');
    }
  }
  
  /// Get device capabilities summary
  Future<Map<String, dynamic>> getDeviceCapabilities() async {
    final capabilities = <String, dynamic>{};
    
    // Camera capabilities
    try {
      final camera = ref.read(deviceCameraNotifierProvider);
      await camera.when(
        data: (service) async {
          capabilities['camera'] = {
            'available': await service.hasCameraPermission(),
            'gallery_access': await service.hasPhotoPermission(),
          };
        },
        loading: () => capabilities['camera'] = {'available': false},
        error: (_, __) => capabilities['camera'] = {'available': false},
      );
    } catch (e) {
      capabilities['camera'] = {'available': false, 'error': e.toString()};
    }
    
    // Biometric capabilities
    try {
      final biometric = ref.read(deviceBiometricNotifierProvider);
      await biometric.when(
        data: (service) async {
          capabilities['biometric'] = {
            'available': await service.isAvailable(),
            'description': await service.getBiometricDescription(),
            'strong_auth': await service.hasStrongBiometrics(),
          };
        },
        loading: () => capabilities['biometric'] = {'available': false},
        error: (_, __) => capabilities['biometric'] = {'available': false},
      );
    } catch (e) {
      capabilities['biometric'] = {'available': false, 'error': e.toString()};
    }
    
    // Connectivity status
    try {
      final connectivity = ref.read(connectivityServiceProvider);
      capabilities['connectivity'] = {
        'connected': connectivity.isConnected,
        'type': connectivity.getNetworkTypeString(),
        'fast': connectivity.isFastConnection,
      };
    } catch (e) {
      capabilities['connectivity'] = {'connected': false, 'error': e.toString()};
    }
    
    return capabilities;
  }
}
