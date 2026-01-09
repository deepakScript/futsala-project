import 'package:flutter/foundation.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/venue_model.dart';


class FutsalProvider extends ChangeNotifier {
  List<Venue> _venues = [];
  List<Venue> _searchResults = [];
  Venue? _selectedVenue;
  bool _isLoading = false;
  String? _error;
  String? _successMessage;
  String? _token;

  // Getters
  List<Venue> get venues => _venues;
  List<Venue> get searchResults => _searchResults;
  Venue? get selectedVenue => _selectedVenue;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get successMessage => _successMessage;
  String? get token => _token;

  /// Load token once and cache it
  Future<void> _loadToken() async {
    _token ??= await AuthStorage.getToken();
  }

  // ================= GET ALL VENUES =================
  Future<Map<String, dynamic>> getAllVenues() async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final response = await ApiService.get(
        endpoint: '/futsal/venue',
        token: _token,
      );

      final venuesData = response['venues'] ?? response['data'] ?? [];

      _venues = (venuesData as List)
          .map((json) => Venue.fromJson(json))
          .toList();

      // Clear search results when loading all venues
      _searchResults = [];

      _setSuccess(response['message'] ?? 'Venues loaded successfully');
      _setLoading(false);

      print('Loaded ${_venues.length} venues');
      
      return response;
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // ================= SEARCH VENUES (API BASED) =================
  Future<Map<String, dynamic>> searchVenues({
    String? location,
    String? city,
    double? price,
    String? courtType,
    double? minRating,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      // Build query string dynamically
      final queryParams = <String, String>{};

      if (location != null && location.isNotEmpty) {
        queryParams['location'] = location;
      }

      if (city != null && city.isNotEmpty) {
        queryParams['city'] = city;
      }

      if (price != null) {
        queryParams['price'] = price.toString();
      }

      if (courtType != null && courtType.isNotEmpty) {
        queryParams['courtType'] = courtType;
      }

      if (minRating != null) {
        queryParams['minRating'] = minRating.toString();
      }

      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');

      final endpoint = queryString.isEmpty
          ? '/futsal/venue-search'
          : '/futsal/venue-search?$queryString';

      final response = await ApiService.get(endpoint: endpoint, token: _token);

      final venuesData = response['data'] ?? response['venues'] ?? [];

      _searchResults = (venuesData as List)
          .map((json) => Venue.fromJson(json))
          .toList();

      _setSuccess(response['message'] ?? 'Search completed successfully');
      _setLoading(false);

      print('Search found ${_searchResults.length} venues');
      
      return response;
    } catch (e) {
      final errorMsg = _getErrorMessage(e);
      _setError(errorMsg);
      _searchResults = [];
      _setLoading(false);

      return {'success': false, 'message': errorMsg};
    }
  }

  // ================= GET VENUE BY ID (API) =================
 Future<Venue> getVenueById(String id) async {
  _setLoading(true);
  _clearMessages();

  try {
    await _loadToken();

    final response = await ApiService.get(
      endpoint: '/futsal/venue/$id',
      token: _token,
    );

    final venueData = response['venue'] ?? response['data'];

    if (venueData == null) {
      throw Exception('Venue not found');
    }

    final venue = Venue.fromJson(venueData);
    _selectedVenue = venue;

    _setSuccess(response['message'] ?? 'Venue loaded successfully');
    _setLoading(false);

    print('Loaded venue: ${venue.name}');

    return venue; // ✅ RETURN MODEL
  } catch (e) {
    final errorMsg = _getErrorMessage(e);
    _setError(errorMsg);
    _setLoading(false);

    throw Exception(errorMsg); // ✅ let UI handle error
  }
}

  // ================= GET VENUE BY ID (LOCAL) =================
  Venue? getVenueByIdLocal(String id) {
    try {
      return _venues.firstWhere((venue) => venue.id == id);
    } catch (_) {
      return null;
    }
  }

  // ================= CLEAR SEARCH RESULTS =================
  void clearSearch() {
    _searchResults = [];
    _clearMessages();
    notifyListeners();
  }

  // ================= CLEAR SELECTED VENUE =================
  void clearSelectedVenue() {
    _selectedVenue = null;
    notifyListeners();
  }

  // ================= REFRESH =================
  Future<Map<String, dynamic>> refreshVenues() async {
    return await getAllVenues();
  }

  // ================= CREATE VENUE (POST) =================
  // Future<Map<String, dynamic>> createVenue({
  //   required String name,
  //   required String address,
  //   required double rating,
  //   required List<String> amenities,
  //   required List<String> images,
  // }) async {
  //   _setLoading(true);
  //   _clearMessages();

  //   try {
  //     await _loadToken();

  //     final response = await ApiService.post(
  //       endpoint: '/venues',
  //       token: _token,
  //       body: {
  //         'name': name,
  //         'address': address,
  //         'rating': rating,
  //         'amenities': amenities,
  //         'images': images,
  //       },
  //     );

  //     _setSuccess(response['message'] ?? 'Venue created successfully!');

  //     // Refresh venues list
  //     await getAllVenues();

  //     _setLoading(false);
      
  //     return response;
  //   } catch (e) {
  //     final errorMsg = _getErrorMessage(e);
  //     _setError(errorMsg);
  //     _setLoading(false);

  //     return {'success': false, 'message': errorMsg};
  //   }
  // }

  // ================= UPDATE VENUE (PUT) =================
  // Future<Map<String, dynamic>> updateVenue({
  //   required String id,
  //   String? name,
  //   String? address,
  //   double? rating,
  //   List<String>? amenities,
  //   List<String>? images,
  // }) async {
  //   _setLoading(true);
  //   _clearMessages();

  //   try {
  //     await _loadToken();

  //     final response = await ApiService.put(
  //       endpoint: '/venues/$id',
  //       token: _token,
  //       body: {
  //         if (name != null) 'name': name,
  //         if (address != null) 'address': address,
  //         if (rating != null) 'rating': rating,
  //         if (amenities != null) 'amenities': amenities,
  //         if (images != null) 'images': images,
  //       },
  //     );

  //     _setSuccess(response['message'] ?? 'Venue updated successfully!');

  //     // Refresh venues list
  //     await getAllVenues();

  //     _setLoading(false);
      
  //     return response;
  //   } catch (e) {
  //     final errorMsg = _getErrorMessage(e);
  //     _setError(errorMsg);
  //     _setLoading(false);

  //     return {'success': false, 'message': errorMsg};
  //   }
  // }

  // ================= DELETE VENUE (DELETE) =================
  // Future<Map<String, dynamic>> deleteVenue({required String id}) async {
  //   _setLoading(true);
  //   _clearMessages();

  //   try {
  //     await _loadToken();

  //     final response = await ApiService.delete(
  //       endpoint: '/venues/$id',
  //       token: _token,
  //     );

  //     _setSuccess(response['message'] ?? 'Venue deleted successfully!');

  //     // Remove from local list
  //     _venues.removeWhere((venue) => venue.id == id);
  //     _searchResults.removeWhere((venue) => venue.id == id);

  //     _setLoading(false);
  //     notifyListeners();

  //     return response;
  //   } catch (e) {
  //     final errorMsg = _getErrorMessage(e);
  //     _setError(errorMsg);
  //     _setLoading(false);

  //     return {'success': false, 'message': errorMsg};
  //   }
  // }

  // ================= HELPERS =================
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