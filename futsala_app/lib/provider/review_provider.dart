import 'package:flutter/foundation.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';

class ReviewProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  String? _successMessage;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get successMessage => _successMessage;

  /// Submit a rating for a specific venue
  Future<Map<String, dynamic>> submitRating(String venueId, double rating) async {
    _setLoading(true);
    _clearMessages();

    try {
      final token = await AuthStorage.getToken();
      
      final response = await ApiService.post(
        endpoint: '/reviews/create/$venueId', 
        token: token,
        body: {
          'rating': rating,
          'comment': '', // Explicitly send empty comment just in case
        },
      );

      _setSuccess(response['message'] ?? 'Rating submitted successfully');
      _setLoading(false);
      return response;

    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);
      return {'success': false, 'message': errorMsg};
    }
  }

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

  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.formattedMessage;
    }
    return error.toString();
  }
}
