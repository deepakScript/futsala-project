import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Change this to your backend URL
  static const String baseUrl = 'http://127.0.0.1:5000/api/v1';
  
  static const Duration timeoutDuration = Duration(seconds: 30);

  // POST request helper
  static Future<Map<String, dynamic>> post({
    required String endpoint,
    required Map<String, dynamic> body,
    String? token,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .post(
            url,
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(timeoutDuration);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // GET request helper
  static Future<Map<String, dynamic>> get({
    required String endpoint,
    String? token,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .get(url, headers: headers)
          .timeout(timeoutDuration);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // PUT request helper
  static Future<Map<String, dynamic>> put({
    required String endpoint,
    required Map<String, dynamic> body,
    String? token,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .put(
            url,
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(timeoutDuration);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // PATCH request helper
  static Future<Map<String, dynamic>> patch({
    required String endpoint,
    required Map<String, dynamic> body,
    String? token,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .patch(
            url,
            headers: headers,
            body: jsonEncode(body),
          )
          .timeout(timeoutDuration);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // DELETE request helper
  static Future<Map<String, dynamic>> delete({
    required String endpoint,
    String? token,
    Map<String, dynamic>? body,
  }) async {
    try {
      final url = Uri.parse('$baseUrl$endpoint');
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .delete(
            url,
            headers: headers,
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(timeoutDuration);

      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Handle API response
  static Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final data = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Return data with success message if available
        return {
          ...data,
          'success': true,
          'statusCode': response.statusCode,
        };
      } else {
        // Extract error message from backend
        String errorMessage = data['message'] ?? 
                             data['error'] ?? 
                             data['msg'] ?? 
                             'Something went wrong';
        
        throw ApiException(
          message: errorMessage,
          statusCode: response.statusCode,
          errors: data['errors'], // For validation errors
        );
      }
    } catch (e) {
      if (e is ApiException) {
        rethrow;
      }
      throw ApiException(
        message: 'Failed to parse server response',
        statusCode: response.statusCode,
      );
    }
  }

  // Handle errors
  static String _handleError(dynamic error) {
    if (error is ApiException) {
      return error.message;
    } else if (error.toString().contains('TimeoutException')) {
      return 'Connection timeout. Please try again.';
    } else if (error.toString().contains('SocketException')) {
      return 'No internet connection. Please check your connection.';
    } else if (error.toString().contains('HandshakeException')) {
      return 'SSL connection failed. Please try again.';
    } else if (error.toString().contains('FormatException')) {
      return 'Invalid response from server.';
    } else {
      return 'An unexpected error occurred: ${error.toString()}';
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;
  final dynamic errors; // For validation errors from backend

  ApiException({
    required this.message, 
    required this.statusCode,
    this.errors,
  });

  @override
  String toString() => message;
  
  // Get formatted error message
  String get formattedMessage {
    if (errors != null && errors is Map) {
      // Handle validation errors like: {email: "Email is required", password: "Password too short"}
      final errorList = (errors as Map).values.join('\n');
      return '$message\n$errorList';
    } else if (errors != null && errors is List) {
      // Handle array of errors
      final errorList = (errors as List).join('\n');
      return '$message\n$errorList';
    }
    return message;
  }
}