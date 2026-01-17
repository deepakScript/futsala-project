class Booking {
  final String id;
  final String userId;
  final String courtId;
  final String futsalId;
  final String futsalName;
  final String location;
  final DateTime bookingDate;
  final String startTime;
  final String endTime;
  final double totalPrice;
  final String status; // 'pending', 'confirmed', 'cancelled', 'completed'
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final String? courtName;
  final String? format; // 'Box Cricket', '5-a-side', etc.
  final String? otp; // 6-digit verification code
  final double? refundAmount; // Amount refunded on cancellation
  final String? refundStatus; // 'pending', 'processed', 'failed'

  Booking({
    required this.id,
    required this.userId,
    required this.courtId,
    required this.futsalId,
    required this.futsalName,
    required this.location,
    required this.bookingDate,
    required this.startTime,
    required this.endTime,
    required this.totalPrice,
    required this.status,
    this.notes,
    this.createdAt,
    this.updatedAt,
    this.courtName,
    this.format,
    this.otp,
    this.refundAmount,
    this.refundStatus,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user']?.toString() ?? '',
      courtId: json['courtId']?.toString() ?? 
               json['court']?.toString() ?? 
               json['court']?['id']?.toString() ?? '',
      futsalId: json['futsalId']?.toString() ?? 
                json['court']?['venueId']?.toString() ??
                json['court']?['venue']?['id']?.toString() ?? '',
      futsalName: json['futsalName']?.toString() ?? 
                  json['court']?['venue']?['name']?.toString() ?? 
                  json['futsal']?['name']?.toString() ?? '',
      location: json['location']?.toString() ?? 
                json['court']?['venue']?['address']?.toString() ?? 
                json['court']?['venue']?['city']?.toString() ?? 
                json['futsal']?['address']?.toString() ?? '',
      bookingDate: json['bookingDate'] != null 
          ? DateTime.parse(json['bookingDate'].toString())
          : DateTime.now(),
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
      totalPrice: (json['totalPrice'] is int)
          ? (json['totalPrice'] as int).toDouble()
          : (json['totalPrice'] as double? ?? 0.0),
      status: (json['status']?.toString() ?? 'pending').toLowerCase(),
      notes: json['notes']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'].toString())
          : null,
      courtName: json['courtName']?.toString() ?? 
                 json['court']?['name']?.toString(),
      format: json['format']?.toString() ?? 
              json['court']?['format']?.toString(),
      otp: json['otp']?.toString(),
      refundAmount: json['refundAmount'] != null
          ? (json['refundAmount'] is int
              ? (json['refundAmount'] as int).toDouble()
              : json['refundAmount'] as double)
          : null,
      refundStatus: json['refundStatus']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'courtId': courtId,
      'futsalId': futsalId,
      'futsalName': futsalName,
      'location': location,
      'bookingDate': bookingDate.toIso8601String(),
      'startTime': startTime,
      'endTime': endTime,
      'totalPrice': totalPrice,
      'status': status,
      if (notes != null) 'notes': notes,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      if (courtName != null) 'courtName': courtName,
      if (format != null) 'format': format,
      if (otp != null) 'otp': otp,
      if (refundAmount != null) 'refundAmount': refundAmount,
      if (refundStatus != null) 'refundStatus': refundStatus,
    };
  }

  // Helper method to check if booking is active
  bool get isActive => status == 'confirmed' || status == 'pending';

  // Helper method to check if booking can be cancelled
  bool get canBeCancelled {
    if (status != 'confirmed' && status != 'pending') return false;
    
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final bookingDay = DateTime(
      bookingDate.year,
      bookingDate.month,
      bookingDate.day,
    );
    
    // Can cancel if booking is today or in the future
    return bookingDay.isAtSameMomentAs(today) || bookingDay.isAfter(today);
  }

  // Helper method to get formatted date
  String get formattedDate {
    return '${bookingDate.day}/${bookingDate.month}/${bookingDate.year}';
  }

  // Helper method to get formatted time range
  String get timeRange => '$startTime - $endTime';

  // Copy with method for easy updates
  Booking copyWith({
    String? id,
    String? userId,
    String? courtId,
    String? futsalId,
    String? futsalName,
    String? location,
    DateTime? bookingDate,
    String? startTime,
    String? endTime,
    double? totalPrice,
    String? status,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? courtName,
    String? format,
    String? otp,
    double? refundAmount,
    String? refundStatus,
  }) {
    return Booking(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      courtId: courtId ?? this.courtId,
      futsalId: futsalId ?? this.futsalId,
      futsalName: futsalName ?? this.futsalName,
      location: location ?? this.location,
      bookingDate: bookingDate ?? this.bookingDate,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      totalPrice: totalPrice ?? this.totalPrice,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      courtName: courtName ?? this.courtName,
      format: format ?? this.format,
      otp: otp ?? this.otp,
      refundAmount: refundAmount ?? this.refundAmount,
      refundStatus: refundStatus ?? this.refundStatus,
    );
  }
}