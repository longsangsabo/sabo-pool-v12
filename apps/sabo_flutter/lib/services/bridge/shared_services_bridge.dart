import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Bridge service to communicate with shared TypeScript business logic
/// Provides a unified interface between Flutter and shared-business packages
class SharedServicesBridge {
  static const String _tag = 'SharedServicesBridge';
  static const MethodChannel _channel = MethodChannel('sabo_pool/shared_services');
  
  static SharedServicesBridge? _instance;
  static SharedServicesBridge get instance => _instance ??= SharedServicesBridge._();
  SharedServicesBridge._();
  
  bool _isInitialized = false;
  
  /// Initialize the bridge connection
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Set up method call handler for callbacks from shared services
      _channel.setMethodCallHandler(_handleMethodCall);
      
      // Initialize connection with shared services
      await _channel.invokeMethod('initialize');
      
      _isInitialized = true;
      debugPrint('$_tag: Bridge initialized successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize bridge - $e');
      rethrow;
    }
  }
  
  /// Handle method calls from shared services
  Future<dynamic> _handleMethodCall(MethodCall call) async {
    switch (call.method) {
      case 'onNotificationReceived':
        return _handleNotificationReceived(call.arguments);
      case 'onOfflineDataSync':
        return _handleOfflineDataSync(call.arguments);
      case 'onWebSocketMessage':
        return _handleWebSocketMessage(call.arguments);
      default:
        debugPrint('$_tag: Unknown method call: ${call.method}');
        return null;
    }
  }
  
  /// Handle notification callbacks
  Future<void> _handleNotificationReceived(dynamic arguments) async {
    debugPrint('$_tag: Notification received: $arguments');
    // Delegate to NotificationService
  }
  
  /// Handle offline data sync callbacks
  Future<void> _handleOfflineDataSync(dynamic arguments) async {
    debugPrint('$_tag: Offline data sync: $arguments');
    // Delegate to OfflineDataService
  }
  
  /// Handle WebSocket message callbacks
  Future<void> _handleWebSocketMessage(dynamic arguments) async {
    debugPrint('$_tag: WebSocket message: $arguments');
    // Delegate to WebSocketService
  }
  
  /// Call shared notification service
  Future<Map<String, dynamic>?> callNotificationService(
    String method, 
    Map<String, dynamic> params
  ) async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _channel.invokeMethod('notificationService', {
        'method': method,
        'params': params,
      });
      
      return result != null ? Map<String, dynamic>.from(result) : null;
    } catch (e) {
      debugPrint('$_tag: NotificationService call failed - $e');
      rethrow;
    }
  }
  
  /// Call shared offline data service
  Future<Map<String, dynamic>?> callOfflineDataService(
    String method, 
    Map<String, dynamic> params
  ) async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _channel.invokeMethod('offlineDataService', {
        'method': method,
        'params': params,
      });
      
      return result != null ? Map<String, dynamic>.from(result) : null;
    } catch (e) {
      debugPrint('$_tag: OfflineDataService call failed - $e');
      rethrow;
    }
  }
  
  /// Call shared WebSocket service
  Future<Map<String, dynamic>?> callWebSocketService(
    String method, 
    Map<String, dynamic> params
  ) async {
    if (!_isInitialized) await initialize();
    
    try {
      final result = await _channel.invokeMethod('webSocketService', {
        'method': method,
        'params': params,
      });
      
      return result != null ? Map<String, dynamic>.from(result) : null;
    } catch (e) {
      debugPrint('$_tag: WebSocketService call failed - $e');
      rethrow;
    }
  }
  
  /// Dispose resources
  void dispose() {
    _isInitialized = false;
    debugPrint('$_tag: Bridge disposed');
  }
}
