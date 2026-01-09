import 'package:flutter/foundation.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/booking_model.dart';
import 'package:futsala_app/data/models/timeslot_model.dart';
// Import your models
// import 'package:futsala_app/models/booking.dart';
// import 'package:futsala_app/models/time_slot.dart';

class BookingProvider extends ChangeNotifier {
  /// ======================
  /// STATE
  /// ======================
  bool _isLoading = false;
  String? _error;
  String? _successMessage;
  String? _token;

  List<TimeSlot> _availability = [];
  List<Booking> _myBookings = [];
  Booking? _selectedBooking;

  /// ======================
  /// GETTERS
  /// ======================
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get successMessage => _successMessage;

  List<TimeSlot> get availability => _availability;
  List<Booking> get myBookings => _myBookings;
  Booking? get selectedBooking => _selectedBooking;

  // Filtered bookings by status
  List<Booking> get upcomingBookings => _myBookings
      .where((b) => b.status == 'confirmed' || b.status == 'pending')
      .where((b) => b.bookingDate.isAfter(DateTime.now()))
      .toList();

  List<Booking> get pastBookings => _myBookings
      .where((b) => b.status == 'completed' || 
                    b.bookingDate.isBefore(DateTime.now()))
      .toList();

  List<Booking> get cancelledBookings =>
      _myBookings.where((b) => b.status == 'cancelled').toList();

  /// ======================
  /// TOKEN
  /// ======================
  Future<void> _loadToken() async {
    _token ??= await AuthStorage.getToken();
    print('BookingProvider: Loaded token: ${_token != null ? "Found" : "Not Found"}');
  }

  /// ======================
  /// AVAILABILITY
  /// GET /availability/:futsalId?date=
  /// ======================
  Future<void> checkAvailability({
    required String futsalId,
    required DateTime date,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final formattedDate = date.toIso8601String().split('T')[0];

      final res = await ApiService.get(
        endpoint: '/bookings/availability?futsalId=$futsalId&date=$formattedDate',
        token: _token,
      );

      // Parse time slots from response
      final data = res['data'] as List<dynamic>?;
      if (data != null) {
        _availability = data
            .map((slot) => TimeSlot.fromJson(slot as Map<String, dynamic>))
            .toList();
      } else {
        _availability = [];
      }

      _setSuccess('Availability loaded');
    } catch (e) {
      _setError(e.toString());
      _availability = [];
    }

    _setLoading(false);
  }


