import 'package:flutter/foundation.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/data/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  String? _token;
  bool _isLoading = false;
  String? _error;
  String? _successMessage;
  String? get successMessage => _successMessage;

  // Getters
  UserModel? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null && _user != null;
  // bool get isAuthenticated => true;

  // Keys for SharedPreferences
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Initialize and check if user is already logged in
  Future<void> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_tokenKey);
      final userJson = prefs.getString(_userKey);

      if (_token != null && userJson != null) {
        _user = UserModel.fromJson(jsonDecode(userJson));

        // Optional: Verify token with backend
        // await getUserProfile();
      }
    } catch (e) {
      debugPrint('Error initializing auth: $e');
      _token = null;
      _user = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Register new user
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      final response = await ApiService.post(
        endpoint: '/auth/register',
        body: {
          'fullName': name,
          'email': email,
          'password': password,
          if (phone != null) 'phoneNumber': phone,
        },
      );

      // await _saveAuthData(response);
      _setSuccess(response['message'] ?? 'Registration successful!');
      _setLoading(false);

      return {'success': true, 'message': _successMessage};
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // Login user
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      final response = await ApiService.post(
        endpoint: '/auth/login',
        body: {'email': email, 'password': password},
      );

      await _saveAuthData(response);
      _setSuccess(response['message'] ?? 'Login successful!');
      _setLoading(false);

      // Return full response for UI
      return response;
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // Logout user
  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userKey);

      _user = null;
      _token = null;
      _clearMessages();
      _setSuccess('Logged out successfully');
      notifyListeners();
    } catch (e) {
      debugPrint('Error logging out: $e');
    }
  }

  // Get current user profile
  Future<void> getUserProfile() async {
    if (_token == null) return;

    try {
      final response = await ApiService.get(
        endpoint: '/auth/profile',
        token: _token,
      );

      _user = UserModel.fromJson(response['user']);
      await _saveUserData(_user!);
      notifyListeners();
    } catch (e) {
      debugPrint('Error getting profile: $e');
    }
  }

  // Update user profile (PUT request example)
  Future<Map<String, dynamic>> updateProfile({
    String? name,
    String? phone,
    String? avatar,
  }) async {
    if (_token == null){
      return {'success': false, 'message': 'Not authenticated'};
    }

    _setLoading(true);
    _clearMessages();

    try {
      final response = await ApiService.put(
        endpoint: '/auth/profile',
        token: _token,
        body: {
          if (name != null) 'name': name,
          if (phone != null) 'phone': phone,
          if (avatar != null) 'avatar': avatar,
        },
      );

      _user = UserModel.fromJson(response['user']);
      await _saveUserData(_user!);
      _setSuccess(response['message'] ?? 'Profile updated successfully!');
      _setLoading(false);
      notifyListeners();

      return {'success': true, 'message': _successMessage};
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // Change password (PATCH request example)
  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_token == null)
      return {'success': false, 'message': 'Not authenticated'};

    _setLoading(true);
    _clearMessages();

    try {
      final response = await ApiService.patch(
        endpoint: '/auth/change-password',
        token: _token,
        body: {'currentPassword': currentPassword, 'newPassword': newPassword},
      );

      _setSuccess(response['message'] ?? 'Password changed successfully!');
      _setLoading(false);

      return {'success': true, 'message': _successMessage};
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // Delete account (DELETE request example)
  Future<Map<String, dynamic>> deleteAccount() async {
    if (_token == null)
      return {'success': false, 'message': 'Not authenticated'};

    _setLoading(true);
    _clearMessages();

    try {
      final response = await ApiService.delete(
        endpoint: '/auth/account',
        token: _token,
      );

      // Clear local data after successful deletion
      await logout();
      _setSuccess(response['message'] ?? 'Account deleted successfully');
      _setLoading(false);

      return {'success': true, 'message': _successMessage};
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // Save authentication data to local storage
  Future<void> _saveAuthData(Map<String, dynamic> response) async {
    _token = response['auth']['accessToken'];
    _user = UserModel.fromJson(response['user']);

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, _token!);
    await prefs.setString(_userKey, jsonEncode(_user!.toJson()));

    notifyListeners();
  }

  // Save user data only
  Future<void> _saveUserData(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  // Helper methods
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _error = message;
    _successMessage = null;
    notifyListeners();
  }

  void _setSuccess(String message) {
    _successMessage = message;
    _error = null;
    notifyListeners();
  }

  void _clearMessages() {
    _error = null;
    _successMessage = null;
  }

  // Extract error message from exception
  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error
          .formattedMessage; // Use formatted message with validation errors
    }
    return error.toString();
  }
}
