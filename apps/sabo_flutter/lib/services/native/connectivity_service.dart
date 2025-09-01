import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;

part 'connectivity_service.g.dart';

/// Network connectivity status
enum ConnectivityStatus {
  connected,
  disconnected,
  unknown,
}

/// Network connection type
enum ConnectionType {
  wifi,
  mobile,
  ethernet,
  bluetooth,
  vpn,
  other,
  none,
}

/// Connectivity information
class ConnectivityInfo {
  final ConnectivityStatus status;
  final ConnectionType type;
  final bool isMetered;
  final String? ssid; // For WiFi connections
  
  const ConnectivityInfo({
    required this.status,
    required this.type,
    this.isMetered = false,
    this.ssid,
  });
  
  bool get isConnected => status == ConnectivityStatus.connected;
  bool get isWifi => type == ConnectionType.wifi;
  bool get isMobile => type == ConnectionType.mobile;
}

/// Network connectivity service
/// Monitors network status and handles offline scenarios
class ConnectivityService {
  static const String _tag = 'ConnectivityService';
  
  final StreamController<ConnectivityInfo> _connectivityController = 
      StreamController<ConnectivityInfo>.broadcast();
  
  ConnectivityInfo _currentInfo = const ConnectivityInfo(
    status: ConnectivityStatus.unknown,
    type: ConnectionType.none,
  );
  
  bool _isInitialized = false;
  StreamSubscription? _connectivitySubscription;
  Timer? _pingTimer;
  
  /// Stream of connectivity changes
  Stream<ConnectivityInfo> get connectivityStream => _connectivityController.stream;
  
  /// Current connectivity information
  ConnectivityInfo get currentInfo => _currentInfo;
  
  /// Initialize connectivity monitoring
  Future<void> initialize() async {
    if (_isInitialized) return;
    
    try {
      // TODO: Initialize connectivity monitoring
      // _connectivitySubscription = Connectivity().onConnectivityChanged.listen(_onConnectivityChanged);
      
      // Check initial connectivity
      await _checkConnectivity();
      
      // Start periodic ping test
      _startPingTest();
      
      _isInitialized = true;
      debugPrint('$_tag: Initialized connectivity monitoring');
    } catch (e) {
      debugPrint('$_tag: Failed to initialize - $e');
      rethrow;
    }
  }
  
  /// Dispose resources
  void dispose() {
    _connectivitySubscription?.cancel();
    _pingTimer?.cancel();
    _connectivityController.close();
    _isInitialized = false;
  }
  
  /// Check current connectivity status
  Future<ConnectivityInfo> checkConnectivity() async {
    await _checkConnectivity();
    return _currentInfo;
  }
  
  /// Test internet connectivity with ping
  Future<bool> hasInternetConnection() async {
    try {
      // TODO: Implement ping test
      // final result = await InternetConnectionChecker().hasConnection;
      debugPrint('$_tag: Internet connectivity test');
      return true; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to test internet connectivity - $e');
      return false;
    }
  }
  
  /// Wait for network connection
  Future<void> waitForConnection({Duration timeout = const Duration(seconds: 30)}) async {
    if (_currentInfo.isConnected) return;
    
    final completer = Completer<void>();
    late StreamSubscription subscription;
    
    subscription = connectivityStream.listen((info) {
      if (info.isConnected) {
        subscription.cancel();
        if (!completer.isCompleted) {
          completer.complete();
        }
      }
    });
    
    // Set timeout
    Timer(timeout, () {
      subscription.cancel();
      if (!completer.isCompleted) {
        completer.completeError(TimeoutException('Connection timeout', timeout));
      }
    });
    
    return completer.future;
  }
  
  /// Check if connection is suitable for large downloads
  bool isSuitableForLargeDownloads() {
    return _currentInfo.isConnected && 
           (_currentInfo.isWifi || !_currentInfo.isMetered);
  }
  
  /// Get connection quality description
  String getConnectionQuality() {
    if (!_currentInfo.isConnected) return 'No connection';
    
    switch (_currentInfo.type) {
      case ConnectionType.wifi:
        return 'WiFi';
      case ConnectionType.mobile:
        return _currentInfo.isMetered ? 'Mobile (Metered)' : 'Mobile';
      case ConnectionType.ethernet:
        return 'Ethernet';
      default:
        return 'Connected';
    }
  }
  
  /// Handle connectivity changes
  void _onConnectivityChanged(dynamic result) {
    debugPrint('$_tag: Connectivity changed: $result');
    _checkConnectivity();
  }
  
  /// Check and update connectivity status
  Future<void> _checkConnectivity() async {
    try {
      // TODO: Implement actual connectivity check
      // final connectivityResult = await Connectivity().checkConnectivity();
      
      // Simulate connectivity info
      final newInfo = const ConnectivityInfo(
        status: ConnectivityStatus.connected,
        type: ConnectionType.wifi,
        isMetered: false,
      );
      
      if (_currentInfo.status != newInfo.status || 
          _currentInfo.type != newInfo.type) {
        _currentInfo = newInfo;
        _connectivityController.add(_currentInfo);
        debugPrint('$_tag: Connectivity updated: ${newInfo.type.name}');
      }
    } catch (e) {
      debugPrint('$_tag: Failed to check connectivity - $e');
      
      final errorInfo = const ConnectivityInfo(
        status: ConnectivityStatus.unknown,
        type: ConnectionType.none,
      );
      
      if (_currentInfo.status != errorInfo.status) {
        _currentInfo = errorInfo;
        _connectivityController.add(_currentInfo);
      }
    }
  }
  
  /// Start periodic ping test
  void _startPingTest() {
    _pingTimer = Timer.periodic(const Duration(seconds: 30), (timer) async {
      if (_currentInfo.status == ConnectivityStatus.connected) {
        final hasInternet = await hasInternetConnection();
        if (!hasInternet) {
          final noInternetInfo = ConnectivityInfo(
            status: ConnectivityStatus.disconnected,
            type: _currentInfo.type,
            isMetered: _currentInfo.isMetered,
            ssid: _currentInfo.ssid,
          );
          
          _currentInfo = noInternetInfo;
          _connectivityController.add(_currentInfo);
          debugPrint('$_tag: No internet connection detected');
        }
      }
    });
  }
}

@riverpod
ConnectivityService connectivityService(ConnectivityServiceRef ref) {
  final service = ConnectivityService();
  ref.onDispose(() => service.dispose());
  return service;
}

/// Connectivity status provider
@riverpod
Stream<ConnectivityInfo> connectivityStatus(ConnectivityStatusRef ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.connectivityStream;
}

/// Current connectivity info provider
@riverpod
ConnectivityInfo currentConnectivity(CurrentConnectivityRef ref) {
  final service = ref.watch(connectivityServiceProvider);
  ref.watch(connectivityStatusProvider); // Watch for changes
  return service.currentInfo;
}
