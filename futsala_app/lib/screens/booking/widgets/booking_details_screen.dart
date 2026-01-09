import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:futsala_app/data/models/booking_model.dart';
import 'package:futsala_app/provider/booking_provider.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';


class BookingDetailsScreen extends StatefulWidget {
  final Booking booking;

  const BookingDetailsScreen({
    Key? key,
    required this.booking,
  }) : super(key: key);

  @override
  State<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends State<BookingDetailsScreen> {
  late Booking _booking;

  @override
  void initState() {
    super.initState();
    _booking = widget.booking;
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      case 'completed':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Icons.check_circle;
      case 'pending':
        return Icons.schedule;
      case 'cancelled':
        return Icons.cancel;
      case 'completed':
        return Icons.done_all;
      default:
        return Icons.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor(_booking.status);

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text(
          'Booking Details',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Status Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
              ),
              child: Column(
                children: [
                  Icon(
                    _getStatusIcon(_booking.status),
                    size: 64,
                    color: statusColor,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _booking.status.toUpperCase(),
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: statusColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Booking ID: ${_booking.id}',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Venue Details Card
            _buildCard(
              title: 'Venue Details',
              icon: Icons.sports_soccer,
              children: [
                _buildInfoRow(
                  Icons.business,
                  'Venue Name',
                  _booking.futsalName,
                ),
                _buildInfoRow(
                  Icons.location_on,
                  'Location',
                  _booking.location,
                ),
                if (_booking.courtName != null)
                  _buildInfoRow(
                    Icons.sports,
                    'Court',
                    _booking.courtName!,
                  ),
                if (_booking.format != null)
                  _buildInfoRow(
                    Icons.grid_view,
                    'Format',
                    _booking.format!,
                  ),
              ],
            ),

            // Booking Details Card
            _buildCard(
              title: 'Booking Information',
              icon: Icons.calendar_today,
              children: [
                _buildInfoRow(
                  Icons.event,
                  'Date',
                  DateFormat('EEEE, MMMM d, yyyy').format(_booking.bookingDate),
                ),
                _buildInfoRow(
                  Icons.access_time,
                  'Time',
                  _booking.timeRange,
                ),
                _buildInfoRow(
                  Icons.schedule,
                  'Duration',
                  _calculateDuration(_booking.startTime, _booking.endTime),
                ),
                if (_booking.notes != null && _booking.notes!.isNotEmpty)
                  _buildInfoRow(
                    Icons.note,
                    'Notes',
                    _booking.notes!,
                  ),
              ],
            ),

            // Payment Details Card
            _buildCard(
              title: 'Payment Details',
              icon: Icons.payments,
              children: [
                _buildPriceRow('Booking Amount', _booking.totalPrice),
                const Divider(height: 24),
                _buildPriceRow(
                  'Total Amount',
                  _booking.totalPrice,
                  isTotal: true,
                ),
              ],
            ),

            // Booking Timeline Card
            if (_booking.createdAt != null)
              _buildCard(
                title: 'Booking Timeline',
                icon: Icons.timeline,
                children: [
                  _buildTimelineItem(
                    'Booking Created',
                    _booking.createdAt!,
                    Icons.add_circle,
                    Colors.blue,
                  ),
                  if (_booking.updatedAt != null &&
                      _booking.updatedAt!.isAfter(_booking.createdAt!))
                    _buildTimelineItem(
                      'Last Updated',
                      _booking.updatedAt!,
                      Icons.update,
                      Colors.orange,
                    ),
                ],
              ),

            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomActions(),
    );
  }

  Widget _buildCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: const Color(0xFF00C37A), size: 24),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, double amount, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 18 : 16,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w500,
            color: isTotal ? Colors.black : Colors.grey.shade700,
          ),
        ),
        Text(
          '₹${amount.toInt()}',
          style: TextStyle(
            fontSize: isTotal ? 24 : 18,
            fontWeight: FontWeight.bold,
            color: isTotal ? const Color(0xFF00C37A) : Colors.black,
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineItem(
    String label,
    DateTime dateTime,
    IconData icon,
    Color color,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  DateFormat('MMM d, yyyy • hh:mm a').format(dateTime),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget? _buildBottomActions() {
    if (!_booking.canBeCancelled) {
      return null;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Reschedule Button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _showRescheduleDialog,
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF00C37A),
                  side: const BorderSide(color: Color(0xFF00C37A), width: 2),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                icon: const Icon(Icons.edit_calendar),
                label: const Text(
                  'Reschedule',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Cancel Button
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _showCancelDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 0,
                ),
                icon: const Icon(Icons.cancel),
                label: const Text(
                  'Cancel',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _calculateDuration(String startTime, String endTime) {
    try {
      final start = TimeOfDay(
        hour: int.parse(startTime.split(':')[0]),
        minute: int.parse(startTime.split(':')[1]),
      );
      final end = TimeOfDay(
        hour: int.parse(endTime.split(':')[0]),
        minute: int.parse(endTime.split(':')[1]),
      );

      int hours = end.hour - start.hour;
      int minutes = end.minute - start.minute;

      if (minutes < 0) {
        hours--;
        minutes += 60;
      }

      if (hours > 0 && minutes > 0) {
        return '$hours hour${hours > 1 ? 's' : ''} $minutes min';
      } else if (hours > 0) {
        return '$hours hour${hours > 1 ? 's' : ''}';
      } else {
        return '$minutes minutes';
      }
    } catch (e) {
      return 'N/A';
    }
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
            SizedBox(width: 12),
            Text('Cancel Booking?'),
          ],
        ),
        content: const Text(
          'Are you sure you want to cancel this booking? This action cannot be undone.',
          style: TextStyle(fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text(
              'No, Keep It',
              style: TextStyle(color: Colors.grey),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              context.pop();
              _cancelBooking();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('Yes, Cancel'),
          ),
        ],
      ),
    );
  }

  Future<void> _cancelBooking() async {
    // Show loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: Color(0xFF00C37A)),
      ),
    );

    final provider = context.read<BookingProvider>();
    final success = await provider.cancelBooking(_booking.id);

    // Close loading
    if (mounted) context.pop();

    // Show result
    if (mounted) {
      if (success) {
        setState(() {
          _booking = _booking.copyWith(status: 'cancelled');
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 8),
                Text('Booking cancelled successfully'),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );

        // Go back after a delay
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) context.pop();
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.error, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    provider.error ?? 'Failed to cancel booking',
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showRescheduleDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text('Reschedule Booking'),
        content: const Text(
          'This feature will allow you to change the date and time of your booking. Would you like to proceed?',
        ),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              context.pop();
              _showRescheduleDatePicker();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00C37A),
            ),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  Future<void> _showRescheduleDatePicker() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _booking.bookingDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF00C37A),
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && mounted) {
      // Here you would implement the full reschedule flow
      // For now, just show a message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Reschedule feature coming soon!'),
          backgroundColor: Color(0xFF00C37A),
        ),
      );
    }
  }
}