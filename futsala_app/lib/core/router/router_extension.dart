// ==================== routes/route_extensions.dart ====================
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'app_router.dart';

/// Extension methods for easier navigation
extension NavigationExtensions on BuildContext {
  // Navigate to splash
  void goToSplash() => go(AppRoutes.splash);

  // Navigate to login
  void goToLogin() => go(AppRoutes.login);
  //navigate to forgot-password
  void goToForgotPassword() => go(AppRoutes.forgotPassword);

  //navigate to emailotpverification
  void goToEmailOTPVerification(String email) {
    goNamed(AppRoutes.otpVerificationName, pathParameters: {'email': email});
  }

  //navigate to saved password
  void goToSavePassword() => go(AppRoutes.savePassword);
  // Navigate to register
  void goToRegister() => go(AppRoutes.register);

  // Navigate to home
  void goToHome() => go(AppRoutes.home);

  //main app routes
  void goToFutsal() => go(AppRoutes.futsal);
  void goToFavourites() => go(AppRoutes.favourites);
  void goToBooking() => go(AppRoutes.booking);
  void goToProfile() => go(AppRoutes.profile);

  // Push navigation (adds to stack)
  void pushToLogin() => push(AppRoutes.login);
  void pushToRegister() => push(AppRoutes.register);
  void pushToHome() => push(AppRoutes.home);

  // Named navigation (alternative method)
  void goToLoginNamed() => goNamed(AppRoutes.loginName);
  void goToRegisterNamed() => goNamed(AppRoutes.registerName);
  void goToHomeNamed() => goNamed(AppRoutes.homeName);

  void gotToFutsalNamed() => goNamed(AppRoutes.futsalName);
  void goToFavouritesNamed() => goNamed(AppRoutes.favouriteName);
  void goToBookingNamed() => goNamed(AppRoutes.bookingName);
  void goToProfileNamed() => goNamed(AppRoutes.profileName);
}
