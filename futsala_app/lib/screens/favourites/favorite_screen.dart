import 'package:flutter/material.dart';
import 'package:futsala_app/widgets/venue_card.dart';
import 'package:provider/provider.dart';
import 'package:futsala_app/provider/favorite_provider.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(
              top: 60,
              left: 20,
              right: 20,
              bottom: 20,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xffC4F7E5), Colors.white],
              ),
            ),
            child: const Text(
              "Favorites",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Consumer<FavoriteProvider>(
                builder: (context, favProvider, child) {
                  final venues = favProvider.favorites;

                  if (venues.isEmpty) {
                    return const Center(child: Text("No favorites found"));
                  }

                  return ListView.builder(
                    padding: EdgeInsets.zero,
                    itemCount: venues.length,
                    itemBuilder: (context, index) {
                      final venue = venues[index];
                      return VenueCard(
                        venue: venue,
                        isFavorite: true,
                        onFavoriteTap: () {
                          favProvider.toggleFavorite(venue);
                        },
                      );
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );

  }
}
