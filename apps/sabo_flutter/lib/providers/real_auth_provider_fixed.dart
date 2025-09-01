import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/auth_state_simple.dart' as AppAuth;
import '../models/user_model_simple.dart' as AppUser;
import '../services/supabase/supabase_service.dart';

// Auth State Provider với Supabase thực
final realAuthStateProvider = StateNotifierProvider<RealAuthNotifier, AppAuth.AuthState>((ref) {
  return RealAuthNotifier();
});

// Auth Guard Provider for routing
final realAuthGuardProvider = Provider<bool>((ref) {
  final authState = ref.watch(realAuthStateProvider);
  return authState.isAuthenticated;
});

// Onboarding Check Provider
final onboardingProvider = FutureProvider<bool>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool('onboarding_completed') ?? false;
});

class RealAuthNotifier extends StateNotifier<AppAuth.AuthState> {
  RealAuthNotifier() : super(const AppAuth.AuthStateInitial()) {
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      // Khởi tạo Supabase
      await SupabaseService.initialize();
      
      // Lắng nghe thay đổi auth state
      SupabaseService.authStateChanges.listen((authState) {
        _handleAuthStateChange(authState);
      });
      
      // Kiểm tra auth status hiện tại
      await _checkAuthStatus();
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Khởi tạo thất bại: $e');
    }
  }

  void _handleAuthStateChange(AuthState authState) {
    if (authState.event == AuthChangeEvent.signedIn && authState.session != null) {
      _updateAuthenticatedState(authState.session!.user);
    } else if (authState.event == AuthChangeEvent.signedOut) {
      state = const AppAuth.AuthStateUnauthenticated();
      _clearLocalData();
    }
  }

  Future<void> _checkAuthStatus() async {
    try {
      final user = SupabaseService.currentUser;
      if (user != null) {
        await _updateAuthenticatedState(user);
      } else {
        state = const AppAuth.AuthStateUnauthenticated();
      }
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Kiểm tra auth thất bại: $e');
    }
  }

  Future<void> _updateAuthenticatedState(User supabaseUser) async {
    try {
      // Lấy thông tin user từ database
      final response = await SupabaseService.client
          .from('users')
          .select()
          .eq('auth_user_id', supabaseUser.id)
          .single();

      final userData = response as Map<String, dynamic>;
      
      final user = AppUser.User(
        id: userData['id'].toString(),
        name: userData['full_name'] ?? supabaseUser.email ?? 'User',
        email: supabaseUser.email ?? '',
        phone: userData['phone'] ?? '',
        avatar: userData['avatar_url'],
        eloRating: userData['elo_rating'] ?? 1200,
        rank: userData['current_rank'] ?? 'Beginner',
        joinedDate: DateTime.parse(userData['created_at']),
      );

      // Lưu auth data local
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', supabaseUser.id);
      await prefs.setString('user_data', user.toJson().toString());

      state = AppAuth.AuthStateAuthenticated(user: user, token: supabaseUser.id);
    } catch (e) {
      // Nếu không tìm thấy user record, tạo mới
      await _createUserRecord(supabaseUser);
    }
  }

  Future<void> _createUserRecord(User supabaseUser) async {
    try {
      final userData = {
        'auth_user_id': supabaseUser.id,
        'email': supabaseUser.email,
        'full_name': supabaseUser.userMetadata?['full_name'] ?? 'User',
        'phone': supabaseUser.userMetadata?['phone'] ?? '',
        'avatar_url': null,
        'elo_rating': 1200,
        'current_rank': 'Beginner',
        'total_matches': 0,
        'total_wins': 0,
        'total_losses': 0,
        'total_draws': 0,
        'spa_balance': 0,
        'created_at': DateTime.now().toIso8601String(),
        'updated_at': DateTime.now().toIso8601String(),
      };

      final response = await SupabaseService.client
          .from('users')
          .insert(userData)
          .select()
          .single();

      final data = response as Map<String, dynamic>;
      
      final user = AppUser.User(
        id: data['id'].toString(),
        name: data['full_name'],
        email: data['email'],
        phone: data['phone'] ?? '',
        avatar: data['avatar_url'],
        eloRating: data['elo_rating'],
        rank: data['current_rank'],
        joinedDate: DateTime.parse(data['created_at']),
      );

      state = AppAuth.AuthStateAuthenticated(user: user, token: supabaseUser.id);
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Tạo user record thất bại: $e');
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = const AppAuth.AuthStateLoading();
    
    try {
      final response = await SupabaseService.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        // _updateAuthenticatedState sẽ được gọi tự động qua auth state listener
      } else {
        state = const AppAuth.AuthStateError(message: 'Đăng nhập thất bại');
      }
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Đăng nhập thất bại: ${e.toString()}');
    }
  }

  Future<void> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = const AppAuth.AuthStateLoading();
    
    try {
      final response = await SupabaseService.signUp(
        email: email,
        password: password,
        data: {
          'full_name': fullName,
          'phone': phone ?? '',
        },
      );

      if (response.user != null) {
        // _updateAuthenticatedState sẽ được gọi tự động qua auth state listener
        state = const AppAuth.AuthStateOtpVerified(); // Cần xác thực email
      } else {
        state = const AppAuth.AuthStateError(message: 'Đăng ký thất bại');
      }
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Đăng ký thất bại: ${e.toString()}');
    }
  }

  Future<void> verifyOTP({
    required String otp,
    required String identifier,
    required String verificationType,
  }) async {
    state = const AppAuth.AuthStateLoading();
    
    try {
      // Với Supabase, OTP verification thường được xử lý qua email link
      // Hoặc có thể sử dụng verifyOTP nếu đã cấu hình
      await Future.delayed(const Duration(seconds: 1));
      state = const AppAuth.AuthStateOtpVerified();
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Xác thực OTP thất bại: ${e.toString()}');
    }
  }

  Future<void> sendPasswordReset({
    required String email,
  }) async {
    state = const AppAuth.AuthStateLoading();
    
    try {
      await SupabaseService.resetPassword(email: email);
      state = const AppAuth.AuthStatePasswordResetSent();
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Gửi reset password thất bại: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    try {
      await SupabaseService.signOut();
      await _clearLocalData();
      state = const AppAuth.AuthStateUnauthenticated();
    } catch (e) {
      state = AppAuth.AuthStateError(message: 'Đăng xuất thất bại: ${e.toString()}');
    }
  }

  Future<void> completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_completed', true);
  }

  Future<void> _clearLocalData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
  }
}
