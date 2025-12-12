import 'package:flutter/material.dart';
import 'package:futsala_app/data/models/venue_model.dart';

class VenueCard extends StatefulWidget {
  final VenueModel venue;
  final VoidCallback onFavoriteTap;

  const VenueCard({
    super.key,
    required this.venue,
    required this.onFavoriteTap,
  });

  @override
  State<VenueCard> createState() => _VenueCardState();
}

class _VenueCardState extends State<VenueCard> {
  int currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ✅ IMAGE SLIDER
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
                child: SizedBox(
                  height: 180,
                  child: PageView.builder(
                    itemCount: widget.venue.images.length,
                    onPageChanged: (index) {
                      setState(() {
                        currentIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return Image.network(
                        widget.venue.images[index],
                        width: double.infinity,
                        fit: BoxFit.cover,
                      );
                    },
                  ),
                ),
              ),

              // ✅ FAVORITE BUTTON
              Positioned(
                top: 10,
                right: 10,
                child: GestureDetector(
                  onTap: widget.onFavoriteTap,
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Icon(
                      widget.venue.isFavorite
                          ? Icons.favorite
                          : Icons.favorite_border,
                      color: widget.venue.isFavorite
                          ? Colors.green
                          : Colors.grey,
                    ),
                  ),
                ),
              ),

              // ✅ PAGE INDICATOR DOTS
              Positioned(
                bottom: 10,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    widget.venue.images.length,
                    (index) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      height: 6,
                      width: currentIndex == index ? 16 : 6,
                      decoration: BoxDecoration(
                        color: currentIndex == index
                            ? Colors.white
                            : Colors.white54,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),

          // ✅ DETAILS SECTION
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // NAME & RATING
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.venue.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.green, size: 16),
                        const SizedBox(width: 4),
                        Text(widget.venue.rating.toString()),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 4),

                // LOCATION
                Text(
                  widget.venue.location,
                  style: const TextStyle(color: Colors.grey),
                ),

                const SizedBox(height: 8),

                // SPORTS TAGS
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: widget.venue.sports.map((sport) {
                    return Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        sport,
                        style: const TextStyle(fontSize: 12),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
