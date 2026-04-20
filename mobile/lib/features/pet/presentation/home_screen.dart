import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/pet_provider.dart';
import '../widgets/pet_display.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/stats_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final petAsync = ref.watch(petProvider);
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.read(petProvider.notifier).refresh();
            ref.invalidate(walletProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header with wallet
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Home',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    walletAsync.when(
                      data: (wallet) => Row(
                        children: [
                          _CurrencyChip(
                            icon: '🪙',
                            amount: wallet.coins,
                            onTap: () => context.push(AppRoutes.shop),
                          ),
                          const SizedBox(width: 8),
                          _CurrencyChip(
                            icon: '💎',
                            amount: wallet.gems,
                            onTap: () => context.push(AppRoutes.shop),
                          ),
                        ],
                      ),
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Pet display
                petAsync.when(
                  data: (pet) => PetDisplay(pet: pet),
                  loading: () => const SizedBox(
                    height: 300,
                    child: Center(child: CircularProgressIndicator()),
                  ),
                  error: (error, _) => SizedBox(
                    height: 300,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 48),
                          const SizedBox(height: 8),
                          Text('Failed to load pet: $error'),
                          TextButton(
                            onPressed: () => ref.read(petProvider.notifier).refresh(),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Stats
                petAsync.when(
                  data: (pet) => StatsCard(pet: pet),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
                const SizedBox(height: 24),

                // Quick actions
                Text(
                  'Quick Actions',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 12),
                
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    QuickActionCard(
                      icon: Icons.mood,
                      label: 'Log Mood',
                      color: AppTheme.moodGood,
                      onTap: () => context.push(AppRoutes.addMood),
                    ),
                    QuickActionCard(
                      icon: Icons.check_circle,
                      label: 'Goals',
                      color: AppTheme.primaryColor,
                      onTap: () => context.go(AppRoutes.goals),
                    ),
                    QuickActionCard(
                      icon: Icons.book,
                      label: 'Journal',
                      color: AppTheme.secondaryColor,
                      onTap: () => context.push(AppRoutes.journal),
                    ),
                    QuickActionCard(
                      icon: Icons.shopping_bag,
                      label: 'Shop',
                      color: AppTheme.accentColor,
                      onTap: () => context.push(AppRoutes.shop),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CurrencyChip extends StatelessWidget {
  final String icon;
  final int amount;
  final VoidCallback onTap;

  const _CurrencyChip({
    required this.icon,
    required this.amount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 16)),
            const SizedBox(width: 4),
            Text(
              '$amount',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

