import 'package:flutter/material.dart';


class BookingPage extends StatelessWidget {
  const BookingPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Booking')),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_note, size: 100, color: Colors.orange),
            SizedBox(height: 20),
            Text('Booking Page', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}