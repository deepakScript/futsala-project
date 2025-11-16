import 'package:flutter/material.dart';
import 'models.dart'; // import the models


List<Sport> sportsList = [
  Sport(name: "Football", imageUrl: "assets/football.png"),
  Sport(name: "Cricket", imageUrl: "assets/cricket.png"),
  Sport(name: "Basketball", imageUrl: "assets/basketball.png"),
  Sport(name: "Swimming", imageUrl: "assets/swimming.png"),
];

List<Venue> venuesList = [
  Venue(
    name: "Hotfut SPR City",
    location: "Stephenson road, Perambur",
    rating: 4.0,
    sports: ["Badminton", "Cricket", "Football", "Tennis"],
    images: [
      "assets/venue1_1.png",
      "assets/venue1_2.png",
    ],
  ),
  Venue(
    name: "Hotfut Vivira Mall",
    location: "OMR Road, Navalur",
    rating: 4.0,
    sports: ["Badminton", "Cricket", "Football", "Tennis"],
    images: [
      "assets/venue2_1.png",
      "assets/venue2_2.png",
    ],
  ),
];


class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Time, Location, Welcome
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text("04:35 PM", style: TextStyle(fontWeight: FontWeight.bold)),
                  Icon(Icons.signal_cellular_4_bar),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text("Your Location: Pokhara"),
                  Text("Welcome Back! Deepak"),
                ],
              ),

              const SizedBox(height: 20),

              // Search bar
              TextField(
                decoration: InputDecoration(
                  hintText: "Search",
                  prefixIcon: const Icon(Icons.search),
                  suffixIcon: const Icon(Icons.mic),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),

              const SizedBox(height: 20),

              // Banner
              Container(
                height: 120,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.black,
                  image: const DecorationImage(
                    image: AssetImage("assets/banner.png"), // your banner image
                    fit: BoxFit.cover,
                  ),
                ),
                alignment: Alignment.center,
                child: const Text(
                  "Refer a friend and Win Rs.500\nOn their First 2 Booking",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                  textAlign: TextAlign.center,
                ),
              ),

              const SizedBox(height: 20),

              // Sports Section
              const Text("Sports", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
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

              // Venues
              const Text("Available Venues", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 10),
              Column(
                children: venuesList.map((venue) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          height: 180,
                          child: PageView(
                            children: venue.images.map((img) {
                              return ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.asset(img, fit: BoxFit.cover),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(venue.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(venue.location, style: const TextStyle(color: Colors.grey)),
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            Icon(Icons.star, color: Colors.green[400], size: 16),
                            Text("${venue.rating}"),
                          ],
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),

      // Bottom Navigation
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.sports), label: "Turf"),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: "Booking"),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: "Favorites"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Profile"),
        ],
      ),
    );
  }
}
