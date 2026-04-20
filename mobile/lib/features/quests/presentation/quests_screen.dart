import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../pet/providers/pet_provider.dart';
import '../models/quest.dart';
import '../providers/quests_provider.dart';

class QuestsScreen extends ConsumerWidget {
  const QuestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final questsAsync = ref.watch(questsProvider);
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.read(questsProvider.notifier).fetchQuests();
            ref.invalidate(streaksProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Quests & Rewards',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          walletAsync.when(
                            data: (wallet) => Row(
                              children: [
                                Text('🪙 ${wallet.coins}'),
                                const SizedBox(width: 8),
                                Text('💎 ${wallet.gems}'),
                              ],
                            ),
                            loading: () => const SizedBox.shrink(),
                            error: (_, __) => const SizedBox.shrink(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Complete quests to earn rewards',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),

              // Streaks section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _StreaksSection(),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 24)),

              // Daily quests title
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    "Today's Quests",
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 12)),

              // Quests list
              questsAsync.when(
                data: (quests) {
                  if (quests.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Center(
                          child: Text('No quests available today'),
                        ),
                      ),
                    );
                  }

                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final quest = quests[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 6,
                          ),
                          child: _QuestCard(quest: quest),
                        );
                      },
                      childCount: quests.length,
                    ),
                  );
                },
                loading: () => const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  ),
                ),
                error: (error, _) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        const Icon(Icons.error_outline, size: 48),
                        const SizedBox(height: 8),
                        Text('Failed to load quests: $error'),
                        TextButton(
                          onPressed: () =>
                              ref.read(questsProvider.notifier).fetchQuests(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StreaksSection extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final streaksAsync = ref.watch(streaksProvider);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Text('🔥', style: TextStyle(fontSize: 20)),
              SizedBox(width: 8),
              Text(
                'Streaks',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          streaksAsync.when(
            data: (streaks) {
              if (streaks.isEmpty) {
                return const Text('Start completing activities to build streaks!');
              }

              final activeStreaks = streaks.where((s) => s.currentStreakDays > 0).toList();
              if (activeStreaks.isEmpty) {
                return const Text('No active streaks. Keep going!');
              }

              return Wrap(
                spacing: 12,
                runSpacing: 8,
                children: activeStreaks.map((streak) {
                  return _StreakChip(streak: streak);
                }).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const Text('Unable to load streaks'),
          ),
        ],
      ),
    );
  }
}

class _StreakChip extends StatelessWidget {
  final Streak streak;

  const _StreakChip({required this.streak});

  String _getAreaEmoji(String area) {
    switch (area) {
      case 'MIND':
        return '🧠';
      case 'BODY':
        return '💪';
      case 'SOCIAL':
        return '👥';
      case 'SLEEP':
        return '😴';
      case 'NUTRITION':
        return '🥗';
      case 'CREATIVITY':
        return '🎨';
      case 'PRODUCTIVITY':
        return '📝';
      default:
        return '⭐';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: AppTheme.warmGradient,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(_getAreaEmoji(streak.selfCareArea)),
          const SizedBox(width: 6),
          Text(
            '${streak.currentStreakDays} days',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }
}

class _QuestCard extends ConsumerWidget {
  final Quest quest;

  const _QuestCard({required this.quest});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isCompleted = quest.isCompleted || quest.isClaimed;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: isCompleted
            ? Border.all(color: AppTheme.success, width: 2)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quest.title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        decoration: quest.isClaimed
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                    ),
                    if (quest.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        quest.description!,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (quest.isClaimed)
                const Icon(Icons.check_circle, color: AppTheme.success)
              else if (quest.canClaim)
                ElevatedButton(
                  onPressed: () async {
                    try {
                      final result = await ref.read(questsProvider.notifier).claimQuest(quest.id);
                      if (context.mounted) {
                        final rewards = result['rewards'] as Map<String, dynamic>?;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              'Claimed! +${rewards?['xp'] ?? 0} XP, +${rewards?['coins'] ?? 0} coins 🎉',
                            ),
                            backgroundColor: AppTheme.success,
                          ),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Failed to claim: $e')),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.success,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  child: const Text('Claim'),
                ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bar
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: quest.progressPercent.clamp(0.0, 1.0),
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      isCompleted ? AppTheme.success : AppTheme.primaryColor,
                    ),
                    minHeight: 6,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '${quest.currentProgress}/${quest.requiredCount}',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Rewards
          Wrap(
            spacing: 8,
            children: [
              if (quest.xpReward > 0)
                _RewardChip(icon: '⭐', value: quest.xpReward, label: 'XP'),
              if (quest.coinsReward > 0)
                _RewardChip(icon: '🪙', value: quest.coinsReward, label: 'coins'),
              if (quest.gemsReward > 0)
                _RewardChip(icon: '💎', value: quest.gemsReward, label: 'gems'),
            ],
          ),
        ],
      ),
    );
  }
}

class _RewardChip extends StatelessWidget {
  final String icon;
  final int value;
  final String label;

  const _RewardChip({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.moodAmazing.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(icon, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 4),
          Text(
            '+$value',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

