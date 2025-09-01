import 'package:freezed_annotation/freezed_annotation.dart';
import 'user_model.dart';

part 'auth_state.freezed.dart';

@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthStateInitial;
  const factory AuthState.loading() = AuthStateLoading;
  const factory AuthState.authenticated({
    required User user,
    required String token,
  }) = AuthStateAuthenticated;
  const factory AuthState.unauthenticated() = AuthStateUnauthenticated;
  const factory AuthState.otpVerified() = AuthStateOtpVerified;
  const factory AuthState.passwordResetSent() = AuthStatePasswordResetSent;
  const factory AuthState.error({
    required String message,
  }) = AuthStateError;
}

extension AuthStateX on AuthState {
  bool get isAuthenticated => this is AuthStateAuthenticated;
  bool get isLoading => this is AuthStateLoading;
  bool get isUnauthenticated => this is AuthStateUnauthenticated;
  bool get hasError => this is AuthStateError;
  
  User? get user => maybeWhen(
    authenticated: (user, token) => user,
    orElse: () => null,
  );
  
  String? get token => maybeWhen(
    authenticated: (user, token) => token,
    orElse: () => null,
  );
  
  String? get errorMessage => maybeWhen(
    error: (message) => message,
    orElse: () => null,
  );
}
