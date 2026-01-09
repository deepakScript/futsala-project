class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String phoneNumber;
  final String role;
  final bool isVerified;
  final String createdAt;
  final String updatedAt;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.phoneNumber,
    required this.role,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json["id"],
      email: json["email"],
      fullName: json["fullName"],
      phoneNumber: json["phoneNumber"],
      role: json["role"],
      isVerified: json["isVerified"],
      createdAt: json["createdAt"],
      updatedAt: json["updatedAt"],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
      "fullName": fullName,
      "phoneNumber": phoneNumber,
      "role": role,
      "isVerified": isVerified,
      "createdAt": createdAt,
      "updatedAt": updatedAt,
    };
  }
}
