class Sport {
  final String name;
  final String imageUrl;
  Sport({required this.name, required this.imageUrl});
}

class Venue {
  final String name;
  final String location;
  final double rating;
  final List<String> sports;
  final List<String> images;

  Venue({
    required this.name,
    required this.location,
    required this.rating,
    required this.sports,
    required this.images,
  });
}
