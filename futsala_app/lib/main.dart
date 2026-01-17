import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'package:futsala_app/provider/futsal_provider.dart';
import 'package:provider/provider.dart';
import 'package:futsala_app/core/router/app_router.dart';
import 'package:futsala_app/provider/auth_provider.dart';
import 'package:futsala_app/provider/booking_provider.dart';
import 'package:futsala_app/provider/payment_provider.dart';
import 'package:futsala_app/provider/favorite_provider.dart';
import 'package:futsala_app/provider/review_provider.dart'; // Added ReviewProvider import

import 'package:futsala_app/core/services/token_service.dart';
import 'package:futsala_app/data/models/user_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Check for existing token and user
  final token = await AuthStorage.getToken();
  final user = await AuthStorage.getUser();

  runApp(MyApp(token: token, user: user));
}

class MyApp extends StatelessWidget {
  final String? token;
  final UserModel? user;

  const MyApp({super.key, this.token, this.user});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) =>
              AuthProvider(initialUser: user, initialToken: token)..initAuth(),
        ),
        ChangeNotifierProvider(create: (_) => FutsalProvider()),
        ChangeNotifierProvider(create: (_) => BookingProvider()),
        ChangeNotifierProvider(create: (_) => PaymentProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(
          create: (_) => ReviewProvider(),
        ), // Added ReviewProvider
        // Add other providers here
      ],
      child: Builder(
        builder: (context) {
          // Create router with access to providers and initial state
          final bool isLoggedIn = token != null;
          final router = AppRoutes.createRouter(context, isLoggedIn);

          return MaterialApp.router(
            title: 'Futsala',
            theme: ThemeData(
              primarySwatch: Colors.blue,
              useMaterial3: true,
            ),
            routerConfig: router,
            debugShowCheckedModeBanner: false,
            supportedLocales: const [Locale('en', 'US'), Locale('ne', 'NP')],
            localizationsDelegates: const [
              // KhaltiLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
          );
        },
      ),
    );
  }
}
