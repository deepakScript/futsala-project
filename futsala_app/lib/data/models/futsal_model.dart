// models/turf_model.dart
class FutsalModel {
  final String name;
  final String address;
  final List<String> images;
  final List<String> sports;
  final double rating;
  bool isFavourite;

  FutsalModel({
    required this.name,
    required this.address,
    required this.images,
    required this.sports,
    required this.rating,
    this.isFavourite = true,
  });
}
