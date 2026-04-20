import 'user.dart';

class AuthState {
  final bool isAuthenticated;
  final User? user;

  const AuthState._({
    required this.isAuthenticated,
    this.user,
  });

  const AuthState.unauthenticated()
      : isAuthenticated = false,
        user = null;

  const AuthState.authenticated(User this.user) : isAuthenticated = true;

  @override
  String toString() => 'AuthState(isAuthenticated: $isAuthenticated, user: ${user?.email})';
}

