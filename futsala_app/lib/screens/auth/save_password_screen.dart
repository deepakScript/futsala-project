import 'package:flutter/material.dart';
import 'package:futsala_app/core/router/router_extension.dart';

class SavePasswordScreen extends StatefulWidget {
  const SavePasswordScreen({super.key});

  @override
  State<SavePasswordScreen> createState() => _SavePasswordScreenState();
}

class _SavePasswordScreenState extends State<SavePasswordScreen> {
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  final TextEditingController newPassController = TextEditingController();
  final TextEditingController confirmPassController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          "Save Password",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        ),
        elevation: 0,
      ),

      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Verify with OTP to change your password sent to your email.",
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
            ),

            const SizedBox(height: 40),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  context.goToLogin();
                },
                child: const Text(
                  "Save Password",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPasswordField({
    required String label,
    required TextEditingController controller,
    required bool obscureText,
    required VoidCallback toggle,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 15),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.vpn_key, color: Colors.green),
          suffixIcon: IconButton(
            icon: Icon(
              obscureText ? Icons.visibility_off : Icons.visibility,
              color: Colors.green,
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
