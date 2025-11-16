import 'package:flutter/material.dart';
import 'package:futsala_app/screens/auth/login_screen.dart';
import 'package:futsala_app/widgets/custom_button.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // --- Top Texts ---
              Column(
                children: [
                  SizedBox(height: size.height * 0.08),
                  Text(
                    "GEAR UP\nA BIG GAME",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: size.width * 0.09,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF00C37A),
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Have Fun with Friends!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: size.width * 0.045,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),

              // --- Illustration Placeholder (Space) ---
              SizedBox(height: size.height * 0.4),

              // --- Bottom Button ---
              Padding(
                padding: const EdgeInsets.only(bottom: 24),
                child: CustomButton(
                  text: "Get Started",
                  onPressed: () {
                    Navigator.push(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            const LoginScreen(),
                        transitionsBuilder:
                            (context, animation, secondaryAnimation, child) {
                              const begin = Offset(
                                1.0,
                                0.0,
                              ); // Slide from right
                              const end = Offset.zero;
                              const curve = Curves.easeInOut;

                              var tween = Tween(
                                begin: begin,
                                end: end,
                              ).chain(CurveTween(curve: curve));
                              var offsetAnimation = animation.drive(tween);

                              return SlideTransition(
                                position: offsetAnimation,
                                child: child,
                              );
                            },
                        transitionDuration: const Duration(milliseconds: 400),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
