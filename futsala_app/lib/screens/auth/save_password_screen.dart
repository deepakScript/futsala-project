import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:futsala_app/core/router/router_extension.dart';
import 'package:futsala_app/provider/auth_provider.dart';
import 'package:futsala_app/widgets/message_helper.dart';
import 'package:provider/provider.dart';

class SavePasswordScreen extends StatefulWidget {
  final String email;

  const SavePasswordScreen({super.key, required this.email});

  @override
  State<SavePasswordScreen> createState() => _SavePasswordScreenState();
}

class _SavePasswordScreenState extends State<SavePasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  final TextEditingController newPassController = TextEditingController();
  final TextEditingController confirmPassController = TextEditingController();

  @override
  void dispose() {
    newPassController.dispose();
    confirmPassController.dispose();
    super.dispose();
  }

  Future<void> handleSavePassword() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final result = await authProvider.savePassword(
      email: widget.email,
      newPassword: newPassController.text.trim(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      MessageHelper.showSuccess(context, result['message']);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        context.goToLogin();
      }
    } else {
      MessageHelper.showError(context, result['message']);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          "Save Password",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        ),
      ),

      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "Create a new password for your account.",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),

              const SizedBox(height: 30),

              // New Password
              _buildPasswordField(
                label: "New Password",
                controller: newPassController,
                obscureText: _obscureNew,
                toggle: () {
                  setState(() {
                    _obscureNew = !_obscureNew;
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Please enter a new password";
                  } else if (value.length < 6) {
                    return "Password must be at least 6 characters";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 20),

              // Confirm Password
              _buildPasswordField(
                label: "Confirm Password",
                controller: confirmPassController,
                obscureText: _obscureConfirm,
                toggle: () {
                  setState(() {
                    _obscureConfirm = !_obscureConfirm;
                  });
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return "Please confirm your password";
                  } else if (value != newPassController.text) {
                    return "Passwords do not match";
                  }
                  return null;
                },
              ),

              const SizedBox(height: 40),

              // Save button
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C37A),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: authProvider.isLoading
                          ? null
                          : handleSavePassword,
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
                              "Save Password",
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required String label,
    required TextEditingController controller,
    required bool obscureText,
    required VoidCallback toggle,
    String? Function(String?)? validator,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF00C37A)),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        validator: validator,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.vpn_key, color: Color(0xFF00C37A)),
          suffixIcon: IconButton(
            icon: Icon(
              obscureText ? Icons.visibility_off : Icons.visibility,
              color: const Color(0xFF00C37A),
            ),
            onPressed: toggle,
          ),
          hintText: label,
          border: InputBorder.none,
        ),
      ),
    );
  }
}
