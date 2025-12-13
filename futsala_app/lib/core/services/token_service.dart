import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:futsala_app/data/models/user_model.dart';

class AuthStorage {
  static const String _tokenKey = "access_token";
  static const String _userKey = "user_data";

  /// Save access token
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  /// Save user data
  static Future<void> saveUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    String userJson = jsonEncode(user.toJson());
    await prefs.setString(_userKey, userJson);
  }

  /// Get token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  /// Get user
  static Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    String? userJson = prefs.getString(_userKey);

    if (userJson == null) return null;

    return UserModel.fromJson(jsonDecode(userJson));
  }

  /// Clear auth data (logout)
  static Future<void> clearAuth() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
