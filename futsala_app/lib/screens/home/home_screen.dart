import 'package:flutter/material.dart';
import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/user_model.dart';
import 'package:futsala_app/provider/futsal_provider.dart';
import 'package:futsala_app/screens/home/models.dart';
import 'package:futsala_app/widgets/venue_card.dart';
import 'package:provider/provider.dart';


List<Sport> sportsList = [
  Sport(name: "Football", imageUrl: "assets/football.png"),
  Sport(name: "Cricket", imageUrl: "assets/cricket.png"),
  Sport(name: "Basketball", imageUrl: "assets/basketball.png"),
  Sport(name: "Swimming", imageUrl: "assets/swimming.png"),
];

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String? token;
  UserModel? user;
  bool isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    token = await AuthStorage.getToken();
    user = await AuthStorage.getUser();
    print(user);

    // Fetch venues - provider handles token internally
    if (mounted) {
      final futsalProvider = Provider.of<FutsalProvider>(context, listen: false);
      final result = await futsalProvider.getAllVenues();
      
      // Handle response if needed
      if (result['success'] == false) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['message'] ?? 'Failed to load venues')),
          );
        }
      }
    }

    if (mounted) {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _onSearchChanged(String query) async {
    final futsalProvider = Provider.of<FutsalProvider>(context, listen: false);
    
    // Use API search for more comprehensive results
    if (query.isNotEmpty) {
      final result = await futsalProvider.searchVenues(location: query);
      
      // Handle search response if needed
      if (result['success'] == false && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Search failed')),
        );
      }
    } else {
      // Show all venues when search is cleared
      await futsalProvider.getAllVenues();
    }
  }

  void _toggleFavorite(String venueId) {
    // Implement your favorite toggle logic here
    // You can add this method to FutsalProvider
    print('Toggle favorite for venue: $venueId');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            final futsalProvider = Provider.of<FutsalProvider>(context, listen: false);
            final result = await futsalProvider.refreshVenues();
            
            if (result['success'] == false && mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(result['message'] ?? 'Refresh failed')),
              );
            }
          },
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Your Location: Pokhara"),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text("Welcome Back !"),
                        Text(
                          user?.fullName ?? "Sir",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF00C37A),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // Search bar
                TextField(
                  controller: _searchController,
                  onChanged: (value) {
                    _onSearchChanged(value);
                    setState(() {}); // Update UI for clear button
                  },
                  decoration: InputDecoration(
                    hintText: "Search venues...",
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                              setState(() {});
                            },
                          )
                        : const Icon(Icons.mic),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),

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
                const Text(
                  "Sports",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: sportsList.length,
                    itemBuilder: (context, index) {
                      final sport = sportsList[index];
                      return Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: Column(
                          children: [
                            Container(
                              height: 60,
                              width: 60,
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(12),
                                image: DecorationImage(
                                  image: AssetImage(sport.imageUrl),
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(sport.name),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 20),

                // Venues Section
                const Text(
                  "Available Venues",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                ),
                const SizedBox(height: 10),

                // Consumer to listen to FutsalProvider changes
                Consumer<FutsalProvider>(
                  builder: (context, futsalProvider, child) {
                    // Show loading indicator
                    if (futsalProvider.isLoading && futsalProvider.venues.isEmpty) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }

                    // Show error message
                    if (futsalProvider.error != null && futsalProvider.venues.isEmpty) {
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
                                  final result = await futsalProvider.getAllVenues();
                                  if (result['success'] == false && mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(result['message'] ?? 'Retry failed')),
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
                    if (futsalProvider.searchResults.isEmpty && futsalProvider.venues.isEmpty) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(40.0),
                          child: Text(
                            'No venues found',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ),
                      );
                    }

                    // Use searchResults if available, otherwise use venues
                    final venuesToDisplay = futsalProvider.searchResults.isNotEmpty 
                        ? futsalProvider.searchResults 
                        : futsalProvider.venues;

                    // Show venues list using VenueCard
                    return Column(
                      children: venuesToDisplay.map((venue) {
                        return GestureDetector(
                          onTap: () {
                            // Navigate to venue details
                            // Get.toNamed('/venue-details', arguments: venue.id);
                            // Or Navigator.pushNamed(context, '/venue-details', arguments: venue.id);
                          },
                          child: VenueCard(
                            venue: venue,
                            onFavoriteTap: () => _toggleFavorite(venue.id),
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
    );
  }
}