import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../services/supabase/supabase_service.dart';

final authProvider = StreamProvider<User?>((ref) {
  return SupabaseService.authStateChanges.map((state) => state.session?.user);
});

final authControllerProvider = Provider<AuthController>((ref) {
  return AuthController(ref);
});

class AuthController {
  final Ref _ref;
  
  AuthController(this._ref);
  
  Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final response = await SupabaseService.signInWithPassword(
        email: email,
        password: password,
      );
      
      if (response.user == null) {
        throw Exception('Login failed - Invalid credentials');
      }
      
      return response;
    } catch (error) {
      throw Exception('Login failed: ${error.toString()}');
    }
  }
  
  Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String fullName,
  }) async {
    try {
      final response = await SupabaseService.signUp(
        email: email,
        password: password,
        data: {
          'full_name': fullName,
          'display_name': fullName,
        },
      );
      
      if (response.user == null) {
        throw Exception('Registration failed');
      }
      
      return response;
    } catch (error) {
      throw Exception('Registration failed: ${error.toString()}');
    }
  }
  
  Future<void> resetPassword({
    required String email,
  }) async {
    try {
      await SupabaseService.resetPassword(email: email);
    } catch (error) {
      throw Exception('Password reset failed: ${error.toString()}');
    }
  }
  
  Future<void> signOut() async {
    try {
      await SupabaseService.signOut();
    } catch (error) {
      throw Exception('Sign out failed: ${error.toString()}');
    }
  }
  
  // Get current user info
  User? get currentUser => SupabaseService.currentUser;
  
  // Check if user is authenticated
  bool get isAuthenticated => currentUser != null;
}
