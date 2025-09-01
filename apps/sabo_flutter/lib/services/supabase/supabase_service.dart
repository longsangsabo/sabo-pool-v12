import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/constants/app_constants.dart';

class SupabaseService {
  static SupabaseClient? _client;
  
  static SupabaseClient get client {
    _client ??= Supabase.instance.client;
    return _client!;
  }
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: AppConstants.supabaseUrl,
      anonKey: AppConstants.supabaseAnonKey,
    );
  }
  
  // Auth methods
  static User? get currentUser => client.auth.currentUser;
  
  static Stream<AuthState> get authStateChanges => 
    client.auth.onAuthStateChange;
  
  static Future<AuthResponse> signInWithPassword({
    required String email,
    required String password,
  }) async {
    return await client.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }
  
  static Future<AuthResponse> signUp({
    required String email,
    required String password,
    Map<String, dynamic>? data,
  }) async {
    return await client.auth.signUp(
      email: email,
      password: password,
      data: data,
    );
  }
  
  static Future<void> resetPassword({
    required String email,
  }) async {
    await client.auth.resetPasswordForEmail(
      email,
      redirectTo: 'com.saboarena.mobile://reset-password',
    );
  }
  
  static Future<void> signOut() async {
    await client.auth.signOut();
  }
}
