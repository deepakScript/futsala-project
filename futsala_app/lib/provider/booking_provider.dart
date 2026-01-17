import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/booking_model.dart';
import 'package:futsala_app/data/models/timeslot_model.dart';
import 'package:futsala_app/data/models/payment_model.dart';
import 'package:khalti_checkout_flutter/khalti_checkout_flutter.dart';
import 'package:flutter/material.dart';

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
  List<Booking> get upcomingBookings {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    return _myBookings
        .where((b) => b.status == 'confirmed' || b.status == 'pending')
        .where((b) {
          final bookingDay = DateTime(
            b.bookingDate.year,
            b.bookingDate.month,
            b.bookingDate.day,
          );
          // Include today and future dates
          return bookingDay.isAtSameMomentAs(today) || bookingDay.isAfter(today);
        })
        .toList();
  }

  List<Booking> get pastBookings {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    return _myBookings
        .where((b) => b.status != 'cancelled') // Exclude cancelled
        .where((b) {
          final bookingDay = DateTime(
            b.bookingDate.year,
            b.bookingDate.month,
            b.bookingDate.day,
          );
          // Only past dates (before today)
          return bookingDay.isBefore(today);
        })
        .toList();
  }

  List<Booking> get cancelledBookings =>
      _myBookings.where((b) => b.status == 'cancelled').toList();

  /// ======================
  /// TOKEN
  /// ======================
  Future<void> _loadToken() async {
    _token ??= await AuthStorage.getToken();
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
  /// CANCEL BOOKING WITH REFUND
  /// PUT /cancel/:id
  /// ======================
  Future<Map<String, dynamic>> cancelBooking(String id) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();

      await ApiService.put(
        endpoint: '/bookings/cancel/$id',
        token: _token,
        body: {},
      );

      // Calculate refund (95% of total price - 5% cancellation fee)
      final booking = _myBookings.firstWhere((b) => b.id == id);
      final refundAmount = booking.totalPrice * 0.95;
      final cancellationFee = booking.totalPrice * 0.05;

      // Update local booking status
      final index = _myBookings.indexWhere((b) => b.id == id);
      if (index != -1) {
        _myBookings[index] = _myBookings[index].copyWith(
          status: 'cancelled',
          updatedAt: DateTime.now(),
          refundAmount: refundAmount,
          refundStatus: 'pending',
        );
      }

      if (_selectedBooking?.id == id) {
        _selectedBooking = _selectedBooking!.copyWith(
          status: 'cancelled',
          refundAmount: refundAmount,
          refundStatus: 'pending',
        );
      }

      _setSuccess('Booking cancelled successfully. Refund of Rs. ${refundAmount.toInt()} will be processed.');
      notifyListeners();
      
      return {
        'success': true,
        'refundAmount': refundAmount,
        'cancellationFee': cancellationFee,
      };
    } catch (e) {
      _setError(e.toString());
      return {
        'success': false,
        'error': e.toString(),
      };
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
  /// PAYMENT (Khalti)
  /// ======================
  Future<void> payWithKhalti(BuildContext context, String bookingId, {VoidCallback? onSuccess}) async {
    _setLoading(true);
    _clearMessages();

    try {
      await _loadToken();
      final response = await ApiService.post(
        endpoint: '/payments/initiate',
        token: _token,
        body: {
          'bookingId': bookingId,
        },
      );

      if (response['success'] == true) {
        final payment = PaymentModel.fromJson(response['data']);
        
        if (payment.pidx == null) {
          _setError('Failed to get payment identifier (pidx)');
          return;
        }

        // Start Khalti Checkout SDK
        final payConfig = KhaltiPayConfig(
          publicKey: '13ccdf07dae9496e8e54e79d59f15b38',
          pidx: payment.pidx!,
          environment: Environment.test,
        );

        // Initialize Khalti SDK
        final khalti = await Khalti.init(
          enableDebugging: true,
          payConfig: payConfig,
          onPaymentResult: (paymentResult, khalti) async {
            final pidx = paymentResult.payload?.pidx;
            if (pidx != null) {
              final verified = await verifyPayment(pidx);
              if (verified && context.mounted) {
                _setSuccess('Payment successful and verified!');
                if (onSuccess != null) {
                  onSuccess();
                } else {
                  Navigator.pop(context); // Default behavior
                }
              }
            }
          },
          onMessage: (khalti, {description, statusCode, event, needsPaymentConfirmation}) {
            _setError(description?.toString() ?? 'An error occurred during payment');
          },
          onReturn: () {
          },
        );

        if (context.mounted) {
          khalti.open(context);
        }
      } else {
        _setError(response['message'] ?? 'Failed to initiate payment');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      // Don't disable loading here if we are waiting for payment result?
      // Actually Khalti SDK opens a modal, so we can stop our local loading.
      _setLoading(false);
    }
  }

  Future<bool> verifyPayment(String pidx) async {
    try {
      await _loadToken();
      final response = await ApiService.post(
        endpoint: '/payments/verify',
        token: _token,
        body: {'pidx': pidx},
      );

      if (response['success'] == true) {
        _setSuccess('Payment verified successfully');
        
        // Refresh booking if it was this one
        // We can't easily know which booking it was unless we store it or refresh all
        // Ideally we assume the caller will refresh bookings (onSuccess callback)
        return true;
      } else {
        _setError(response['message'] ?? 'Payment verification failed');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
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