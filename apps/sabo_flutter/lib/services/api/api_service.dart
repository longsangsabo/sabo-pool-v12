/**
 * Base API Service for Flutter
 * Provides HTTP client and common utilities for API communication
 */

import 'dart:convert';
import 'package:http/http.dart' as http;

class APIResponse<T> {
  final bool success;
  final T? data;
  final String message;
  final String? error;
  final List<String>? errors;

  APIResponse({
    required this.success,
    this.data,
    required this.message,
    this.error,
    this.errors,
  });

  factory APIResponse.fromJson(Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    return APIResponse<T>(
      success: json['success'] ?? false,
      data: json['data'] != null && fromJsonT != null ? fromJsonT(json['data']) : json['data'],
      message: json['message'] ?? '',
      error: json['error'],
      errors: json['errors']?.cast<String>(),
    );
  }
}

class APIService {
  static const String baseUrl = 'http://localhost:8080'; // Web app URL
  static const Duration timeout = Duration(seconds: 30);

  final http.Client _client = http.Client();
  String? _authToken;

  // Set authentication token
  void setAuthToken(String? token) {
    _authToken = token;
  }

  // Get request headers
  Map<String, String> _getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }

    return headers;
  }

  // GET request
  Future<APIResponse<T>> get<T>(
    String endpoint, {
    Map<String, String>? queryParams,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final uriWithQuery = queryParams != null 
          ? uri.replace(queryParameters: queryParams) 
          : uri;

      final response = await _client
          .get(uriWithQuery, headers: _getHeaders())
          .timeout(timeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return APIResponse<T>(
        success: false,
        message: 'Network error: ${e.toString()}',
        error: e.toString(),
      );
    }
  }

  // POST request
  Future<APIResponse<T>> post<T>(
    String endpoint, {
    dynamic body,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await _client
          .post(
            uri,
            headers: _getHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return APIResponse<T>(
        success: false,
        message: 'Network error: ${e.toString()}',
        error: e.toString(),
      );
    }
  }

  // PUT request
  Future<APIResponse<T>> put<T>(
    String endpoint, {
    dynamic body,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await _client
          .put(
            uri,
            headers: _getHeaders(),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return APIResponse<T>(
        success: false,
        message: 'Network error: ${e.toString()}',
        error: e.toString(),
      );
    }
  }

  // DELETE request
  Future<APIResponse<T>> delete<T>(
    String endpoint, {
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$endpoint');
      final response = await _client
          .delete(uri, headers: _getHeaders())
          .timeout(timeout);

      return _handleResponse<T>(response, fromJson);
    } catch (e) {
      return APIResponse<T>(
        success: false,
        message: 'Network error: ${e.toString()}',
        error: e.toString(),
      );
    }
  }

  // Handle HTTP response
  APIResponse<T> _handleResponse<T>(
    http.Response response,
    T Function(dynamic)? fromJson,
  ) {
    try {
      final jsonData = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return APIResponse<T>.fromJson(jsonData, fromJson);
      } else {
        return APIResponse<T>(
          success: false,
          message: jsonData['message'] ?? 'Request failed',
          error: jsonData['error'],
          errors: jsonData['errors']?.cast<String>(),
        );
      }
    } catch (e) {
      return APIResponse<T>(
        success: false,
        message: 'Failed to parse response',
        error: e.toString(),
      );
    }
  }

  // Dispose client
  void dispose() {
    _client.close();
  }
}

// Singleton instance
final APIService apiService = APIService();
