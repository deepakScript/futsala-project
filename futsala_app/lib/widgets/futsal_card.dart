// widgets/turf_card.dart
import 'package:flutter/material.dart';
import '../data/models/futsal_model.dart';

class FutsalCard extends StatelessWidget {
  final FutsalModel turf;
  final VoidCallback onFavouriteToggle;

  const FutsalCard({
    super.key,
    required this.turf,
    required this.onFavouriteToggle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        /// IMAGE + FAV ICON
        Stack(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.network(
                turf.images.first,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Positioned(
              top: 10,
              right: 10,
              child: InkWell(
                onTap: onFavouriteToggle,
                child: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Icon(
                    turf.isFavourite ? Icons.favorite : Icons.favorite_border,
                    color: Colors.green,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),

        /// TITLE + ADDRESS
        Text(
          turf.name,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        Text(
          turf.address,
          style: const TextStyle(fontSize: 13, color: Colors.grey),
        ),
        const SizedBox(height: 6),

        /// SPORTS
        Row(
          children: turf.sports
              .map((sport) => Padding(
                    padding: const EdgeInsets.only(right: 5),
                    child: Chip(
                      label: Text(sport, style: const TextStyle(fontSize: 12)),
                    ),
                  ))
              .toList(),
        ),
        const SizedBox(height: 6),

        /// RATING
        Row(
          children: [
            const Icon(Icons.star, size: 18, color: Colors.green),
            const SizedBox(width: 4),
            Text("${turf.rating}", style: const TextStyle(fontSize: 14)),
          ],
        ),
        const SizedBox(height: 14),
      ],
    );
  }
}
