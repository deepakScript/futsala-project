import 'package:flutter/material.dart';
import 'package:futsala_app/core/services/api_service.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/payment_model.dart';
import 'package:flutter/foundation.dart';
import 'package:khalti_checkout_flutter/khalti_checkout_flutter.dart';

class PaymentProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  String? _successMessage;
  PaymentModel? _currentPayment;

  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get successMessage => _successMessage;
  PaymentModel? get currentPayment => _currentPayment;
  List<PaymentModel> get payments => _payments;
  Map<String, dynamic>? get paymentStats => _paymentStats;

  List<PaymentModel> _payments = [];
  Map<String, dynamic>? _paymentStats;

  /// Initiate Khalti Payment and Launch SDK
  Future<void> payWithKhalti(
    BuildContext context, 
    String bookingId, {
    VoidCallback? onSuccess,
    Function(String)? onFailure,
  }) async {
    _isLoading = true;
    _error = null;
    _currentPayment = null;
    notifyListeners();

    try {
      final token = await AuthStorage.getToken();
      final response = await ApiService.post(
        endpoint: '/payments/initiate',
        token: token,
        body: {
          'bookingId': bookingId,
          // Use Uri.base for web, but a valid URL for mobile to ensure API acceptance
          'return_url': kIsWeb ? Uri.base.toString() : 'https://khalti.com/payment_callback',
        },
      );

      if (response['success'] == true) {
        _currentPayment = PaymentModel.fromJson(response['data']);
        
        if (_currentPayment?.pidx == null) {
          final msg = 'Failed to get payment identifier (pidx)';
          _setError(msg);
          if (onFailure != null) onFailure(msg);
          return;
        }

        // Start Khalti Checkout SDK
        final payConfig = KhaltiPayConfig(
          publicKey: '13ccdf07dae9496e8e54e79d59f15b38', 
          pidx: _currentPayment!.pidx!,
          environment: Environment.test,
        );

        // Initialize Khalti SDK
        final khalti = await Khalti.init(
          enableDebugging: true,
          payConfig: payConfig,
          onPaymentResult: (paymentResult, khaltiInstance) async {
            final pidx = paymentResult.payload?.pidx;
            
            if (pidx != null) {
              
              // Close Khalti modal first
              if (context.mounted) {
                khaltiInstance.close(context);
              }
              
              // Verify payment with backend
              final verified = await verifyPayment(pidx);
              
              if (verified) {
                _setSuccess('Payment successful and verified!');
                
                if (context.mounted && onSuccess != null) {
                  onSuccess();
                }
              } else {
                final msg = 'Payment verification failed. Please contact support.';
                _setError(msg);
                if (context.mounted && onFailure != null) {
                  onFailure(msg);
                }
              }
            } else {
              if (context.mounted) {
                khaltiInstance.close(context);
              }
              final msg = 'Payment was not completed successfully';
              _setError(msg);
              if (context.mounted && onFailure != null) {
                onFailure(msg);
              }
            }
          },
          onMessage: (khaltiInstance, {description, statusCode, event, needsPaymentConfirmation}) {
            if (statusCode != null && statusCode >= 400) {
              final msg = description?.toString() ?? 'An error occurred during payment';
              _setError(msg);
              // onFailure might be triggered here if we want to close and fail
            }
          },
          onReturn: () {
            // detailed log
          },
        );

        if (context.mounted) {
          khalti.open(context);
        }
      } else {
        final msg = response['message'] ?? 'Failed to initiate payment';
        _setError(msg);
        if (onFailure != null) onFailure(msg);
      }
    } catch (e) {
      _setError(e.toString());
      if (onFailure != null) onFailure(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Verify Khalti Payment
  Future<bool> verifyPayment(String pidx) async {
    try {
      final token = await AuthStorage.getToken();
      
      final response = await ApiService.post(
        endpoint: '/payments/verify',
        token: token,
        body: {'pidx': pidx},
      );


      if (response['success'] == true) {
        _currentPayment = PaymentModel.fromJson(response['data']);
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

  /// Get Payment History
  Future<void> getPaymentHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final token = await AuthStorage.getToken();
      final response = await ApiService.get(
        endpoint: '/payments/history',
        token: token,
      );

      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        _payments = data.map((json) => PaymentModel.fromJson(json)).toList();
        _paymentStats = response['statistics'];
      } else {
        _setError(response['message'] ?? 'Failed to fetch payment history');
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _isLoading = false;
      notifyListeners();
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
