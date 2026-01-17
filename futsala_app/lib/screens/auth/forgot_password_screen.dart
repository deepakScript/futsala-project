import 'package:flutter/material.dart';
import 'package:futsala_app/core/router/router_extension.dart';
import 'package:futsala_app/provider/auth_provider.dart';
import 'package:futsala_app/widgets/message_helper.dart';
import 'package:provider/provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();

  @override
  void dispose() {
    emailController.dispose();
    super.dispose();
  }

  Future<void> handleForgotPassword() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.forgotPassword(
      email: emailController.text.trim(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      MessageHelper.showSuccess(context, result['message']);
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        context.goToEmailOTPVerification(emailController.text.trim());
      }
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
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                /// TIME + ICONS (OPTIONAL)
                const SizedBox(height: 50),

                /// TITLE
                const Text(
                  "Forgot Password",
                  style: TextStyle(
                    fontSize: 28,
                    color: Color(0xFF00C37A),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),

                /// SUBTITLE
                const Text(
                  "Enter your registered email address.\nWe will send a reset Token.",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 15, color: Colors.black54),
                ),
                const SizedBox(height: 35),

                /// EMAIL INPUT BOX
                Container(
                  height: 55,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF00C37A),
                      width: 1.4,
                    ),
                  ),
                  child: TextFormField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(
                        Icons.email_outlined,
                        color: Color(0xFF00C37A),
                      ),
                      hintText: "Enter Email",
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 16),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return "Please enter your email";
                      }
                      final emailRegex = RegExp(
                        r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                      );
                      if (!emailRegex.hasMatch(value)) {
                        return "Please enter a valid email address";
                      }
                      return null;
                    },
                  ),
                ),
                const SizedBox(height: 30),

                /// SEND BUTTON
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
                        onPressed: authProvider.isLoading
                            ? null
                            : handleForgotPassword,
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
                                "Send Reset Link",
                                style: TextStyle(
                                  fontSize: 18,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 20),

                /// BACK TO LOGIN
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Remember Password? "),
                    GestureDetector(
                      onTap: () {
                        context.goToLogin();
                      },
                      child: const Text(
                        "Login",
                        style: TextStyle(
                          color: Color(0xFF00C37A),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
