import 'package:flutter/material.dart';
import 'package:futsala_app/core/router/app_router.dart';
import 'package:futsala_app/provider/auth_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';


class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

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
                  children: [
                    Text(
                      user?.fullName ?? "Guest",
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      user?.email ?? "Not logged in",
                      style: const TextStyle(
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
                buildMenuItem(
                  Icons.person,
                  "Account",
                  onTap: () {
                    context.goNamed(AppRoutes.editProfileName);
                  },
                ),
                buildMenuItem(
                  Icons.bookmark_border,
                  "Favourite Venues",
                  onTap: () {
                    context.goNamed(AppRoutes.favouriteName);
                  },
                ),
                buildMenuItem(
                  Icons.privacy_tip_outlined,
                  "Privacy Policy",
                  onTap: () {
                    context.goNamed(AppRoutes.privacyPolicyName);
                  },
                ),
                buildMenuItem(
                  Icons.info_outline,
                  "About Futsala",
                  onTap: () {
                    context.pushNamed(AppRoutes.aboutName);
                  },
                ),

                // Logout
                buildMenuItem(
                  Icons.logout,
                  "Logout",
                  color: Colors.red,
                  iconColor: Colors.red,
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text("Logout"),
                        content: const Text("Are you sure you want to logout?"),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Cancel"),
                          ),
                          TextButton(
                            onPressed: () async {
                              Navigator.pop(context);
                              await authProvider.logout();
                            },
                            child: const Text(
                              "OK",
                              style: TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // **************** MENU ITEM BUILDER ****************
  Widget buildMenuItem(IconData icon, String title,
      {
    Color color = Colors.black,
    Color iconColor = const Color(0xFF00C37A),
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon, size: 30, color: iconColor),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 18,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_forward_ios,
        size: 16,
        color: Colors.grey,
      ),
      contentPadding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
      onTap: onTap,
    );
  }
}

