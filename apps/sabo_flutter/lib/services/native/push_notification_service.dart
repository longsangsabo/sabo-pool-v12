import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../bridge/shared_services_bridge.dart';

part 'push_notification_service.g.dart';

/// Push notification service for handling device notifications
/// Integrates with Firebase Cloud Messaging, local notifications, and shared business logic
class PushNotificationService {
  static const String _tag = 'PushNotificationService';
  
  bool _isInitialized = false;
  String? _deviceToken;
  final SharedServicesBridge _bridge = SharedServicesBridge.instance;
  
  /// Initialize push notification service with shared logic integration
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // Initialize shared services bridge first
      await _bridge.initialize();
      
      // Initialize shared notification service
      await _bridge.callNotificationService('initialize', {
        'platform': defaultTargetPlatform.name,
        'app_version': '1.0.0', // TODO: Get from package info
      });
      
      // TODO: Initialize Firebase Messaging
      // await FirebaseMessaging.instance.requestPermission();
      
      // TODO: Get device token
      // _deviceToken = await FirebaseMessaging.instance.getToken();
      
      // Register device token with shared service
      if (_deviceToken != null) {
        await _registerDeviceToken(_deviceToken!);
      }
      
      _isInitialized = true;
      debugPrint('$_tag: Initialized successfully with shared logic');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize - $e');
      rethrow;
    }
  }
  
  /// Get current device token
  String? get deviceToken => _deviceToken;
  
  /// Register device token with shared notification service
  Future<void> _registerDeviceToken(String token) async {
    try {
      await _bridge.callNotificationService('registerPushToken', {
        'token': token,
        'platform': defaultTargetPlatform.name.toLowerCase(),
        'device_id': 'flutter_device', // TODO: Get actual device ID
        'app_version': '1.0.0',
      });
      debugPrint('$_tag: Device token registered successfully');
    } catch (e) {
      debugPrint('$_tag: Failed to register device token - $e');
    }
  }
  
  /// Subscribe to tournament notifications using shared logic
  Future<void> subscribeToTournament(String tournamentId) async {
    if (!_isInitialized) await initialize();
    
    try {
      // Use shared notification service for subscription
      await _bridge.callNotificationService('subscribeToTopic', {
        'topic': 'tournament_$tournamentId',
        'user_id': 'current_user_id', // TODO: Get from auth service
      });
      
      // TODO: Also subscribe with FCM
      // await FirebaseMessaging.instance.subscribeToTopic('tournament_$tournamentId');
      debugPrint('$_tag: Subscribed to tournament $tournamentId via shared service');
    } catch (e) {
      debugPrint('$_tag: Failed to subscribe to tournament $tournamentId - $e');
    }
  }
  
  /// Unsubscribe from tournament notifications
  Future<void> unsubscribeFromTournament(String tournamentId) async {
    if (!_isInitialized) return;
    
    try {
      // TODO: Unsubscribe from topic
      // await FirebaseMessaging.instance.unsubscribeFromTopic('tournament_$tournamentId');
      debugPrint('$_tag: Unsubscribed from tournament $tournamentId');
    } catch (e) {
      debugPrint('$_tag: Failed to unsubscribe from tournament $tournamentId - $e');
    }
  }
  
  /// Schedule local notification
  Future<void> scheduleLocalNotification({
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
  }) async {
    try {
      // TODO: Schedule local notification
      debugPrint('$_tag: Scheduled notification: $title');
    } catch (e) {
      debugPrint('$_tag: Failed to schedule notification - $e');
    }
  }
  
  /// Handle notification tap
  void handleNotificationTap(Map<String, dynamic> payload) {
    debugPrint('$_tag: Notification tapped with payload: $payload');
    // TODO: Navigate to appropriate screen based on payload
  }
}

@riverpod
PushNotificationService pushNotificationService(PushNotificationServiceRef ref) {
  return PushNotificationService();
}
