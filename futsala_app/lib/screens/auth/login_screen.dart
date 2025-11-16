import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:futsala_app/core/router/router_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:futsala_app/widgets/custom_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  void _validateAndLogin(BuildContext context) async {
    if (!_formKey.currentState!.validate()) return;

    const dummyEmail = "test@example.com";
    const dummyPassword = "123456";
    const dummyToken = "1234567";

    final enteredEmail = _emailController.text.trim();
    final enteredPassword = _passwordController.text;

    if (enteredEmail == dummyEmail && enteredPassword == dummyPassword) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("token", dummyToken);
      await prefs.setString("email", dummyEmail);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Login Successful!"),
          backgroundColor: Color(0xFF00C37A),
          duration: Duration(seconds: 1),
        ),
      );

      // Get router safely
      final router = GoRouter.of(context);

      // Wait for the snackbar duration, then navigate
      Future.delayed(const Duration(seconds: 1), () {
        context.goToHome();
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Invalid email or password"),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: size.height * 0.04),

                // Title
                Text(
                  "Login",
                  style: TextStyle(
                    color: const Color(0xFF00C37A),
                    fontSize: size.width * 0.1,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "Have Fun with Friends!",
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                SizedBox(height: size.height * 0.05),

                // Email field
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(
                      Icons.email_outlined,
                      color: Color(0xFF00C37A),
                    ),
                    hintText: "Email",
                    hintStyle: const TextStyle(color: Colors.grey),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: Color(0xFF00C37A),
                        width: 1.2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: Color(0xFF00C37A),
                        width: 1.5,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
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
                const SizedBox(height: 16),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(
                      Icons.lock_outline,
                      color: Color(0xFF00C37A),
                    ),
                    hintText: "Password",
                    hintStyle: const TextStyle(color: Colors.grey),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: Colors.grey,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: Color(0xFF00C37A),
                        width: 1.2,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                        color: Color(0xFF00C37A),
                        width: 1.5,
                      ),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "Please enter your password";
                    } else if (value.length < 6) {
                      return "Password must be at least 6 characters";
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 10),

                // Forgot password
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      "Forgot Password?",
                      style: TextStyle(
                        color: Color(0xFF00C37A),
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 8),

                // Login Button
                CustomButton(
                  text: "Login",
                  onPressed: () => _validateAndLogin(context),
                  width: double.infinity,
                  height: 55,
                ),

                const SizedBox(height: 20),

                // Sign Up link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    RichText(
                      text: TextSpan(
                        text: "Don't have an account?",
                        style: const TextStyle(color: Colors.black),
                        children: [
                          TextSpan(
                            text: "Sign Up",
                            style: const TextStyle(color: Colors.green),
                            recognizer: TapGestureRecognizer()
                              ..onTap = () {
                                context.go('/register');
                              },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 30),

                // Other sign-in options
                const Text(
                  "Other Ways to sign-in",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),

                const SizedBox(height: 24),

                // Social icons row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: () {
                        print("facebook Connected");
                      },
                      icon: FaIcon(FontAwesomeIcons.facebook),
                    ),
                    SizedBox(width: 24),
                    IconButton(
                      onPressed: () {
                        print("Google Connected");
                      },
                      icon: FaIcon(FontAwesomeIcons.google),
                    ),
                    SizedBox(width: 24),
                    IconButton(
                      onPressed: () {
                        print("apple Connected");
                      },
                      icon: FaIcon(FontAwesomeIcons.apple),
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
