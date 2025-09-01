import '../models/user_model_simple.dart';

abstract class AuthState {
  const AuthState();
}

class AuthStateInitial extends AuthState {
  const AuthStateInitial();
}

class AuthStateLoading extends AuthState {
  const AuthStateLoading();
}

class AuthStateAuthenticated extends AuthState {
  final User user;
  final String token;

  const AuthStateAuthenticated({
    required this.user,
    required this.token,
  });
}

class AuthStateUnauthenticated extends AuthState {
  const AuthStateUnauthenticated();
}

class AuthStateOtpVerified extends AuthState {
  const AuthStateOtpVerified();
}

class AuthStatePasswordResetSent extends AuthState {
  const AuthStatePasswordResetSent();
}

class AuthStateError extends AuthState {
  final String message;

  const AuthStateError({required this.message});
}

extension AuthStateX on AuthState {
  bool get isAuthenticated => this is AuthStateAuthenticated;
  bool get isLoading => this is AuthStateLoading;
  bool get isUnauthenticated => this is AuthStateUnauthenticated;
  bool get hasError => this is AuthStateError;
  
  User? get user {
    if (this is AuthStateAuthenticated) {
      return (this as AuthStateAuthenticated).user;
    }
    return null;
  }
  
  String? get token {
    if (this is AuthStateAuthenticated) {
      return (this as AuthStateAuthenticated).token;
    }
    return null;
  }
  
  String? get errorMessage {
    if (this is AuthStateError) {
      return (this as AuthStateError).message;
    }
    return null;
  }

  T when<T>({
    required T Function() initial,
    required T Function() loading,
    required T Function(User user, String token) authenticated,
    required T Function() unauthenticated,
    required T Function() otpVerified,
    required T Function() passwordResetSent,
    required T Function(String message) error,
  }) {
    if (this is AuthStateInitial) {
      return initial();
    } else if (this is AuthStateLoading) {
      return loading();
    } else if (this is AuthStateAuthenticated) {
      final state = this as AuthStateAuthenticated;
      return authenticated(state.user, state.token);
    } else if (this is AuthStateUnauthenticated) {
      return unauthenticated();
    } else if (this is AuthStateOtpVerified) {
      return otpVerified();
    } else if (this is AuthStatePasswordResetSent) {
      return passwordResetSent();
    } else if (this is AuthStateError) {
      final state = this as AuthStateError;
      return error(state.message);
    }
    throw StateError('Unknown AuthState: $this');
  }
}
