import 'package:flutter/material.dart';

import 'package:futsala_app/provider/futsal_provider.dart';
import 'package:futsala_app/provider/favorite_provider.dart';
import 'package:futsala_app/widgets/venue_card.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

class FutsalPage extends StatefulWidget {
  const FutsalPage({super.key});

  @override
  State<FutsalPage> createState() => _FutsalPageState();
}

class _FutsalPageState extends State<FutsalPage> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    // Auto-focus the search field when the page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FocusScope.of(context).requestFocus(_focusNode);
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _onSearchChanged(String query) async {
    if (!mounted) return;
    final futsalProvider = Provider.of<FutsalProvider>(context, listen: false);

    if (query.isNotEmpty) {
      setState(() {
        _isSearching = true;
      });

      final result = await futsalProvider.searchVenues(location: query);

      if (mounted && result['success'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Search failed')),
        );
      }
    } else {
      setState(() {
        _isSearching = false;
      });
      // Clear search results when query is empty
      futsalProvider.clearSearch();
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
              "Futsal Venues",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            ),
          ),

          Expanded(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: TextField(
                    controller: _searchController,
                    focusNode: _focusNode,
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: "Search by Name or Location",
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
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                  ),
                ),
                Expanded(
                  child: Consumer<FutsalProvider>(
                    builder: (context, futsalProvider, child) {
                      // Show loading indicator
                      if (futsalProvider.isLoading) {
                        return const Center(child: CircularProgressIndicator());
                      }

                      // Show initial empty state
                      if (!_isSearching &&
                          futsalProvider.searchResults.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.search,
                                size: 80,
                                color: Colors.grey[300],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                "Type to search for venues",
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      // Show no results found
                      if (_isSearching &&
                          futsalProvider.searchResults.isEmpty) {
                        return Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.location_off_outlined,
                                size: 80,
                                color: Colors.grey[300],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                "No venues found",
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[500],
                                ),
                              ),
                            ],
                          ),
                        );
                      }

                      // Show search results
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: futsalProvider.searchResults.length,
                        itemBuilder: (context, index) {
                          final venue = futsalProvider.searchResults[index];
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
                                  isFavorite: favProvider.isFavorite(venue.id),
                                  onFavoriteTap: () =>
                                      favProvider.toggleFavorite(venue),
                                );
                              },
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}