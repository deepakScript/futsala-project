// ==================== routes/app_routes.dart ====================
import 'package:flutter/material.dart';
import 'package:futsala_app/screens/auth/email_verification.dart';
import 'package:futsala_app/screens/auth/forgot_password_screen.dart';
import 'package:futsala_app/screens/auth/save_password_screen.dart';
import 'package:futsala_app/screens/bookings/booking_screen.dart';
import 'package:futsala_app/screens/bookings/booking_details_screen.dart';
import 'package:futsala_app/screens/bookings/my_booking_screen.dart';
import 'package:futsala_app/data/models/booking_model.dart';
import 'package:futsala_app/screens/favourites/favorite_screen.dart';
import 'package:futsala_app/screens/futsal/futsal_page.dart';
import 'package:futsala_app/screens/futsal_view/futsal_detail_screen.dart';
import 'package:futsala_app/screens/main/scaffold_with_nav_bar.dart';
import 'package:futsala_app/screens/profile/edit_profile_screen.dart';
import 'package:futsala_app/screens/profile/about_screen.dart';
import 'package:futsala_app/screens/profile/privacy_policy_screen.dart';
import 'package:futsala_app/screens/profile/profile_screen.dart';

import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:futsala_app/screens/splash/splash_screen.dart';
import 'package:futsala_app/screens/auth/login_screen.dart';
import 'package:futsala_app/screens/auth/register_screen.dart';
import 'package:futsala_app/screens/home/home_screen.dart';
import 'package:futsala_app/provider/auth_provider.dart';

class AppRoutes {
  // Private constructor to prevent instantiation
  AppRoutes._();

