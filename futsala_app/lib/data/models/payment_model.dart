import 'booking_model.dart';

class PaymentModel {
  final String id;
  final String bookingId;
  final double amount;
  final String status;
  final String paymentMethod;
  final String? transactionId;
  final String? pidx;
  final String? paymentUrl;
  final String? purchaseOrderId;
  final DateTime? paidAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Booking? booking;

  PaymentModel({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.status,
    required this.paymentMethod,
    this.transactionId,
    this.pidx,
    this.paymentUrl,
    this.purchaseOrderId,
    this.paidAt,
    this.createdAt,
    this.updatedAt,
    this.booking,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id']?.toString() ?? json['paymentId']?.toString() ?? '',
      bookingId: json['bookingId']?.toString() ?? '',
      amount: (json['amount'] is int)
          ? (json['amount'] as int).toDouble()
          : (json['amount'] as double? ?? 0.0),
      status: json['status']?.toString() ?? 'PENDING',
      paymentMethod: json['paymentMethod']?.toString() ?? 'KHALTI',
      transactionId: json['transactionId']?.toString(),
      pidx: json['pidx']?.toString(),
      paymentUrl: json['payment_url']?.toString(),
      purchaseOrderId: json['purchase_order_id']?.toString(),
      paidAt: json['paidAt'] != null ? DateTime.parse(json['paidAt'].toString()) : null,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'].toString()) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt'].toString()) : null,
      booking: json['booking'] != null ? Booking.fromJson(json['booking']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bookingId': bookingId,
      'amount': amount,
      'status': status,
      'paymentMethod': paymentMethod,
      if (transactionId != null) 'transactionId': transactionId,
      if (pidx != null) 'pidx': pidx,
      if (paymentUrl != null) 'payment_url': paymentUrl,
      if (purchaseOrderId != null) 'purchase_order_id': purchaseOrderId,
      if (paidAt != null) 'paidAt': paidAt!.toIso8601String(),
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      if (booking != null) 'booking': booking!.toJson(),
    };
  }

  bool get isPaid => status == 'PAID' || status == 'Completed';
  bool get isPending => status == 'PENDING' || status == 'Pending';
  bool get isFailed => status == 'FAILED' || status == 'Failed';

  String get formattedAmount => 'NPR ${amount.toStringAsFixed(2)}';
}