  /// ======================
  /// CREATE BOOKING
  /// POST /create
  /// ======================
  Future<bool> createBooking({
    required String courtId,
    required DateTime bookingDate,
    required String startTime,
    required String endTime,
    String? notes,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final res = await ApiService.post(
        endpoint: '/bookings/create',
        token: _token,
        body: {
          'courtId': courtId,
          'bookingDate': bookingDate.toIso8601String(),
          'startTime': startTime,
          'endTime': endTime,
          if (notes != null) 'notes': notes,
        },
      );

      // Parse the created booking
      if (res['data'] != null) {
        final newBooking = Booking.fromJson(res['data']);
        _myBookings.insert(0, newBooking);
      }

      _setSuccess('Booking created successfully');
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Create multiple bookings (for multiple time slots)
  Future<String?> createMultipleBookings({
    required DateTime bookingDate,
    required List<TimeSlot> selectedSlots,
    String? notes,
  }) async {
    _setLoading(true);
    _clearMessages();

    String? firstBookingId;

    try {
      await _loadToken();

      for (var slot in selectedSlots) {
        final res = await ApiService.post(
          endpoint: '/bookings/create',
          token: _token,
          body: {
            'courtId': slot.courtId,
            'bookingDate': bookingDate.toIso8601String(),
            'startTime': slot.startTime,
            'endTime': slot.endTime,
            if (notes != null) 'notes': notes,
          },
        );
        if (firstBookingId == null && res['data'] != null) {
          firstBookingId = res['data']['id'];
        }
      }

      await loadMyBookings(); // Refresh bookings list
      _setSuccess('${selectedSlots.length} booking(s) created successfully');
      return firstBookingId;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// ======================
  /// MY BOOKINGS
  /// GET /my
  /// ======================
  Future<void> loadMyBookings() async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final res = await ApiService.get(
        endpoint: '/bookings/my-bookings',
        token: _token,
      );

      // Parse bookings from response
      final data = res['data'] as List<dynamic>?;
      if (data != null) {
        _myBookings = data
            .map((booking) => Booking.fromJson(booking as Map<String, dynamic>))
            .toList();
        
        // Sort by booking date (newest first)
        _myBookings.sort((a, b) => b.bookingDate.compareTo(a.bookingDate));
      } else {
        _myBookings = [];
      }
    } catch (e) {
      _setError(e.toString());
      _myBookings = [];
    }

    _setLoading(false);
  }

  /// ======================
  /// GET BOOKING BY ID
  /// GET /:id
  /// ======================
  Future<void> getBookingById(String id) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final res = await ApiService.get(
        endpoint: '/bookings/booking/$id',
        token: _token,
      );

      if (res['data'] != null) {
        _selectedBooking = Booking.fromJson(res['data']);
      } else {
        _selectedBooking = null;
      }
    } catch (e) {
      _setError(e.toString());
      _selectedBooking = null;
    }

    _setLoading(false);
  }

  /// ======================
  /// CANCEL BOOKING
  /// PUT /cancel/:id
  /// ======================
  Future<bool> cancelBooking(String id) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      await ApiService.put(
        endpoint: '/bookings/cancel/$id',
        token: _token,
        body: {},
      );

      // Update local booking status
      final index = _myBookings.indexWhere((b) => b.id == id);
      if (index != -1) {
        _myBookings[index] = _myBookings[index].copyWith(
          status: 'cancelled',
          updatedAt: DateTime.now(),
        );
      }

      if (_selectedBooking?.id == id) {
        _selectedBooking = _selectedBooking!.copyWith(status: 'cancelled');
      }

      _setSuccess('Booking cancelled successfully');
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// ======================
  /// RESCHEDULE BOOKING
  /// PUT /reschedule/:id
  /// ======================
  Future<bool> rescheduleBooking({
    required String bookingId,
    DateTime? bookingDate,
    String? startTime,
    String? endTime,
  }) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      final res = await ApiService.put(
        endpoint: '/bookings/reschedule/$bookingId',
        token: _token,
        body: {
          if (bookingDate != null)
            'bookingDate': bookingDate.toIso8601String(),
          if (startTime != null) 'startTime': startTime,
          if (endTime != null) 'endTime': endTime,
        },
      );

      // Update local booking
      final index = _myBookings.indexWhere((b) => b.id == bookingId);
      if (index != -1 && res['data'] != null) {
        _myBookings[index] = Booking.fromJson(res['data']);
      }

      if (_selectedBooking?.id == bookingId && res['data'] != null) {
        _selectedBooking = Booking.fromJson(res['data']);
      }

      _setSuccess('Booking rescheduled successfully');
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// ======================
  /// HELPERS
  /// ======================
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

  /// Clear selected booking
  void clearSelectedBooking() {
    _selectedBooking = null;
    notifyListeners();
  }

  /// Calculate total price for selected slots
  double calculateTotalPrice(List<TimeSlot> slots) {
    return slots.fold(0.0, (sum, slot) => sum + slot.finalPrice);
  }

  /// Get booking statistics
  Map<String, int> getBookingStats() {
    return {
      'total': _myBookings.length,
      'upcoming': upcomingBookings.length,
      'completed': pastBookings.length,
      'cancelled': cancelledBookings.length,
    };
  }

  /// Dispose
  @override
  void dispose() {
    super.dispose();
  }
}