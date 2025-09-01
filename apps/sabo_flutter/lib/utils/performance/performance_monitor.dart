import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'performance_monitor.g.dart';

/// Performance metrics data
class PerformanceMetrics {
  final double memoryUsage; // MB
  final double cpuUsage; // Percentage
  final int frameDropCount;
  final double frameRate; // FPS
  final Duration appStartTime;
  final Map<String, Duration> screenLoadTimes;
  final Map<String, int> networkRequestCounts;
  
  const PerformanceMetrics({
    required this.memoryUsage,
    required this.cpuUsage,
    required this.frameDropCount,
    required this.frameRate,
    required this.appStartTime,
    required this.screenLoadTimes,
    required this.networkRequestCounts,
  });
  
  Map<String, dynamic> toJson() => {
    'memoryUsage': memoryUsage,
    'cpuUsage': cpuUsage,
    'frameDropCount': frameDropCount,
    'frameRate': frameRate,
    'appStartTime': appStartTime.inMilliseconds,
    'screenLoadTimes': screenLoadTimes.map((k, v) => MapEntry(k, v.inMilliseconds)),
    'networkRequestCounts': networkRequestCounts,
  };
}

/// Screen loading performance tracker
class ScreenPerformanceTracker {
  final String screenName;
  final Stopwatch _stopwatch = Stopwatch();
  
  ScreenPerformanceTracker(this.screenName);
  
  void start() {
    _stopwatch.start();
  }
  
  Duration stop() {
    _stopwatch.stop();
    return _stopwatch.elapsed;
  }
}

/// Performance monitoring service
/// Tracks app performance metrics and provides optimization insights
class PerformanceMonitor {
  static const String _tag = 'PerformanceMonitor';
  
  final Map<String, Duration> _screenLoadTimes = {};
  final Map<String, int> _networkRequestCounts = {};
  final Map<String, ScreenPerformanceTracker> _activeTrackers = {};
  
  Timer? _metricsTimer;
  DateTime? _appStartTime;
  int _frameDropCount = 0;
  double _lastFrameRate = 60.0;
  
  /// Initialize performance monitoring
  void initialize() {
    _appStartTime = DateTime.now();
    _startMetricsCollection();
    _setupFrameCallbacks();
    debugPrint('$_tag: Performance monitoring initialized');
  }
  
  /// Dispose resources
  void dispose() {
    _metricsTimer?.cancel();
    _activeTrackers.clear();
  }
  
  /// Start tracking screen load time
  void startScreenLoad(String screenName) {
    final tracker = ScreenPerformanceTracker(screenName);
    tracker.start();
    _activeTrackers[screenName] = tracker;
    debugPrint('$_tag: Started tracking screen: $screenName');
  }
  
  /// Stop tracking screen load time
  void stopScreenLoad(String screenName) {
    final tracker = _activeTrackers.remove(screenName);
    if (tracker != null) {
      final loadTime = tracker.stop();
      _screenLoadTimes[screenName] = loadTime;
      debugPrint('$_tag: Screen $screenName loaded in ${loadTime.inMilliseconds}ms');
      
      // Log slow screens
      if (loadTime.inMilliseconds > 2000) {
        debugPrint('$_tag: WARNING - Slow screen load detected: $screenName');
      }
    }
  }
  
  /// Track network request
  void trackNetworkRequest(String endpoint) {
    _networkRequestCounts[endpoint] = (_networkRequestCounts[endpoint] ?? 0) + 1;
  }
  
  /// Get current performance metrics
  Future<PerformanceMetrics> getCurrentMetrics() async {
    final memoryUsage = await _getMemoryUsage();
    final cpuUsage = await _getCpuUsage();
    
    return PerformanceMetrics(
      memoryUsage: memoryUsage,
      cpuUsage: cpuUsage,
      frameDropCount: _frameDropCount,
      frameRate: _lastFrameRate,
      appStartTime: DateTime.now().difference(_appStartTime ?? DateTime.now()),
      screenLoadTimes: Map.from(_screenLoadTimes),
      networkRequestCounts: Map.from(_networkRequestCounts),
    );
  }
  
