import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'error_boundary_service.g.dart';

/// Error severity levels
enum ErrorSeverity {
  low,
  medium,
  high,
  critical,
}

/// Error categories
enum ErrorCategory {
  network,
  authentication,
  payment,
  tournament,
  ui,
  performance,
  system,
  unknown,
}

/// Error report data class
class ErrorReport {
  final String id;
  final String message;
  final String? stackTrace;
  final ErrorSeverity severity;
  final ErrorCategory category;
  final Map<String, dynamic> context;
  final DateTime timestamp;
  final String? userId;
  final String? screenName;
  final bool isFatal;
  
  ErrorReport({
    required this.id,
    required this.message,
    this.stackTrace,
    required this.severity,
    required this.category,
    required this.context,
    required this.timestamp,
    this.userId,
    this.screenName,
    this.isFatal = false,
  });
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'message': message,
    'stackTrace': stackTrace,
    'severity': severity.name,
    'category': category.name,
    'context': context,
    'timestamp': timestamp.toIso8601String(),
    'userId': userId,
    'screenName': screenName,
    'isFatal': isFatal,
  };
  
  @override
  String toString() {
    return 'ErrorReport(id: $id, severity: ${severity.name}, category: ${category.name}, message: $message)';
  }
}

/// Error boundary service for handling and reporting errors
/// Provides comprehensive error tracking and recovery mechanisms
class ErrorBoundaryService {
  static const String _tag = 'ErrorBoundaryService';
  
  bool _isInitialized = false;
  final List<ErrorReport> _errorHistory = [];
  final StreamController<ErrorReport> _errorController = 
      StreamController<ErrorReport>.broadcast();
  
  String? _currentUserId;
  String? _currentScreenName;
  
  /// Initialize error boundary service
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Set up Flutter error handling
      _setupFlutterErrorHandling();
      
      // Set up platform error handling
      _setupPlatformErrorHandling();
      
      // Set up zone error handling
      _setupZoneErrorHandling();
      
