import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:futsala_app/provider/booking_provider.dart';
import 'package:futsala_app/provider/payment_provider.dart';
import 'package:futsala_app/data/models/timeslot_model.dart';

class BookingScreen extends StatefulWidget {
  final String venueName;
  final String venueLocation;
  final String futsalId;

  const BookingScreen({
    Key? key,
    required this.venueName,
    required this.venueLocation,
    required this.futsalId,
  }) : super(key: key);

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  DateTime selectedDate = DateTime.now();
  List<TimeSlot> selectedSlots = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchAvailability();
    });
  }

  void _fetchAvailability() {
    context.read<BookingProvider>().checkAvailability(
      futsalId: widget.futsalId,
      date: selectedDate,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF5F5F5),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.venueName,
              style: const TextStyle(
                color: Colors.black,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              widget.venueLocation,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 12,
                fontWeight: FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
      body: Consumer<BookingProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              Expanded(
                child: provider.isLoading && provider.availability.isEmpty
                    ? const Center(child: CircularProgressIndicator())
                    : SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Date Selection
                              SizedBox(
                                height: 80,
                                child: ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: 7,
                                  itemBuilder: (context, index) {
                                    final date = DateTime.now().add(
                                      Duration(days: index),
                                    );
                                    final isSelected =
                                        selectedDate.day == date.day &&
                                        selectedDate.month == date.month;
                                    return GestureDetector(
                                      onTap: () {
                                        setState(() {
                                          selectedDate = date;
                                          selectedSlots = [];
                                        });
                                        _fetchAvailability();
                                      },
                                      child: Container(
                                        width: 80,
                                        margin: const EdgeInsets.only(
                                          right: 12,
                                        ),
                                        decoration: BoxDecoration(
                                          color: isSelected
                                              ? const Color(0xFF00C37A)
                                              : Colors.white,
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              DateFormat('EEE').format(date),
                                              style: TextStyle(
                                                color: isSelected
                                                    ? Colors.white
                                                    : Colors.black,
                                                fontWeight: FontWeight.w600,
                                                fontSize: 16,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              DateFormat('d MMM').format(date),
                                              style: TextStyle(
                                                color: isSelected
                                                    ? Colors.white
                                                    : Colors.black54,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: 24),

                              const Divider(height: 1),
                              const SizedBox(height: 24),

                              if (provider.error != null)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: Text(
                                    provider.error!,
                                    style: const TextStyle(color: Colors.red),
                                  ),
                                ),

                              const Text(
                                'AVAILABLE SLOTS',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),

                              if (provider.isLoading)
                                const Center(child: CircularProgressIndicator())
                              else if (provider.availability.isEmpty)
                                const Center(
                                  child: Text(
                                    'No slots available for this date',
                                  ),
                                )
                              else
                                // Group slots by court
                                ...() {
                                  final grouped = <String, List<TimeSlot>>{};
                                  for (var slot in provider.availability) {
                                    grouped
                                        .putIfAbsent(slot.courtName, () => [])
                                        .add(slot);
                                  }

                                  return grouped.entries.map((entry) {
                                    return Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 12.0,
                                          ),
                                          child: Row(
                                            children: [
                                              const Icon(
                                                Icons.stadium_outlined,
                                                size: 20,
                                                color: Color(0xFF00C37A),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                entry.key.toUpperCase(),
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.black87,
                                                  letterSpacing: 1.1,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        GridView.builder(
                                          shrinkWrap: true,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          gridDelegate:
                                              const SliverGridDelegateWithFixedCrossAxisCount(
                                                crossAxisCount: 3,
                                                childAspectRatio: 2.2,
                                                crossAxisSpacing: 10,
                                                mainAxisSpacing: 10,
                                              ),
                                          itemCount: entry.value.length,
                                          itemBuilder: (context, index) {
                                            final slot = entry.value[index];
                                            final isAvailable =
                                                slot.isAvailable;
                                            final isSelected = selectedSlots
                                                .contains(slot);

                                            return GestureDetector(
                                              onTap: isAvailable
                                                  ? () {
                                                      setState(() {
                                                        if (isSelected) {
                                                          selectedSlots.remove(
                                                            slot,
                                                          );
                                                        } else {
                                                          selectedSlots.add(
                                                            slot,
                                                          );
                                                        }
                                                      });
                                                    }
                                                  : null,
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  color: !isAvailable
                                                      ? Colors.grey.shade200
                                                      : isSelected
                                                      ? const Color(0xFF00C37A)
                                                      : Colors.white,
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  border: Border.all(
                                                    color: isAvailable
                                                        ? const Color(
                                                            0xFF00C37A,
                                                          )
                                                        : Colors.grey.shade300,
                                                    width: 1,
                                                  ),
                                                ),
                                                child: Stack(
                                                  children: [
                                                    if (!isAvailable)
                                                      ClipRRect(
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              8,
                                                            ),
                                                        child: CustomPaint(
                                                          size: Size.infinite,
                                                          painter:
                                                              DiagonalStripePainter(),
                                                        ),
                                                      ),
                                                    Center(
                                                      child: Text(
                                                        slot.startTime,
                                                        style: TextStyle(
                                                          color: !isAvailable
                                                              ? Colors.grey
                                                              : isSelected
                                                              ? Colors.white
                                                              : Colors.black,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          fontSize: 14,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                        const SizedBox(height: 16),
                                      ],
                                    );
                                  }).toList();
                                }(),
                              const SizedBox(height: 100),
                            ],
                          ),
                        ),
                      ),
              ),

              // Bottom Bar
              _buildBottomBar(provider),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBottomBar(BookingProvider provider) {
    final hasSelection = selectedSlots.isNotEmpty;
    final totalPrice = provider.calculateTotalPrice(selectedSlots);
    const discount = 200.0;
    final finalPrice = totalPrice - (selectedSlots.isNotEmpty ? discount : 0);

    return Container(
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (hasSelection)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: const Color(0xFFFF4444),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Icon(
                      Icons.local_offer,
                      size: 16,
                      color: Color(0xFFFF4444),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Offer applied You are saving ₹200',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF00C37A),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (hasSelection) ...[
                      Text(
                        '₹$finalPrice',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${selectedSlots.length} Slots Selected',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ] else
                      const Text(
                        'Select time slots',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ],
                ),
                ElevatedButton(
                  onPressed: hasSelection ? _proceedToBooking : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    disabledBackgroundColor: Colors.white38,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Row(
                    children: [
                      Text(
                        'PROCEED',
                        style: TextStyle(
                          color: hasSelection
                              ? const Color(0xFF00C37A)
                              : Colors.grey,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        Icons.arrow_forward,
                        color: hasSelection
                            ? const Color(0xFF00C37A)
                            : Colors.grey,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _proceedToBooking() async {
    final provider = context.read<BookingProvider>();
    final paymentProvider = context.read<PaymentProvider>();

    final bookingId = await provider.createMultipleBookings(
      bookingDate: selectedDate,
      selectedSlots: selectedSlots,
    );

    if (mounted) {
      if (bookingId != null) {
        // Start Khalti SDK Payment
        await paymentProvider.payWithKhalti(context, bookingId);

        if (paymentProvider.error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: ${paymentProvider.error}'),
              backgroundColor: Colors.red,
            ),
          );
        } else if (paymentProvider.successMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(paymentProvider.successMessage!),
              backgroundColor: Colors.green,
            ),
          );
          context.pop();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.error ?? 'Booking failed'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}

// Custom painter for diagonal stripes (unavailable slots)
class DiagonalStripePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final spacing = 8.0;
    for (double i = -size.height; i < size.width; i += spacing) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i + size.height, size.height),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
