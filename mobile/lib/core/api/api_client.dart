import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api_exceptions.dart';

// Storage keys
const String _accessTokenKey = 'access_token';
const String _refreshTokenKey = 'refresh_token';

// Secure storage provider
final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );
});

// Base URL provider
final apiBaseUrlProvider = Provider<String>((ref) {
  // For development, detect platform and use appropriate URL
  if (kDebugMode) {
    // Web runs in browser - use localhost
    if (kIsWeb) {
      return 'http://localhost:3000/api';
    }
    // For mobile, we need to check platform differently
    // Using defaultTargetPlatform which works on all platforms
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api'; // Android emulator
    } else if (defaultTargetPlatform == TargetPlatform.iOS) {
      return 'http://localhost:3000/api'; // iOS simulator
    }
    // Fallback for other platforms (Windows, macOS, Linux)
    return 'http://localhost:3000/api';
  }
  // Production URL (replace with your actual API URL)
  return 'https://api.finch-app.example.com/api';
});

// Dio instance provider
final dioProvider = Provider<Dio>((ref) {
  final baseUrl = ref.watch(apiBaseUrlProvider);
  
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  // Add interceptors
  dio.interceptors.add(AuthInterceptor(ref));
  dio.interceptors.add(LoggingInterceptor());

  return dio;
});

// API Client provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider), ref);
});

class ApiClient {
  final Dio _dio;
  final Ref _ref;

  ApiClient(this._dio, this._ref);

  // Token management
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    final storage = _ref.read(secureStorageProvider);
    await storage.write(key: _accessTokenKey, value: accessToken);
    await storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<void> clearTokens() async {
    final storage = _ref.read(secureStorageProvider);
    await storage.delete(key: _accessTokenKey);
    await storage.delete(key: _refreshTokenKey);
  }

  Future<String?> getAccessToken() async {
    final storage = _ref.read(secureStorageProvider);
    return storage.read(key: _accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    final storage = _ref.read(secureStorageProvider);
    return storage.read(key: _refreshTokenKey);
  }

  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  // HTTP methods
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<T> patch<T>(
    String path, {
    dynamic data,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<T> delete<T>(
    String path, {
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(path);
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  T _handleResponse<T>(Response response, T Function(dynamic)? fromJson) {
    if (fromJson != null) {
      return fromJson(response.data);
    }
    return response.data as T;
  }

  ApiException _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiException(
          message: 'Connection timeout. Please try again.',
          statusCode: 0,
        );
      case DioExceptionType.connectionError:
        return ApiException(
          message: 'No internet connection. Please check your network.',
          statusCode: 0,
        );
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode ?? 0;
        final data = e.response?.data;
        String message = 'An error occurred';
        
        if (data is Map) {
          message = data['message'] ?? data['error'] ?? message;
        }
        
        return ApiException(
          message: message,
          statusCode: statusCode,
          data: data,
        );
      default:
        return ApiException(
          message: 'An unexpected error occurred',
          statusCode: 0,
        );
    }
  }
}

// Auth interceptor for adding tokens and refreshing
class AuthInterceptor extends Interceptor {
  final Ref _ref;
  bool _isRefreshing = false;

  AuthInterceptor(this._ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    // Skip auth header for auth endpoints
    if (options.path.contains('/auth/login') ||
        options.path.contains('/auth/register') ||
        options.path.contains('/auth/refresh')) {
      return handler.next(options);
    }

    final storage = _ref.read(secureStorageProvider);
    final token = await storage.read(key: _accessTokenKey);
    
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      
      try {
        final storage = _ref.read(secureStorageProvider);
        final refreshToken = await storage.read(key: _refreshTokenKey);
        
        if (refreshToken != null) {
          final dio = Dio(BaseOptions(
            baseUrl: _ref.read(apiBaseUrlProvider),
          ));
          
          final response = await dio.post('/auth/refresh', data: {
            'refreshToken': refreshToken,
          });
          
          if (response.statusCode == 200) {
            final newAccessToken = response.data['accessToken'];
            final newRefreshToken = response.data['refreshToken'];
            
            await storage.write(key: _accessTokenKey, value: newAccessToken);
            await storage.write(key: _refreshTokenKey, value: newRefreshToken);
            
            // Retry original request
            final opts = err.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccessToken';
            
            final retryResponse = await dio.fetch(opts);
            _isRefreshing = false;
            return handler.resolve(retryResponse);
          }
        }
      } catch (e) {
        // Refresh failed, clear tokens
        await _ref.read(secureStorageProvider).deleteAll();
      }
      
      _isRefreshing = false;
    }
    
    handler.next(err);
  }
}

// Logging interceptor for debugging
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      print('🚀 REQUEST: ${options.method} ${options.path}');
      if (options.data != null) {
        print('📦 DATA: ${options.data}');
      }
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      print('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      print('❌ ERROR: ${err.response?.statusCode} ${err.requestOptions.path}');
      print('📝 MESSAGE: ${err.message}');
    }
    handler.next(err);
  }
}