      _isInitialized = true;
      debugPrint('$_tag: Initialized successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize - $e');
      rethrow;
    }
  }
  
  /// Set up Flutter framework error handling
  void _setupFlutterErrorHandling() {
    FlutterError.onError = (FlutterErrorDetails details) {
      final error = ErrorReport(
        id: _generateErrorId(),
        message: details.exception.toString(),
        stackTrace: details.stack.toString(),
        severity: _determineSeverity(details.exception),
        category: _categorizeError(details.exception),
        context: {
          'library': details.library,
          'context': details.context?.toString(),
          'informationCollector': details.informationCollector?.toString(),
          'silent': details.silent,
        },
        timestamp: DateTime.now(),
        userId: _currentUserId,
        screenName: _currentScreenName,
        isFatal: !details.silent,
      );
      
      _handleError(error);
    };
  }
  
  /// Set up platform-specific error handling
  void _setupPlatformErrorHandling() {
    PlatformDispatcher.instance.onError = (error, stack) {
      final errorReport = ErrorReport(
        id: _generateErrorId(),
        message: error.toString(),
        stackTrace: stack.toString(),
        severity: ErrorSeverity.high,
        category: ErrorCategory.system,
        context: {
          'platform': Platform.operatingSystem,
          'type': 'platform_error',
        },
        timestamp: DateTime.now(),
        userId: _currentUserId,
        screenName: _currentScreenName,
        isFatal: true,
      );
      
      _handleError(errorReport);
      return true; // Indicates error was handled
    };
  }
  
  /// Set up zone error handling for async errors
  void _setupZoneErrorHandling() {
    runZonedGuarded(() {
      // Application code runs in this zone
    }, (error, stack) {
      final errorReport = ErrorReport(
        id: _generateErrorId(),
        message: error.toString(),
        stackTrace: stack.toString(),
        severity: ErrorSeverity.medium,
        category: ErrorCategory.system,
        context: {
          'type': 'async_error',
          'zone': 'error_boundary',
        },
        timestamp: DateTime.now(),
        userId: _currentUserId,
        screenName: _currentScreenName,
        isFatal: false,
      );
      
      _handleError(errorReport);
    });
  }
  
  /// Handle error reporting and recovery
  void _handleError(ErrorReport error) {
    try {
      // Add to error history
      _errorHistory.add(error);
      
      // Keep only last 50 errors to prevent memory leaks
      if (_errorHistory.length > 50) {
        _errorHistory.removeAt(0);
      }
      
      // Notify error stream listeners
      _errorController.add(error);
      
      // Log error for debugging
      debugPrint('$_tag: Error captured - $error');
      
      // Send to analytics/crash reporting if critical
      if (error.severity == ErrorSeverity.critical || error.isFatal) {
        _reportToAnalytics(error);
      }
      
      // Attempt recovery for specific error types
      _attemptRecovery(error);
      
    } catch (e) {
      debugPrint('$_tag: Failed to handle error - $e');
    }
  }
  
  /// Determine error severity based on exception type
  ErrorSeverity _determineSeverity(Object exception) {
    if (exception is OutOfMemoryError || 
        exception is StackOverflowError) {
      return ErrorSeverity.critical;
    } else if (exception is AssertionError ||
               exception is StateError) {
      return ErrorSeverity.high;
    } else if (exception is ArgumentError ||
               exception is FormatException) {
      return ErrorSeverity.medium;
    } else {
      return ErrorSeverity.low;
    }
  }
  
  /// Categorize error based on exception type and context
  ErrorCategory _categorizeError(Object exception) {
    final errorString = exception.toString().toLowerCase();
    
    if (errorString.contains('network') || 
        errorString.contains('http') ||
        errorString.contains('socket')) {
      return ErrorCategory.network;
    } else if (errorString.contains('auth') ||
               errorString.contains('permission')) {
      return ErrorCategory.authentication;
    } else if (errorString.contains('payment') ||
               errorString.contains('transaction')) {
      return ErrorCategory.payment;
    } else if (errorString.contains('tournament') ||
               errorString.contains('bracket')) {
      return ErrorCategory.tournament;
    } else if (errorString.contains('render') ||
               errorString.contains('widget') ||
               errorString.contains('layout')) {
      return ErrorCategory.ui;
    } else if (errorString.contains('memory') ||
               errorString.contains('performance')) {
      return ErrorCategory.performance;
    } else {
      return ErrorCategory.unknown;
    }
  }
  
  /// Generate unique error ID
  String _generateErrorId() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final random = (timestamp % 10000).toString().padLeft(4, '0');
    return 'ERR_${timestamp}_$random';
  }
  
  /// Report critical errors to analytics
  void _reportToAnalytics(ErrorReport error) {
    // TODO: Implement analytics reporting
    debugPrint('$_tag: Reporting to analytics - ${error.id}');
  }
  
  /// Attempt recovery based on error type
  void _attemptRecovery(ErrorReport error) {
    switch (error.category) {
      case ErrorCategory.network:
        _attemptNetworkRecovery();
        break;
      case ErrorCategory.authentication:
        _attemptAuthRecovery();
        break;
      case ErrorCategory.payment:
        _attemptPaymentRecovery();
        break;
      case ErrorCategory.performance:
        _attemptPerformanceRecovery();
        break;
      default:
        // No specific recovery for other categories
        break;
    }
  }
  
  /// Attempt network error recovery
  void _attemptNetworkRecovery() {
    debugPrint('$_tag: Attempting network recovery');
    // TODO: Implement network recovery logic
  }
  
  /// Attempt authentication error recovery
  void _attemptAuthRecovery() {
    debugPrint('$_tag: Attempting auth recovery');
    // TODO: Implement auth recovery logic
  }
  
  /// Attempt payment error recovery
  void _attemptPaymentRecovery() {
    debugPrint('$_tag: Attempting payment recovery');
    // TODO: Implement payment recovery logic
  }
  
  /// Attempt performance error recovery
  void _attemptPerformanceRecovery() {
    debugPrint('$_tag: Attempting performance recovery');
    // TODO: Force garbage collection, clear caches, etc.
  }
  
  /// Report error manually
  void reportError(
    String message, {
    Object? exception,
    StackTrace? stackTrace,
    ErrorSeverity severity = ErrorSeverity.medium,
    ErrorCategory category = ErrorCategory.unknown,
    Map<String, dynamic>? context,
    bool isFatal = false,
  }) {
    final error = ErrorReport(
      id: _generateErrorId(),
      message: message,
      stackTrace: stackTrace?.toString() ?? exception?.toString(),
      severity: severity,
      category: category,
      context: context ?? {},
      timestamp: DateTime.now(),
      userId: _currentUserId,
      screenName: _currentScreenName,
      isFatal: isFatal,
    );
    
    _handleError(error);
  }
  
  /// Set current user context
  void setUserContext(String userId) {
    _currentUserId = userId;
    debugPrint('$_tag: User context set - $userId');
  }
  
  /// Set current screen context
  void setScreenContext(String screenName) {
    _currentScreenName = screenName;
    debugPrint('$_tag: Screen context set - $screenName');
  }
  
  /// Clear user context
  void clearUserContext() {
    _currentUserId = null;
    debugPrint('$_tag: User context cleared');
  }
  
  /// Get error history
  List<ErrorReport> getErrorHistory() {
    return List.unmodifiable(_errorHistory);
  }
  
  /// Get error stream
  Stream<ErrorReport> get errorStream => _errorController.stream;
  
  /// Get errors by category
  List<ErrorReport> getErrorsByCategory(ErrorCategory category) {
    return _errorHistory.where((error) => error.category == category).toList();
  }
  
  /// Get errors by severity
  List<ErrorReport> getErrorsBySeverity(ErrorSeverity severity) {
    return _errorHistory.where((error) => error.severity == severity).toList();
  }
  
  /// Get error statistics
  Map<String, int> getErrorStatistics() {
    final stats = <String, int>{};
    
    for (final category in ErrorCategory.values) {
      stats['${category.name}_count'] = getErrorsByCategory(category).length;
    }
    
    for (final severity in ErrorSeverity.values) {
      stats['${severity.name}_count'] = getErrorsBySeverity(severity).length;
    }
    
    stats['total_count'] = _errorHistory.length;
    stats['fatal_count'] = _errorHistory.where((e) => e.isFatal).length;
    
    return stats;
  }
  
  /// Clear error history
  void clearErrorHistory() {
    _errorHistory.clear();
    debugPrint('$_tag: Error history cleared');
  }
  
  /// Export error reports
  Map<String, dynamic> exportErrorReports() {
    return {
      'errors': _errorHistory.map((e) => e.toJson()).toList(),
      'statistics': getErrorStatistics(),
      'exportTimestamp': DateTime.now().toIso8601String(),
    };
  }
  
  /// Dispose resources
  void dispose() {
    _errorController.close();
    _errorHistory.clear();
    _isInitialized = false;
    debugPrint('$_tag: Service disposed');
  }
}

/// Provider for error boundary service
@riverpod
ErrorBoundaryService errorBoundaryService(ErrorBoundaryServiceRef ref) {
  final service = ErrorBoundaryService();
  
  // Initialize service
  service.initialize();
  
  // Dispose service when provider is disposed
  ref.onDispose(() {
    service.dispose();
  });
  
  return service;
}

/// Provider for error stream
@riverpod
Stream<ErrorReport> errorStream(ErrorStreamRef ref) {
  final service = ref.watch(errorBoundaryServiceProvider);
  return service.errorStream;
}
