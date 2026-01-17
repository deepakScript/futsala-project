import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:futsala_app/core/router/router_extension.dart';
import 'package:futsala_app/provider/auth_provider.dart';
import 'package:futsala_app/widgets/message_helper.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:provider/provider.dart';

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
    otpController.dispose();
    super.dispose();
  }

  Future<void> verifyOTP() async {
    if (otpController.text.length != 6) {
      errorController!.add(ErrorAnimationType.shake);
      MessageHelper.showError(context, "Please enter a valid 6-digit OTP");
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.verifyOTP(
      email: widget.email,
      otp: otpController.text.trim(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      MessageHelper.showSuccess(context, result['message']);
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        context.goToSavePassword(widget.email);
      }
    } else {
      MessageHelper.showError(context, result['message']);
      errorController!.add(ErrorAnimationType.shake);
    }
  }

  Future<void> resendOTP() async {
    if (remainingTime > 0) return;

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.forgotPassword(email: widget.email);

    if (!mounted) return;

    if (result['success'] == true) {
      MessageHelper.showSuccess(context, "OTP resent successfully!");
      setState(() {
        remainingTime = 60;
        otpController.clear();
      });
    } else {
      MessageHelper.showError(context, result['message']);
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
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    "Forgot Password",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF00C37A),
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
                  activeColor: const Color(0xFF00C37A),
                  selectedColor: const Color(0xFF00C37A),
                  inactiveColor: Colors.grey,
                ),
                onChanged: (value) {},
              ),

              const SizedBox(height: 20),

              /// SUBMIT BUTTON
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C37A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: authProvider.isLoading ? null : verifyOTP,
                      child: authProvider.isLoading
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2.5,
                              ),
                            )
                          : const Text(
                              "Submit",
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  );
                },
              ),

              const SizedBox(height: 15),

              /// RETRY OTP TIMER
              Center(
                child: GestureDetector(
                  onTap: resendOTP,
                  child: Text(
                    remainingTime > 0
                        ? "Didn't receive it? Retry in 00:${remainingTime.toString().padLeft(2, '0')}"
                        : "Resend OTP",
                    style: TextStyle(
                      fontSize: 15,
                      color: remainingTime > 0
                          ? Colors.black
                          : const Color(0xFF00C37A),
                      fontWeight: remainingTime > 0
                          ? FontWeight.normal
                          : FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
