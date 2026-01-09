// Time Slot Model for availability
class TimeSlot {
  final String courtId;
  final String courtName;
  final String? courtType;
  final String startTime;
  final String endTime;
  final double price;
  final bool isAvailable;
  final String? bookingId; // If slot is booked
  final double? discount;

  TimeSlot({
    required this.courtId,
    required this.courtName,
    this.courtType,
    required this.startTime,
    required this.endTime,
    required this.price,
    required this.isAvailable,
    this.bookingId,
    this.discount,
  });

  factory TimeSlot.fromJson(Map<String, dynamic> json) {
    return TimeSlot(
      courtId: json['courtId']?.toString() ?? '',
      courtName: json['courtName']?.toString() ?? '',
      courtType: json['courtType']?.toString(),
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
      price: (json['price'] is int)
          ? (json['price'] as int).toDouble()
          : (json['price'] as double? ?? 0.0),
      isAvailable: json['isAvailable'] as bool? ?? false,
      bookingId: json['bookingId']?.toString(),
      discount: (json['discount'] is int)
          ? (json['discount'] as int).toDouble()
          : (json['discount'] as double?),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'courtId': courtId,
      'courtName': courtName,
      'courtType': courtType,
      'startTime': startTime,
      'endTime': endTime,
      'price': price,
      'isAvailable': isAvailable,
      if (bookingId != null) 'bookingId': bookingId,
      if (discount != null) 'discount': discount,
    };
  }

  // Helper to get final price after discount
  double get finalPrice {
    if (discount != null && discount! > 0) {
      return price - discount!;
    }
    return price;
  }

  // Helper to format time range
  String get timeRange => '$startTime - $endTime';
}