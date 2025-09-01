import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:device_info_plus/device_info_plus.dart';

part 'performance_service.g.dart';

/// Performance metrics data class
class PerformanceMetrics {
  final double cpuUsage;
  final double memoryUsage;
  final double batteryLevel;
  final String networkType;
  final double frameRate;
  final int droppedFrames;
  final DateTime timestamp;
  
  const PerformanceMetrics({
    required this.cpuUsage,
    required this.memoryUsage,
    required this.batteryLevel,
    required this.networkType,
    required this.frameRate,
    required this.droppedFrames,
    required this.timestamp,
  });
  
  Map<String, dynamic> toJson() => {
    'cpuUsage': cpuUsage,
    'memoryUsage': memoryUsage,
    'batteryLevel': batteryLevel,
    'networkType': networkType,
    'frameRate': frameRate,
    'droppedFrames': droppedFrames,
    'timestamp': timestamp.toIso8601String(),
  };
}

/// App launch metrics
class LaunchMetrics {
  final Duration coldStartTime;
  final Duration warmStartTime;
  final Duration hotReloadTime;
  final String launchType;
  final DateTime timestamp;
  
  const LaunchMetrics({
    required this.coldStartTime,
    required this.warmStartTime,
    required this.hotReloadTime,
    required this.launchType,
    required this.timestamp,
  });
  
  Map<String, dynamic> toJson() => {
    'coldStartTime': coldStartTime.inMilliseconds,
    'warmStartTime': warmStartTime.inMilliseconds,
    'hotReloadTime': hotReloadTime.inMilliseconds,
    'launchType': launchType,
    'timestamp': timestamp.toIso8601String(),
  };
}

/// Performance monitoring service for tracking app performance
/// Monitors CPU, memory, battery, network, and frame rate metrics
class PerformanceService {
  static const String _tag = 'PerformanceService';
  static const MethodChannel _channel = MethodChannel('sabo_pool/performance');
  
  bool _isInitialized = false;
  bool _isMonitoring = false;
  Timer? _metricsTimer;
  final List<PerformanceMetrics> _metricsHistory = [];
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  
  // Performance thresholds
  static const double _highCpuThreshold = 80.0; // 80%
  static const double _highMemoryThreshold = 75.0; // 75%
  static const double _lowBatteryThreshold = 20.0; // 20%
  static const double _lowFrameRateThreshold = 30.0; // 30 FPS
  
  /// Initialize performance monitoring
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Set up native method call handler
      _channel.setMethodCallHandler(_handleMethodCall);
      
      // Initialize native performance monitoring
      await _channel.invokeMethod('initialize');
      
