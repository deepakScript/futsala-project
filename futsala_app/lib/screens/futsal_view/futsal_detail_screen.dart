import 'package:flutter/material.dart';
import 'package:futsala_app/data/models/venue_model.dart';
import 'package:futsala_app/provider/futsal_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:futsala_app/provider/review_provider.dart';

// ------------------ UI ------------------
class VenueDetailsPage extends StatefulWidget {
  final String venueId;

  const VenueDetailsPage({super.key, required this.venueId});

  @override
  State<VenueDetailsPage> createState() => _VenueDetailsPageState();
}



class _VenueDetailsPageState extends State<VenueDetailsPage> {
  Venue? venue;
  bool isLoading = true;
  String? errorMessage;
  int _userRating = 0; // State to track selected rating

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchVenueDetails();
    });
  }

  Future<void> _fetchVenueDetails() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final futsalProvider = Provider.of<FutsalProvider>(
        context,
        listen: false,
      );
      final fetchedVenue = await futsalProvider.getVenueById(widget.venueId);

      setState(() {
        venue = fetchedVenue;
        isLoading = false;
        // Optionally set initial user rating if available from API
      });
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }
  
  void _handleRating(int rating) async {
    setState(() {
      _userRating = rating;
    });

    if (venue == null) return;

    final reviewProvider = Provider.of<ReviewProvider>(context, listen: false);
    
    // Optimistic UI update or simple feedback
    final result = await reviewProvider.submitRating(venue!.id, rating.toDouble());
    
    if (!mounted) return;

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Rating submitted successfully!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Failed to submit rating')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
          ? Center(child: Text('Error: $errorMessage'))
          : venue == null
          ? const Center(child: Text('Venue not found'))
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Image Slider with Back Button
                  Stack(
                    children: [
                      SizedBox(
                        height: 220,
                        child: PageView.builder(
                          itemCount: venue!.images.length,
                          itemBuilder: (_, i) =>
                              Image.network(venue!.images[i], fit: BoxFit.cover),
                        ),
                      ),
                      // Back Button
                      Positioned(
                        top: 40, // Adjust for status bar
                        left: 16,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.2),
                                blurRadius: 4,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back, color: Colors.black),
                            onPressed: () {
                              if (context.canPop()) {
                                context.pop();
                              } else {
                                context.go('/'); // Fallback to home
                              }
                            },
                          ),
                        ),
                      ),
                    ],
                  ),

                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Title
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  venue!.name,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  venue!.location,
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),

                        // Interactive Rating
                        Row(
                          children: [
                            const Text(
                              'Rate this venue: ',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(5, (index) {
                                return GestureDetector(
                                  onTap: () => _handleRating(index + 1),
                                  child: Icon(
                                    index < _userRating ? Icons.star : Icons.star_border,
                                    color: const Color(0xFF00C37A),
                                    size: 30, // Larger size for tappable area
                                  ),
                                );
                              }),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '(${venue!.rating})',
                              style: const TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),

                        const SizedBox(height: 12),
                        Text(
                          venue!.location,
                          style: const TextStyle(color: Colors.grey),
                        ),

                        const SizedBox(height: 16),

                        // Amenities // ... rest of the widget
                        const Text(
                          'Amenities',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Column(
                          children: venue!.amenities
                              .map(
                                (a) => ListTile(
                                  dense: true,
                                  leading: const Icon(
                                    Icons.check,
                                    color: Color(0xFF00C37A),
                                  ),
                                  title: Text(a),
                                ),
                              )
                                   .toList(),
                         ),
                       ],
                     ),
                   ),
                 ],
               ),
             ),
      bottomNavigationBar: isLoading || venue == null
          ? null
          : Container(
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C37A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () {
                  if (venue != null) {
                    context.go(
                      '/futsal-booking/${venue!.id}?name=${Uri.encodeComponent(venue!.name)}&location=${Uri.encodeComponent(venue!.location)}',
                    );
                  }
                },
                child: const Text('PROCEED TO SELECT A SLOT', style: TextStyle(color: Colors.white),),
              ),
            ),
    );
  }
}
