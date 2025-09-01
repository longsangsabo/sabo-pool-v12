import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth_state_simple.dart';
import '../models/user_model_simple.dart';

// Auth State Provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

// Auth Guard Provider for routing
final authGuardProvider = Provider<bool>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.isAuthenticated;
});

// Onboarding Check Provider
final onboardingProvider = FutureProvider<bool>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool('onboarding_completed') ?? false;
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthStateInitial()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userJson = prefs.getString('user_data');
      
      if (token != null && userJson != null) {
        // TODO: Verify token with backend
        final user = User.fromJson(userJson);
        state = AuthStateAuthenticated(user: user, token: token);
      } else {
        state = const AuthStateUnauthenticated();
      }
    } catch (e) {
      state = AuthStateError(message: 'Authentication check failed: $e');
    }
  }

  Future<void> login({
    required String identifier, // phone or email
    required String password,
    required String method, // 'phone' or 'email'
  }) async {
    state = const AuthStateLoading();
    
    try {
      // TODO: Implement actual API call
      await Future.delayed(const Duration(seconds: 2)); // Simulate API
      
      // Mock successful login
      final user = User(
        id: '1',
        name: 'Người dùng demo',
        email: method == 'email' ? identifier : 'demo@example.com',
        phone: method == 'phone' ? identifier : '+84961167717',
        avatar: null,
        eloRating: 1200,
        rank: 'Beginner',
        joinedDate: DateTime.now(),
      );
      
      const token = 'demo_auth_token_12345';
      
      // Save auth data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      await prefs.setString('user_data', user.toJson().toString());
      
      state = AuthStateAuthenticated(user: user, token: token);
    } catch (e) {
      state = AuthStateError(message: 'Đăng nhập thất bại: $e');
    }
  }

  Future<void> register({
    required String fullName,
    required String identifier, // phone or email
    required String password,
    required String method, // 'phone' or 'email'
  }) async {
    state = const AuthStateLoading();
    
    try {
      // TODO: Implement actual API call
      await Future.delayed(const Duration(seconds: 2)); // Simulate API
      
      // Mock successful registration
      final user = User(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        name: fullName,
        email: method == 'email' ? identifier : 'new@example.com',
        phone: method == 'phone' ? identifier : '+84961167717',
        avatar: null,
        eloRating: 1000, // Starting ELO
        rank: 'Newcomer',
        joinedDate: DateTime.now(),
      );
      
      const token = 'new_demo_auth_token_12345';
      
      // Save auth data
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', token);
      await prefs.setString('user_data', user.toJson().toString());
      
      state = AuthStateAuthenticated(user: user, token: token);
    } catch (e) {
      state = AuthStateError(message: 'Đăng ký thất bại: $e');
    }
  }

  Future<void> verifyOTP({
    required String otp,
    required String identifier,
    required String verificationType,
  }) async {
    state = const AuthStateLoading();
    
    try {
      // TODO: Implement actual OTP verification
      await Future.delayed(const Duration(seconds: 2)); // Simulate API
      
      if (otp == '123456') { // Demo OTP
        // OTP verified, proceed with registration/login completion
        state = const AuthStateOtpVerified();
      } else {
        throw Exception('Mã OTP không đúng');
      }
    } catch (e) {
      state = AuthStateError(message: 'Xác thực OTP thất bại: $e');
    }
  }

  Future<void> sendPasswordReset({
    required String identifier,
    required String method,
  }) async {
    state = const AuthStateLoading();
    
    try {
      // TODO: Implement actual password reset
      await Future.delayed(const Duration(seconds: 2)); // Simulate API
      
      state = const AuthStatePasswordResetSent();
    } catch (e) {
      state = AuthStateError(message: 'Gửi email đặt lại mật khẩu thất bại: $e');
    }
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('user_data');
      
      state = const AuthStateUnauthenticated();
    } catch (e) {
      state = AuthStateError(message: 'Đăng xuất thất bại: $e');
    }
  }

  Future<void> completeOnboarding() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('onboarding_completed', true);
    } catch (e) {
      // Handle error silently for onboarding
    }
  }

  void clearError() {
    if (state is AuthStateError) {
      state = const AuthStateUnauthenticated();
    }
  }
}
