import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_ios/local_auth_ios.dart';

part 'biometric_service.g.dart';

/// Biometric authentication types
enum BiometricType {
  none,
  fingerprint,
  face,
  iris,
}

/// Result of biometric authentication
class BiometricResult {
  final bool isAuthenticated;
  final String? errorMessage;
  final BiometricType? usedBiometric;
  
  const BiometricResult({
    required this.isAuthenticated,
    this.errorMessage,
    this.usedBiometric,
  });
  
  factory BiometricResult.success(BiometricType type) {
    return BiometricResult(
      isAuthenticated: true,
      usedBiometric: type,
    );
  }
  
  factory BiometricResult.failure(String error) {
    return BiometricResult(
      isAuthenticated: false,
      errorMessage: error,
    );
  }
}

/// Biometric authentication service
/// Handles fingerprint, face recognition, and other biometric authentication
class BiometricService {
  static const String _tag = 'BiometricService';
  
  /// Check if biometric authentication is available
  Future<bool> isAvailable() async {
    try {
      // TODO: Check biometric availability
      // final bool isAvailable = await LocalAuthentication().isDeviceSupported();
      // final bool canCheckBiometrics = await LocalAuthentication().canCheckBiometrics;
      // return isAvailable && canCheckBiometrics;
      
      debugPrint('$_tag: Checking biometric availability');
      return true; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to check biometric availability - $e');
      return false;
    }
  }
  
  /// Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      // TODO: Get available biometric types
      // final List<BiometricType> availableBiometrics = await LocalAuthentication().getAvailableBiometrics();
      
      debugPrint('$_tag: Getting available biometrics');
      return [BiometricType.fingerprint]; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to get available biometrics - $e');
      return [];
    }
  }
  
  /// Authenticate using biometrics
  Future<BiometricResult> authenticate({
    String localizedFallbackTitle = 'Use Passcode',
    String reason = 'Authenticate to access your account',
  }) async {
    try {
      // TODO: Perform biometric authentication
      // final bool isAuthenticated = await LocalAuthentication().authenticate(
      //   localizedFallbackTitle: localizedFallbackTitle,
      //   authMessages: [
      //     AndroidAuthMessages(
      //       biometricHint: reason,
      //       signInTitle: 'Biometric Authentication',
      //       cancelButton: 'Cancel',
      //     ),
      //     IOSAuthMessages(
      //       lockOut: 'Please re-enable your Touch ID',
      //       goToSettingsButton: 'Settings',
      //       cancelButton: 'Cancel',
      //     ),
      //   ],
      // );
      
      debugPrint('$_tag: Biometric authentication attempt');
      return BiometricResult.success(BiometricType.fingerprint); // Placeholder
    } on PlatformException catch (e) {
      debugPrint('$_tag: Biometric authentication failed - ${e.message}');
      return BiometricResult.failure(e.message ?? 'Authentication failed');
    } catch (e) {
      debugPrint('$_tag: Unexpected error during authentication - $e');
      return BiometricResult.failure('Unexpected error occurred');
    }
  }
  
  /// Stop biometric authentication
  Future<void> stopAuthentication() async {
    try {
      // TODO: Stop authentication
      // await LocalAuthentication().stopAuthentication();
      debugPrint('$_tag: Biometric authentication stopped');
    } catch (e) {
      debugPrint('$_tag: Failed to stop authentication - $e');
    }
  }
  
  /// Check if device supports biometric authentication
  Future<bool> isDeviceSupported() async {
    try {
      // TODO: Check device support
      // return await LocalAuthentication().isDeviceSupported();
      return true; // Placeholder
    } catch (e) {
      debugPrint('$_tag: Failed to check device support - $e');
      return false;
    }
  }
}

@riverpod
BiometricService biometricService(BiometricServiceRef ref) {
  return BiometricService();
}
