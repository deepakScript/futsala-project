import 'package:flutter/material.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:khalti_checkout_flutter/khalti_checkout_flutter.dart';

class PaymentProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  String? _successMessage;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get successMessage => _successMessage;

  /// Initiate Khalti Payment and Launch SDK
  Future<void> payWithKhalti(BuildContext context, String bookingId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final token = await AuthStorage.getToken();
      final response = await ApiService.post(
        endpoint: '/payments/initiate',
        token: token,
        body: {
          'bookingId': bookingId,
          // SDK might use its own return URL or we can provide one
          'return_url': 'https://khalti.com', 
        },
      );

      if (response['success'] == true) {
        final data = response['data'];
        final String pidx = data['pidx'];

        // Start Khalti Checkout SDK
        final payConfig = KhaltiPayConfig(
          publicKey: 'live_public_key_621922c019d646279f32375a026c04f9', // Demo/Test Key
          pidx: pidx,
          environment: Environment.prod,
        );

        // Initialize Khalti SDK
        final khalti = await Khalti.init(
          enableDebugging: true,
          payConfig: payConfig,
          onPaymentResult: (paymentResult, khalti) async {
            final pidx = paymentResult.payload?.pidx;
            if (pidx != null) {
              print('Payment Success: $pidx');
              final verified = await verifyPayment(pidx);
              if (verified && context.mounted) {
                _setSuccess('Payment successful and verified!');
                Navigator.pop(context);
              }
            }
          },
          onMessage: (khalti, {description, statusCode, event, needsPaymentConfirmation}) {
            print('Payment Message: $description, Status: $statusCode, Event: $event');
            _setError(description?.toString() ?? 'An error occurred during payment');
          },
          onReturn: () {
            print('Payment Returned');
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
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Verify Khalti Payment
  Future<bool> verifyPayment(String pidx) async {
    // ... (rest of the verification logic remains mostly same but we update state)
    try {
      final token = await AuthStorage.getToken();
      final response = await ApiService.post(
        endpoint: '/payments/verify',
        token: token,
        body: {'pidx': pidx},
      );

      if (response['success'] == true) {
        _successMessage = 'Payment verified successfully';
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Payment verification failed';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void _setError(String msg) {
    _error = msg;
    _isLoading = false;
    notifyListeners();
  }

  void _setSuccess(String msg) {
    _successMessage = msg;
    _error = null;
    notifyListeners();
  }

  void clearMessages() {
    _error = null;
    _successMessage = null;
    notifyListeners();
  }
}
