import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../pet/providers/pet_provider.dart';
import '../models/quest.dart';

// Quests provider
final questsProvider = StateNotifierProvider<QuestsNotifier, AsyncValue<List<Quest>>>((ref) {
  return QuestsNotifier(ref);
});

// Streaks provider
final streaksProvider = FutureProvider<List<Streak>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final data = await apiClient.get<List<dynamic>>('/streaks');
  return data.map((e) => Streak.fromJson(e)).toList();
});

class QuestsNotifier extends StateNotifier<AsyncValue<List<Quest>>> {
  final Ref _ref;

  QuestsNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchQuests();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> fetchQuests() async {
    state = const AsyncValue.loading();

    try {
      final data = await _apiClient.get<List<dynamic>>('/quests/today');
      final quests = data.map((e) => Quest.fromJson(e)).toList();
      state = AsyncValue.data(quests);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<Map<String, dynamic>> claimQuest(String questId) async {
    try {
      final result = await _apiClient.post<Map<String, dynamic>>('/quests/$questId/claim');
      await fetchQuests();
      _ref.read(petProvider.notifier).refresh();
      _ref.invalidate(walletProvider);
      return result;
    } catch (e) {
      rethrow;
    }
  }
}

