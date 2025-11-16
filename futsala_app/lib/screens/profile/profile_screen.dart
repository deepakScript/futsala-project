import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      // ===================== APPBAR (TIME + WIFI ICON AREA) =====================
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 45),
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xffC4F7E5), Colors.white],
              ),
            ),
          ),

          // ===================== PROFILE HEADER =====================
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 35,
                
                ),
                const SizedBox(width: 15),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      "Surendar",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      "Surendarpv01@gmail.com",
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),

          const SizedBox(height: 30),

          // ===================== MENU ITEMS =====================
          Expanded(
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: [
                buildMenuItem(Icons.person, "Account"),
                buildMenuItem(Icons.edit_calendar, "Your Booking"),
                buildMenuItem(Icons.verified, "Refunds"),
                buildMenuItem(Icons.bookmark_border, "Favourite Venues"),
                buildMenuItem(Icons.support_agent, "Support"),
                buildMenuItem(Icons.privacy_tip_outlined, "Privacy Policy"),
                buildMenuItem(Icons.shield_outlined, "Terms of use"),

                // Logout
                buildMenuItem(Icons.logout, "Logout",
                    color: Colors.red, iconColor: Colors.red),
              ],
            ),
          ),

          // ===================== BOTTOM NAVIGATION BAR =====================
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: Colors.grey.shade300)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: const [
                BottomNavItem(icon: Icons.home, label: "Home"),
                BottomNavItem(icon: Icons.sports_soccer, label: "Turf"),
                BottomNavItem(icon: Icons.edit_calendar, label: "Booking"),
                BottomNavItem(icon: Icons.bookmark_border, label: "Favorites"),
                BottomNavItem(
                    icon: Icons.person, label: "Profile", active: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // **************** MENU ITEM BUILDER ****************
  Widget buildMenuItem(IconData icon, String title,
      {Color color = Colors.black, Color iconColor = Colors.green}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      child: Row(
        children: [
          Icon(icon, size: 34, color: iconColor),
          const SizedBox(width: 20),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ================= BOTTOM NAV ITEM WIDGET ==================
class BottomNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;

  const BottomNavItem(
      {super.key, required this.icon, required this.label, this.active = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 28, color: active ? Colors.green : Colors.black),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: active ? Colors.green : Colors.black,
          ),
        )
      ],
    );
  }
}