  /// Check for performance issues
  List<String> checkPerformanceIssues() {
    final issues = <String>[];
    
    // Check memory usage
    _getMemoryUsage().then((memory) {
      if (memory > 512) { // 512MB threshold
        issues.add('High memory usage detected: ${memory.toStringAsFixed(1)}MB');
      }
    });
    
    // Check frame drops
    if (_frameDropCount > 10) {
      issues.add('High frame drop count: $_frameDropCount');
    }
    
    // Check frame rate
    if (_lastFrameRate < 50) {
      issues.add('Low frame rate detected: ${_lastFrameRate.toStringAsFixed(1)} FPS');
    }
    
    // Check slow screens
    _screenLoadTimes.forEach((screen, duration) {
      if (duration.inMilliseconds > 3000) {
        issues.add('Slow screen load: $screen (${duration.inMilliseconds}ms)');
      }
    });
    
    return issues;
  }
  
  /// Get performance report
  Map<String, dynamic> getPerformanceReport() {
    final issues = checkPerformanceIssues();
    
    return {
      'timestamp': DateTime.now().toIso8601String(),
      'appUptime': DateTime.now().difference(_appStartTime ?? DateTime.now()).inMinutes,
      'screenLoadTimes': _screenLoadTimes.map((k, v) => MapEntry(k, v.inMilliseconds)),
      'networkRequestCounts': _networkRequestCounts,
      'frameDropCount': _frameDropCount,
      'frameRate': _lastFrameRate,
      'performanceIssues': issues,
      'memoryPressure': _getMemoryPressureLevel(),
    };
  }
  
  /// Clear performance data
  void clearMetrics() {
    _screenLoadTimes.clear();
    _networkRequestCounts.clear();
    _frameDropCount = 0;
    _lastFrameRate = 60.0;
    debugPrint('$_tag: Performance metrics cleared');
  }
  
  /// Start collecting performance metrics
  void _startMetricsCollection() {
    _metricsTimer = Timer.periodic(const Duration(seconds: 30), (timer) async {
      final metrics = await getCurrentMetrics();
      
      // Log metrics in debug mode
      if (kDebugMode) {
        debugPrint('$_tag: Memory: ${metrics.memoryUsage.toStringAsFixed(1)}MB, '
                  'CPU: ${metrics.cpuUsage.toStringAsFixed(1)}%, '
                  'FPS: ${metrics.frameRate.toStringAsFixed(1)}');
      }
      
      // Check for performance issues
      final issues = checkPerformanceIssues();
      if (issues.isNotEmpty) {
        debugPrint('$_tag: Performance issues detected: ${issues.join(', ')}');
      }
    });
  }
  
  /// Setup frame drop monitoring
  void _setupFrameCallbacks() {
    // TODO: Implement frame callback monitoring
    // SchedulerBinding.instance.addPersistentFrameCallback(_onFrame);
  }
  
  /// Handle frame callback
  void _onFrame(Duration timeStamp) {
    // TODO: Calculate frame rate and detect drops
    // This would be implemented with actual frame timing
  }
  
  /// Get current memory usage in MB
  Future<double> _getMemoryUsage() async {
    try {
      // TODO: Get actual memory usage
      // On Android/iOS this would use platform channels
      return 150.0; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to get memory usage - $e');
      return 0.0;
    }
  }
  
  /// Get current CPU usage percentage
  Future<double> _getCpuUsage() async {
    try {
      // TODO: Get actual CPU usage
      // This would require platform-specific implementation
      return 25.0; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to get CPU usage - $e');
      return 0.0;
    }
  }
  
  /// Get memory pressure level
  String _getMemoryPressureLevel() {
    // TODO: Implement actual memory pressure detection
    return 'Normal'; // Placeholder
  }
}

@riverpod
PerformanceMonitor performanceMonitor(PerformanceMonitorRef ref) {
  final monitor = PerformanceMonitor();
  monitor.initialize();
  ref.onDispose(() => monitor.dispose());
  return monitor;
}
