/// SABO FLUTTER NATIVE SERVICES
/// 
/// COPILOT 4 - Native Features & Optimization Implementation
/// 
/// This module provides comprehensive native device integration for the Sabo Pool mobile app.
/// All services are designed to work with shared business logic and provide optimal performance.

// Bridge Services
export 'bridge/shared_services_bridge.dart';

// Native Device Services
export 'native/push_notification_service.dart';
export 'native/camera_service.dart';
export 'native/biometric_service.dart';
export 'native/connectivity_service.dart';
export 'native/offline_data_service.dart';

// Performance & Optimization
export '../utils/performance/performance_service.dart';
export '../utils/performance/error_boundary_service.dart';

// Device Integration Hooks
export '../hooks/device/device_hooks.dart';

/// COPILOT 4 IMPLEMENTATION SUMMARY
/// 
/// ✅ Device Integration Features:
/// - Push notifications with shared logic bridge
/// - Camera integration for photo capture/gallery
/// - Biometric authentication (fingerprint, face, iris)
/// - Offline data caching and sync capabilities
/// 
/// ✅ Performance & Optimization:
/// - Real-time performance monitoring
/// - Memory usage optimization
/// - Network connectivity handling
/// - Error boundary implementation
/// 
/// ✅ Integration with Shared Logic:
/// - Bridge service for TypeScript shared-business integration
/// - Unified error reporting and analytics
/// - Consistent data synchronization
/// - Performance metrics collection
/// 
/// ✅ Flutter-Native Bridge:
/// - Method channel communication
/// - Async error handling
/// - Resource cleanup and disposal
/// - Context-aware error reporting

/// COORDINATION WITH OTHER COPILOTS:
/// 
/// Copilot 1 (Auth/Tournament): 
/// - Import biometric authentication for secure login
/// - Use push notifications for tournament updates
/// - Leverage offline data for tournament viewing
/// 
/// Copilot 2 (Profile/Settings):
/// - Import camera service for profile photos
/// - Use performance monitoring for settings optimization
/// - Leverage error boundary for settings validation
/// 
/// Copilot 3 (Payment):
/// - Import biometric authentication for payment security
/// - Use connectivity service for payment validation
/// - Leverage error boundary for payment error handling

/// USAGE EXAMPLES:
/// 
/// ```dart
/// // Biometric authentication
/// final biometric = ref.watch(deviceBiometricNotifierProvider);
/// final authenticated = await biometric.authenticateForPayment();
/// 
/// // Camera integration
/// final camera = ref.watch(deviceCameraNotifierProvider);
/// final photoPath = await camera.captureProfilePhoto();
/// 
/// // Offline data
/// final offlineData = ref.watch(deviceOfflineDataNotifierProvider);
/// await offlineData.cacheTournamentData(tournamentId, data);
/// 
/// // Performance monitoring
/// final performance = ref.watch(devicePerformanceNotifierProvider);
/// final metrics = await performance.getCurrentMetrics();
/// 
/// // Error reporting
/// final errorBoundary = ref.watch(deviceErrorBoundaryNotifierProvider);
/// errorBoundary.reportError('Custom error', severity: ErrorSeverity.high);
/// ```
