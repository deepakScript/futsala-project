import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:futsala_app/core/utils/image_constant.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // ===================== GRADIENT HEADER =====================
          Container(
            padding: const EdgeInsets.fromLTRB(20, 45, 20, 20),
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xffC4F7E5), Colors.white],
              ),
            ),
            child: Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
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
                        context.go('/profile');
                      }
                    },
                  ),
                ),
                const SizedBox(width: 20),
                const Text(
                  'About Futsala',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),

          // ===================== CONTENT =====================
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 10),
              child: Column(
                children: [
                   const SizedBox(height: 20),
                  // App Logo/Icon
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xffC4F7E5).withValues(alpha: 0.5),
                    ),
                    child: Image.asset(
                      ImageConstant.imgLogo,
                      width: 80,
                      height: 80,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    "Futsala",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF00C37A),
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "The ultimate futsal booking app. Reserve your favorite pitch in seconds, organize matches, and never miss a game.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  const Row(
                    children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          "DEVELOPED BY",
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      Expanded(child: Divider()),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _buildDeveloperCard("Deepak Chhantyal"),
                  const SizedBox(height: 12),
                  _buildDeveloperCard("Pawan Paudel"),
                  const SizedBox(height: 12),
                  _buildDeveloperCard("Roshan Adhikari"),
                  
                  const SizedBox(height: 60),
                  const Text(
                    "Version 1.0.0",
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeveloperCard(String name) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xffC4F7E5),
            radius: 18,
            child: Text(
              name.substring(0, 1),
              style: const TextStyle(
                color: Color(0xFF00C37A),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Text(
            name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const Spacer(),
          Icon(Icons.code, color: Colors.grey[400], size: 20),
        ],
      ),
    );
  }
}