  // Root navigator key
  static final GlobalKey<NavigatorState> rootNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'root');

  static final GlobalKey<NavigatorState> shellNavigatorKey =
      GlobalKey<NavigatorState>(debugLabel: 'shell');

  // Route path constants
  static const String splash = '/splash';
  static const String login = '/login';
  static const String forgotPassword = '/forgot-password';
  static const String otpVerification = '/otpVerification';
  static const String savePassword = '/save-password';
  static const String register = '/register';
  static const String home = '/';
  static const String futsal = '/futsal';
  static const String futsalView = '/futsalView';
  static const String favourites = '/favorites';
  static const String booking = '/booking';
  static const String bookingDetails = '/booking-details';
  static const String futsalBooking = '/futsal-booking/:venueId';
  static const String profile = '/profile';
  static const String editProfile = 'edit';
  static const String privacyPolicy = 'privacy';
  static const String about = 'about';


  // Route name constants (for named navigation)
  static const String splashName = 'splash';
  static const String loginName = 'login';
  static const String forgotPasswordName = 'forgot-password';
  static const String otpVerificationName = 'otpVerification';
  static const String savePasswordName = 'save-password';
  static const String registerName = 'register';
  static const String homeName = 'home';
  static const String futsalName = 'futsal';
  static const String futsalViewName = 'futsalView';
  static const String favouriteName = 'favourite';
  static const String bookingName = 'booking';
  static const String bookingDetailsName = 'booking-details';
  static const String futsalBookingName = 'futsal-booking';
  static const String profileName = 'profile';
  static const String editProfileName = 'edit-profile';
  static const String privacyPolicyName = 'privacy-policy';
  static const String aboutName = 'about-futsala';


  // Create GoRouter instance
  static GoRouter createRouter(BuildContext context, bool isLoggedIn) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    return GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: isLoggedIn ? home : splash,
      refreshListenable: authProvider,
      debugLogDiagnostics: true, // Enable for debugging

      routes: _routes,
      redirect: (context, state) =>
          _handleRedirect(context, state, authProvider),
      errorBuilder: (context, state) => _errorBuilder(context, state),
    );
  }

  // Define all routes
  static final List<RouteBase> _routes = [
    GoRoute(
      path: splash,
      name: splashName,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: login,
      name: loginName,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: forgotPassword,
      name: forgotPasswordName,
      builder: (context, state) => ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '${AppRoutes.otpVerification}/:email',
      name: AppRoutes.otpVerificationName,
      builder: (context, state) {
        final email = state.pathParameters['email']!;
        return EmailOTPVerificationScreen(email: email);
      },
    ),
    GoRoute(
      path: '${AppRoutes.savePassword}/:email',
      name: savePasswordName,
      builder: (context, state) {
        final email = state.pathParameters['email']!;
        return SavePasswordScreen(email: email);
      },
    ),
    GoRoute(
      path: register,
      name: registerName,
      builder: (context, state) => const SignUpScreen(),
    ),
    GoRoute(
      path: '${AppRoutes.futsalView}/:venueId',
      name: AppRoutes.futsalViewName,
      builder: (context, state) {
        final venueId = state.pathParameters['venueId']!;
        return VenueDetailsPage(venueId: venueId);
      },
    ),
    GoRoute(
      path: futsalBooking,
      name: futsalBookingName,
      builder: (context, state) {
        final venueId = state.pathParameters['venueId']!;
        final venueName = state.uri.queryParameters['name'] ?? '';
        final venueLocation = state.uri.queryParameters['location'] ?? '';
        return BookingScreen(
          futsalId: venueId,
          venueName: venueName,
          venueLocation: venueLocation,
        );
      },
    ),

    GoRoute(
      path: '/booking-details',
      name: bookingDetailsName,
      parentNavigatorKey: rootNavigatorKey,
      builder: (context, state) {
        final booking = state.extra as Booking;
        return BookingDetailsScreen(booking: booking);
      },
    ),

    ShellRoute(
      builder: (context, state, child) {
        return ScaffoldWithNavBar(child: child);
      },
      routes: [
        GoRoute(
          path: home,
          name: homeName,
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: futsal,
          name: futsalName,
          builder: (context, state) => const FutsalPage(),
        ),
        GoRoute(
          path: favourites,
          name: favouriteName,
          builder: (context, state) => const FavoritesScreen(),
        ),
        GoRoute(
          path: booking,
          name: bookingName,
          builder: (context, state) => const MyBookingsScreen(),
        ),
        GoRoute(
          path: profile,
          name: profileName,
          builder: (context, state) => const ProfileScreen(),
          routes: [
            GoRoute(
              path: editProfile, // 'edit'
              name: editProfileName,
              parentNavigatorKey: rootNavigatorKey,
              builder: (context, state) => const EditProfileScreen(),
            ),
            GoRoute(
              path: privacyPolicy, // 'privacy'
              name: privacyPolicyName,
              parentNavigatorKey: rootNavigatorKey,
              builder: (context, state) => const PrivacyPolicyScreen(),
            ),
            GoRoute(
              path: about, // 'about'
              name: aboutName,
              parentNavigatorKey: rootNavigatorKey,
              builder: (context, state) => const AboutScreen(),
            ),
          ],
        ),
      ],
    ),
  ];

  // Handle redirects for authentication
  static String? _handleRedirect(
    BuildContext context,
    GoRouterState state,
    AuthProvider authProvider,
  ) {
    final isLoggedIn = authProvider.isAuthenticated;
    final currentPath = state.uri.path;

    // Allow splash screen to show
    if (currentPath == splash) {
      return null;
    }

    // Redirect to login if not authenticated and not on login/register/password reset flow
    if (!isLoggedIn &&
        currentPath != login &&
        currentPath != register &&
        !currentPath.startsWith(forgotPassword) &&
        !currentPath.startsWith(otpVerification) &&
        !currentPath.startsWith(savePassword)) {
      return login;
    }

    // Redirect to home if authenticated and trying to access auth screens
    if (isLoggedIn && (currentPath == login || currentPath == register)) {
      return home;
    }

    return null; // No redirect needed
  }

  // Error page builder
  static Widget _errorBuilder(BuildContext context, GoRouterState state) {
    return Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text(
              'Page Not Found',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              state.error?.toString() ?? 'Unknown error',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(splash),
              child: const Text('Go to Home'),
            ),
          ],
        ),
      ),
    );
  }
}
