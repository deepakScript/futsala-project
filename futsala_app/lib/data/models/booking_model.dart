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
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? json['user']?.toString() ?? '',
      courtId: json['courtId']?.toString() ?? 
               json['court']?.toString() ?? 
               json['court']?['id']?.toString() ?? '',
      futsalId: json['futsalId']?.toString() ?? 
                json['futsal']?.toString() ?? 
                json['court']?['venue']?['id']?.toString() ?? '',
      futsalName: json['futsalName']?.toString() ?? 
                  json['futsal']?['name']?.toString() ?? 
                  json['court']?['venue']?['name']?.toString() ?? '',
      location: json['location']?.toString() ?? 
                json['futsal']?['location']?.toString() ?? 
                json['futsal']?['address']?.toString() ?? 
                json['court']?['venue']?['address']?.toString() ?? 
                json['court']?['venue']?['city']?.toString() ?? '',
      bookingDate: json['bookingDate'] != null 
          ? DateTime.parse(json['bookingDate'].toString())
          : DateTime.now(),
      startTime: json['startTime']?.toString() ?? '',
      endTime: json['endTime']?.toString() ?? '',
      totalPrice: (json['totalPrice'] is int)
          ? (json['totalPrice'] as int).toDouble()
          : (json['totalPrice'] as double? ?? 0.0),
      status: json['status']?.toString() ?? 'pending',
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
    };
  }

  // Helper method to check if booking is active
  bool get isActive => status == 'confirmed' || status == 'pending';

  // Helper method to check if booking can be cancelled
  bool get canBeCancelled {
    if (status != 'confirmed' && status != 'pending') return false;
    
    final now = DateTime.now();
    final bookingDateTime = DateTime(
      bookingDate.year,
      bookingDate.month,
      bookingDate.day,
    );
    
    return bookingDateTime.isAfter(now);
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
    );
  }
}