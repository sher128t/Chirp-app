import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/api/api_exceptions.dart';
import '../models/auth_state.dart';
import '../models/user.dart';

// Auth state provider
final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<AuthState>>((ref) {
  return AuthNotifier(ref);
});

// Current user provider (derived from auth state)
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.valueOrNull?.user;
});

class AuthNotifier extends StateNotifier<AsyncValue<AuthState>> {
  final Ref _ref;

  AuthNotifier(this._ref) : super(const AsyncValue.loading()) {
    _checkAuthStatus();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> _checkAuthStatus() async {
    try {
      final hasToken = await _apiClient.hasValidToken();
      
      if (hasToken) {
        // Try to fetch user profile
        try {
          final userData = await _apiClient.get<Map<String, dynamic>>('/me');
          final user = User.fromJson(userData);
          state = AsyncValue.data(AuthState.authenticated(user));
        } catch (e) {
          // Token might be expired, clear and set unauthenticated
          await _apiClient.clearTokens();
          state = const AsyncValue.data(AuthState.unauthenticated());
        }
      } else {
        state = const AsyncValue.data(AuthState.unauthenticated());
      }
    } catch (e) {
      state = const AsyncValue.data(AuthState.unauthenticated());
    }
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      await _apiClient.saveTokens(
        response['accessToken'],
        response['refreshToken'],
      );

      // Fetch user profile
      final userData = await _apiClient.get<Map<String, dynamic>>('/me');
      final user = User.fromJson(userData);
      
      state = AsyncValue.data(AuthState.authenticated(user));
    } on ApiException catch (e) {
      state = AsyncValue.error(e.message, StackTrace.current);
      rethrow;
    } catch (e) {
      state = AsyncValue.error('Login failed', StackTrace.current);
      rethrow;
    }
  }

  Future<void> register(String email, String password, {String? petName}) async {
    state = const AsyncValue.loading();

    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'email': email,
          'password': password,
          if (petName != null) 'petName': petName,
        },
      );

      await _apiClient.saveTokens(
        response['accessToken'],
        response['refreshToken'],
      );

      // Fetch user profile
      final userData = await _apiClient.get<Map<String, dynamic>>('/me');
      final user = User.fromJson(userData);
      
      state = AsyncValue.data(AuthState.authenticated(user));
    } on ApiException catch (e) {
      state = AsyncValue.error(e.message, StackTrace.current);
      rethrow;
    } catch (e) {
      state = AsyncValue.error('Registration failed', StackTrace.current);
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _apiClient.getRefreshToken();
      await _apiClient.post('/auth/logout', data: {
        if (refreshToken != null) 'refreshToken': refreshToken,
      });
    } catch (e) {
      // Ignore errors on logout
    }

    await _apiClient.clearTokens();
    state = const AsyncValue.data(AuthState.unauthenticated());
  }

  Future<void> refreshUser() async {
    try {
      final userData = await _apiClient.get<Map<String, dynamic>>('/me');
      final user = User.fromJson(userData);
      state = AsyncValue.data(AuthState.authenticated(user));
    } catch (e) {
      // Ignore errors
    }
  }
}

