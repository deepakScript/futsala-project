import 'package:flutter/material.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Privacy Policy'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              "Privacy Policy",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF00C37A),
              ),
            ),
            SizedBox(height: 20),
            Text(
              "Last updated: January 2026",
              style: TextStyle(color: Colors.grey),
            ),
            SizedBox(height: 20),
            Text(
              "1. Introduction",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "Welcome to Futsala. We respect your privacy and are committed to protecting your personal data.",
              style: TextStyle(height: 1.5),
            ),
            SizedBox(height: 20),
            Text(
              "2. Data We Collect",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "We may collect personal identification information including but not limited to name, email address, phone number, and location data when you use our services.",
              style: TextStyle(height: 1.5),
            ),
            SizedBox(height: 20),
            Text(
              "3. How We Use Your Data",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "We use your data to facilitate futsal venue bookings, process payments, and improve your experience with our app.",
              style: TextStyle(height: 1.5),
            ),
            SizedBox(height: 20),
            Text(
              "4. Contact Us",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "If you have any questions about this Privacy Policy, please contact us at support@futsala.com.",
              style: TextStyle(height: 1.5),
            ),
             SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
