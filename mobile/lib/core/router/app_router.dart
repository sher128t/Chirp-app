import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/goals/presentation/goals_screen.dart';
import '../../features/goals/presentation/add_goal_screen.dart';
import '../../features/journal/presentation/journal_screen.dart';
import '../../features/journal/presentation/journal_entry_screen.dart';
import '../../features/moods/presentation/mood_screen.dart';
import '../../features/moods/presentation/add_mood_screen.dart';
import '../../features/pet/presentation/home_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/quests/presentation/quests_screen.dart';
import '../../features/shop/presentation/shop_screen.dart';
import '../widgets/main_scaffold.dart';

// Route names
abstract class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const register = '/register';
  static const home = '/home';
  static const moods = '/moods';
  static const addMood = '/moods/add';
  static const goals = '/goals';
  static const addGoal = '/goals/add';
  static const journal = '/journal';
  static const journalEntry = '/journal/:id';
  static const journalNew = '/journal/new';
  static const quests = '/quests';
  static const shop = '/shop';
  static const profile = '/profile';
}

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull?.isAuthenticated ?? false;
      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.register;
      final isSplash = state.matchedLocation == AppRoutes.splash;

      // Loading state - stay on splash
      if (authState.isLoading && isSplash) {
        return null;
      }

      // Not logged in and not on auth route - go to login
      if (!isLoggedIn && !isAuthRoute) {
        return AppRoutes.login;
      }

      // Logged in and on auth route - go to home
      if (isLoggedIn && isAuthRoute) {
        return AppRoutes.home;
      }

      // Logged in and on splash - go to home
      if (isLoggedIn && isSplash) {
        return AppRoutes.home;
      }

      return null;
    },
    routes: [
      // Splash/Loading
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const _SplashScreen(),
      ),

      // Auth routes
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
      ),

      // Main app shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.moods,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: MoodScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.goals,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: GoalsScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.quests,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: QuestsScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // Full screen routes (outside shell)
      GoRoute(
        path: AppRoutes.addMood,
        builder: (context, state) => const AddMoodScreen(),
      ),
      GoRoute(
        path: AppRoutes.addGoal,
        builder: (context, state) => const AddGoalScreen(),
      ),
      GoRoute(
        path: AppRoutes.journal,
        builder: (context, state) => const JournalScreen(),
      ),
      GoRoute(
        path: AppRoutes.journalNew,
        builder: (context, state) => const JournalEntryScreen(),
      ),
      GoRoute(
        path: AppRoutes.journalEntry,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return JournalEntryScreen(entryId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.shop,
        builder: (context, state) => const ShopScreen(),
      ),
    ],
  );
});

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Pet emoji placeholder
            const Text(
              '🐦',
              style: TextStyle(fontSize: 80),
            ),
            const SizedBox(height: 24),
            Text(
              'Finch',
              style: Theme.of(context).textTheme.displayMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Self-Care Companion',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

