class FavoriteService {
  static Future<List<Map<String, dynamic>>> fetchFavorites() async {
    await Future.delayed(const Duration(seconds: 1)); // Simulate API delay

    return [
      {
        "name": "Hotfut SPR City",
        "location": "Stephenson road, Perambur",
        "rating": 4.0,
        "sports": ["Badminton", "Cricket", "Football", "Tennis"],
        "images": [
          "https://picsum.photos/450/300",
          "https://picsum.photos/450/300",
          "https://picsum.photos/450/300"
        ],
        "isFavorite": true,
      },
      {
        "name": "Hotfut Vivira Mall",
        "location": "OMR Road, Navalur",
        "rating": 4.0,
        "sports": ["Badminton", "Cricket", "Football", "Tennis"],
        "images": [
          "https://picsum.photos/450/300",
          "https://picsum.photos/450/300",
          "https://picsum.photos/450/300"
        ],
        "isFavorite": true,
      },
    ];
  }
}
