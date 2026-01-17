import 'dart:convert';
import 'package:http/http.dart' as http;


class ApiService {
  // For local development, use your machine's IP address or 10.0.2.2 for Android emulators
  // static const String localUrlWeb = 'http://localhost:5000/api/v1';
  // static const String localUrlMobile = 'http://10.0.2.2:5000/api/v1';

  static const String prodUrl =
      'https://futsala-backend-testing.onrender.com/api/v1';

  // Set this to true to use the local server
  // static bool useLocal = false;

  static String get baseUrl {
    return prodUrl;
    // if (!useLocal) return prodUrl;
    // // Use 10.0.2.2 for Android, localhost for Web/Desktop
    // return (defaultTargetPlatform == TargetPlatform.android && !kIsWeb)
    //     ? localUrlMobile
    //     : localUrlWeb;
  }

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
          .post(url, headers: headers, body: jsonEncode(body))
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
          .put(url, headers: headers, body: jsonEncode(body))
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
          .patch(url, headers: headers, body: jsonEncode(body))
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
      if (response.body.isEmpty) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return {'success': true, 'statusCode': response.statusCode};
        } else {
          throw ApiException(
            message:
                'Server returned empty response with status ${response.statusCode}',
            statusCode: response.statusCode,
          );
        }
      }

      final dynamic decoded = jsonDecode(response.body);

      // Handle cases where backend might return a List instead of an Object at root
      Map<String, dynamic> data;
      if (decoded is Map) {
        data = Map<String, dynamic>.from(decoded);
      } else {
        data = {'data': decoded};
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {...data, 'success': true, 'statusCode': response.statusCode};
      } else {
        String errorMessage =
            data['message'] ??
            data['error'] ??
            data['msg'] ??
            'Something went wrong (Status ${response.statusCode})';

        throw ApiException(
          message: errorMessage,
          statusCode: response.statusCode,
          errors: data['errors'],
        );
      }
    } catch (e) {
      if (e is ApiException) rethrow;

      final bodySnippet = response.body.length > 200
          ? '${response.body.substring(0, 200)}...'
          : response.body;

      throw ApiException(
        message:
            'Failed to parse server response: ${e.toString()}\nStatus: ${response.statusCode}\nBody: $bodySnippet',
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

  ApiException({required this.message, required this.statusCode, this.errors});

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
