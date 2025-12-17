class Venue {
  final String id;
  final String name;
  final String location; 
  final double rating;
  final List<String> sports; 
  final List<String> images;
  final bool isFavorite; // Add this field

  Venue({
    required this.id,
    required this.name,
    required this.location,
    required this.rating,
    required this.sports,
    required this.images,
    this.isFavorite = false, // Default to false
  });

  factory Venue.fromJson(Map<String, dynamic> json) {
    return Venue(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      location: json['location']?.toString() ?? json['address']?.toString() ?? '',
      rating: (json['rating'] is int) 
          ? (json['rating'] as int).toDouble() 
          : (json['rating'] as double? ?? 0.0),
      sports: (json['sports'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? 
          (json['amenities'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? [],
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList() ?? [],
      isFavorite: json['isFavorite'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "location": location,
      "rating": rating,
      "sports": sports,
      "images": images,
      "isFavorite": isFavorite,
    };
  }
}