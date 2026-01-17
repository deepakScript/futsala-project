import 'package:flutter/material.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/user_model.dart';
import 'package:futsala_app/provider/futsal_provider.dart';
import 'package:futsala_app/provider/favorite_provider.dart';
import 'package:futsala_app/widgets/venue_card.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';



class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String? token;
  UserModel? user;
  bool isLoading = true;


  @override
  void initState() {
    super.initState();
    _loadUserData();
  }



  Future<void> _loadUserData() async {
    token = await AuthStorage.getToken();
    user = await AuthStorage.getUser();

    // Fetch venues - provider handles token internally
    if (!mounted) return;

    final futsalProvider = Provider.of<FutsalProvider>(context, listen: false);
    final result = await futsalProvider.getAllVenues();

    // Handle response if needed
    if (result['success'] == false && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Failed to load venues')),
      );
    }

    if (mounted) {
      setState(() {
        isLoading = false;
      });
    }
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Gradient Header
          Container(
            padding: const EdgeInsets.only(
              top: 50,
              left: 20,
              right: 20,
              bottom: 20,
            ),
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xffC4F7E5), Colors.white],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Welcome Back !",
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.black54,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?.fullName ?? "Guest",
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),

          // Main Content
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                if (!context.mounted) return;

                final futsalProvider = Provider.of<FutsalProvider>(
                  context,
                  listen: false,
                );
                final result = await futsalProvider.refreshVenues();

                if (context.mounted && result['success'] == false) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? 'Refresh failed'),
                    ),
                  );
                }
              },
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                    const SizedBox(height: 20),



                    // Banner
                    Container(
                      height: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: Colors.black,
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        "Refer a friend and Win Rs.500\nOn their First 2 Booking",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Sports Section
                    const SizedBox(height: 20),

                    // Venues Section
                    const Text(
                      "Available Venues",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Consumer to listen to FutsalProvider changes
                    Consumer<FutsalProvider>(
                      builder: (context, futsalProvider, child) {
                        // Show loading indicator
                        if (futsalProvider.isLoading &&
                            futsalProvider.venues.isEmpty) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(40.0),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }

                        // Show error message
                        if (futsalProvider.error != null &&
                            futsalProvider.venues.isEmpty) {
                          return Center(
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                children: [
                                  Text(
                                    futsalProvider.error!,
                                    style: const TextStyle(color: Colors.red),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 10),
                                  ElevatedButton(
                                    onPressed: () async {
                                      final result = await futsalProvider
                                          .getAllVenues();
                                      if (context.mounted &&
                                          result['success'] == false) {
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(
                                              result['message'] ??
                                                  'Retry failed',
                                            ),
                                          ),
                                        );
                                      }
                                    },
                                    child: const Text('Retry'),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }

                        // Show empty state
                        if (futsalProvider.venues.isEmpty) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(40.0),
                              child: Text(
                                'No venues found',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                          );
                        }

                        // Show venues list using VenueCard
                        return Column(
                          children: futsalProvider.venues.map((venue) {
                            return GestureDetector(
                              onTap: () {
                                context.goNamed(
                                  'futsalView',
                                  pathParameters: {'venueId': venue.id},
                                );
                              },
                              child: Consumer<FavoriteProvider>(
                                builder: (context, favProvider, child) {
                                  return VenueCard(
                                    venue: venue,
                                    isFavorite: favProvider.isFavorite(
                                      venue.id,
                                    ),
                                    onFavoriteTap: () =>
                                        favProvider.toggleFavorite(venue),
                                  );
                                },
                              ),
                            );
                          }).toList(),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
