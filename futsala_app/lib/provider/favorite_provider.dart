import 'package:flutter/material.dart';
import 'package:futsala_app/data/models/venue_model.dart';

class FavoriteProvider extends ChangeNotifier {
  final Map<String, Venue> _favoriteVenues = {};

  List<Venue> get favorites => _favoriteVenues.values.toList();

  bool isFavorite(String venueId) {
    return _favoriteVenues.containsKey(venueId);
  }

  void toggleFavorite(Venue venue) {
    if (_favoriteVenues.containsKey(venue.id)) {
      _favoriteVenues.remove(venue.id);
    } else {
      _favoriteVenues[venue.id] = venue;
    }
    notifyListeners();
  }
}
