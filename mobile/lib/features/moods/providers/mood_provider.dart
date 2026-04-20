import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../pet/providers/pet_provider.dart';
import '../models/mood.dart';

// Moods list provider
final moodsProvider = StateNotifierProvider<MoodsNotifier, AsyncValue<List<MoodEntry>>>((ref) {
  return MoodsNotifier(ref);
});

// Mood stats provider
final moodStatsProvider = FutureProvider.family<MoodStats, int>((ref, days) async {
  final apiClient = ref.watch(apiClientProvider);
  final data = await apiClient.get<Map<String, dynamic>>(
    '/moods/stats',
    queryParameters: {'days': days},
  );
  return MoodStats.fromJson(data);
});

class MoodsNotifier extends StateNotifier<AsyncValue<List<MoodEntry>>> {
  final Ref _ref;

  MoodsNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchMoods();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> fetchMoods() async {
    state = const AsyncValue.loading();

    try {
      final data = await _apiClient.get<List<dynamic>>('/moods');
      final moods = data.map((e) => MoodEntry.fromJson(e)).toList();
      state = AsyncValue.data(moods);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addMood({
    required int moodScore,
    required String moodLabel,
    List<String>? tags,
    String? notes,
  }) async {
    try {
      await _apiClient.post<Map<String, dynamic>>(
        '/moods',
        data: {
          'moodScore': moodScore,
          'moodLabel': moodLabel,
          'tags': tags ?? [],
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );

      // Refresh moods and pet (for XP/energy updates)
      await fetchMoods();
      _ref.read(petProvider.notifier).refresh();
    } catch (e) {
      rethrow;
    }
  }
}

class MoodStats {
  final int totalEntries;
  final double averageScore;
  final Map<String, int> moodDistribution;
  final String trend;

  MoodStats({
    required this.totalEntries,
    required this.averageScore,
    required this.moodDistribution,
    required this.trend,
  });

  factory MoodStats.fromJson(Map<String, dynamic> json) {
    return MoodStats(
      totalEntries: json['totalEntries'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      moodDistribution: Map<String, int>.from(json['moodDistribution'] ?? {}),
      trend: json['trend'] ?? 'stable',
    );
  }
}

