import 'dart:async';
import 'package:flutter/material.dart';
import 'package:futsala_app/core/router/router_extension.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class EmailOTPVerificationScreen extends StatefulWidget {
  final String email; // email passed from previous page

  const EmailOTPVerificationScreen({super.key, required this.email});

  @override
  State<EmailOTPVerificationScreen> createState() =>
      _EmailOTPVerificationScreenState();
}

class _EmailOTPVerificationScreenState
    extends State<EmailOTPVerificationScreen> {
  TextEditingController otpController = TextEditingController();
  StreamController<ErrorAnimationType>? errorController;
  int remainingTime = 60;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    errorController = StreamController<ErrorAnimationType>();

    timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (remainingTime > 0) {
        setState(() => remainingTime--);
      }
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    errorController?.close();
    super.dispose();
  }

  void verifyOTP() {
    if (otpController.text.length == 6) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text("OTP Verified")));
      context.goToSavePassword();
    } else {
      errorController!.add(ErrorAnimationType.shake);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// BACK + TIME (Optional)
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, size: 26),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    "Forgot Password",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              /// INSTRUCTION TEXT
              Text(
                "Verify OTP sent to ${widget.email.replaceRange(2, widget.email.indexOf('@'), "******")}",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 25),

              /// OTP INPUT
              PinCodeTextField(
                appContext: context,
                length: 6,
                controller: otpController,
                obscureText: false,
                animationType: AnimationType.fade,
                errorAnimationController: errorController,
                keyboardType: TextInputType.number,
                pinTheme: PinTheme(
                  shape: PinCodeFieldShape.box,
                  borderRadius: BorderRadius.circular(8),
                  fieldHeight: 55,
                  fieldWidth: 45,
                  activeColor: Colors.green,
                  selectedColor: Colors.green,
                  inactiveColor: Colors.grey,
                ),
                onChanged: (value) {},
              ),

              const SizedBox(height: 10),

              /// AUTO FETCH TEXT
              Row(
                children: const [
                  CircularProgressIndicator(strokeWidth: 2),
                  SizedBox(width: 8),
                  Text(
                    "Auto fetching OTP...",
                    style: TextStyle(color: Colors.green),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              /// SUBMIT BUTTON
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: verifyOTP,
                  child: const Text(
                    "Submit",
                    style: TextStyle(fontSize: 18, color: Colors.white),
                  ),
                ),
              ),

              const SizedBox(height: 15),

              /// RETRY OTP TIMER
              Center(
                child: Text(
                  remainingTime > 0
                      ? "Didn’t receive it? Retry in 00:$remainingTime"
                      : "Resend OTP",
                  style: const TextStyle(fontSize: 15),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