      _isInitialized = true;
      debugPrint('$_tag: Initialized successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize - $e');
      rethrow;
    }
  }
  
  /// Handle method calls from native performance monitoring
  Future<dynamic> _handleMethodCall(MethodCall call) async {
    switch (call.method) {
      case 'onPerformanceAlert':
        return _handlePerformanceAlert(call.arguments);
      case 'onMemoryWarning':
        return _handleMemoryWarning(call.arguments);
      default:
        debugPrint('$_tag: Unknown method call: ${call.method}');
        return null;
    }
  }
  
  /// Handle performance alerts from native layer
  Future<void> _handlePerformanceAlert(dynamic arguments) async {
    debugPrint('$_tag: Performance alert: $arguments');
    // TODO: Implement performance alert handling
  }
  
  /// Handle memory warnings
  Future<void> _handleMemoryWarning(dynamic arguments) async {
    debugPrint('$_tag: Memory warning: $arguments');
    await optimizeMemoryUsage();
  }
  
  /// Start performance monitoring
  Future<void> startMonitoring({Duration interval = const Duration(seconds: 5)}) async {
    if (!_isInitialized) await initialize();
    if (_isMonitoring) return;
    
    try {
      _metricsTimer = Timer.periodic(interval, (_) => _collectMetrics());
      _isMonitoring = true;
      
      debugPrint('$_tag: Monitoring started with ${interval.inSeconds}s interval');
    } catch (e) {
      debugPrint('$_tag: Failed to start monitoring - $e');
    }
  }
  
  /// Stop performance monitoring
  void stopMonitoring() {
    _metricsTimer?.cancel();
    _metricsTimer = null;
    _isMonitoring = false;
    debugPrint('$_tag: Monitoring stopped');
  }
  
  /// Collect current performance metrics
  Future<void> _collectMetrics() async {
    try {
      final metrics = await getCurrentMetrics();
      _metricsHistory.add(metrics);
      
      // Keep only last 100 metrics to prevent memory leaks
      if (_metricsHistory.length > 100) {
        _metricsHistory.removeAt(0);
      }
      
      // Check for performance issues
      _checkPerformanceThresholds(metrics);
      
    } catch (e) {
      debugPrint('$_tag: Failed to collect metrics - $e');
    }
  }
  
  /// Get current performance metrics
  Future<PerformanceMetrics> getCurrentMetrics() async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _channel.invokeMethod('getCurrentMetrics');
      
      return PerformanceMetrics(
        cpuUsage: (result['cpuUsage'] ?? 0.0).toDouble(),
        memoryUsage: (result['memoryUsage'] ?? 0.0).toDouble(),
        batteryLevel: (result['batteryLevel'] ?? 100.0).toDouble(),
        networkType: result['networkType'] ?? 'unknown',
        frameRate: (result['frameRate'] ?? 60.0).toDouble(),
        droppedFrames: (result['droppedFrames'] ?? 0).toInt(),
        timestamp: DateTime.now(),
      );
    } catch (e) {
      debugPrint('$_tag: Failed to get current metrics - $e');
      // Return default metrics on error
      return PerformanceMetrics(
        cpuUsage: 0.0,
        memoryUsage: 0.0,
        batteryLevel: 100.0,
        networkType: 'unknown',
        frameRate: 60.0,
        droppedFrames: 0,
        timestamp: DateTime.now(),
      );
    }
  }
  
  /// Check performance thresholds and alert if needed
  void _checkPerformanceThresholds(PerformanceMetrics metrics) {
    if (metrics.cpuUsage > _highCpuThreshold) {
      debugPrint('$_tag: High CPU usage detected: ${metrics.cpuUsage}%');
    }
    
    if (metrics.memoryUsage > _highMemoryThreshold) {
      debugPrint('$_tag: High memory usage detected: ${metrics.memoryUsage}%');
    }
    
    if (metrics.batteryLevel < _lowBatteryThreshold) {
      debugPrint('$_tag: Low battery detected: ${metrics.batteryLevel}%');
    }
    
    if (metrics.frameRate < _lowFrameRateThreshold) {
      debugPrint('$_tag: Low frame rate detected: ${metrics.frameRate} FPS');
    }
  }
  
  /// Get performance metrics history
  List<PerformanceMetrics> getMetricsHistory() {
    return List.unmodifiable(_metricsHistory);
  }
  
  /// Get average performance metrics
  PerformanceMetrics? getAverageMetrics() {
    if (_metricsHistory.isEmpty) return null;
    
    final count = _metricsHistory.length;
    final totalCpu = _metricsHistory.fold(0.0, (sum, m) => sum + m.cpuUsage);
    final totalMemory = _metricsHistory.fold(0.0, (sum, m) => sum + m.memoryUsage);
    final totalFrameRate = _metricsHistory.fold(0.0, (sum, m) => sum + m.frameRate);
    final totalDroppedFrames = _metricsHistory.fold(0, (sum, m) => sum + m.droppedFrames);
    
    return PerformanceMetrics(
      cpuUsage: totalCpu / count,
      memoryUsage: totalMemory / count,
      batteryLevel: _metricsHistory.last.batteryLevel, // Use latest battery level
      networkType: _metricsHistory.last.networkType, // Use latest network type
      frameRate: totalFrameRate / count,
      droppedFrames: (totalDroppedFrames / count).round(),
      timestamp: DateTime.now(),
    );
  }
  
  /// Optimize memory usage
  Future<void> optimizeMemoryUsage() async {
    try {
      await _channel.invokeMethod('optimizeMemory');
      debugPrint('$_tag: Memory optimization triggered');
    } catch (e) {
      debugPrint('$_tag: Failed to optimize memory - $e');
    }
  }
  
  /// Get device information
  Future<Map<String, dynamic>> getDeviceInfo() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        return {
          'platform': 'Android',
          'model': androidInfo.model,
          'manufacturer': androidInfo.manufacturer,
          'version': androidInfo.version.release,
          'sdkInt': androidInfo.version.sdkInt,
          'totalMemory': '${androidInfo.systemFeatures}',
        };
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        return {
          'platform': 'iOS',
          'model': iosInfo.model,
          'name': iosInfo.name,
          'version': iosInfo.systemVersion,
          'identifier': iosInfo.identifierForVendor,
        };
      }
      
      return {'platform': 'Unknown'};
    } catch (e) {
      debugPrint('$_tag: Failed to get device info - $e');
      return {'platform': 'Error'};
    }
  }
  
  /// Track app launch metrics
  Future<void> trackLaunchMetrics(LaunchMetrics metrics) async {
    try {
      await _channel.invokeMethod('trackLaunchMetrics', metrics.toJson());
      debugPrint('$_tag: Launch metrics tracked: ${metrics.launchType}');
    } catch (e) {
      debugPrint('$_tag: Failed to track launch metrics - $e');
    }
  }
  
  /// Clear metrics history
  void clearHistory() {
    _metricsHistory.clear();
    debugPrint('$_tag: Metrics history cleared');
  }
  
  /// Export metrics for analysis
  Map<String, dynamic> exportMetrics() {
    return {
      'deviceInfo': getDeviceInfo(),
      'metricsHistory': _metricsHistory.map((m) => m.toJson()).toList(),
      'averageMetrics': getAverageMetrics()?.toJson(),
      'exportTimestamp': DateTime.now().toIso8601String(),
    };
  }
  
  /// Dispose resources
  void dispose() {
    stopMonitoring();
    _metricsHistory.clear();
    debugPrint('$_tag: Service disposed');
  }
}

/// Provider for performance service
@riverpod
PerformanceService performanceService(PerformanceServiceRef ref) {
  final service = PerformanceService();
  
  // Dispose service when provider is disposed
  ref.onDispose(() {
    service.dispose();
  });
  
  return service;
}
