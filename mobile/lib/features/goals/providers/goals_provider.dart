import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../pet/providers/pet_provider.dart';
import '../models/goal.dart';

// Goals list provider
final goalsProvider = StateNotifierProvider<GoalsNotifier, AsyncValue<List<Goal>>>((ref) {
  return GoalsNotifier(ref);
});

class GoalsNotifier extends StateNotifier<AsyncValue<List<Goal>>> {
  final Ref _ref;

  GoalsNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchGoals();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> fetchGoals() async {
    state = const AsyncValue.loading();

    try {
      final data = await _apiClient.get<List<dynamic>>('/goals');
      final goals = data.map((e) => Goal.fromJson(e)).toList();
      state = AsyncValue.data(goals);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addGoal({
    required String title,
    required String selfCareArea,
  }) async {
    try {
      await _apiClient.post<Map<String, dynamic>>(
        '/goals',
        data: {
          'title': title,
          'selfCareArea': selfCareArea,
        },
      );
      await fetchGoals();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> completeGoal(String goalId) async {
    try {
      await _apiClient.post<Map<String, dynamic>>('/goals/$goalId/complete');
      await fetchGoals();
      // Refresh pet for XP updates
      _ref.read(petProvider.notifier).refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> uncompleteGoal(String goalId) async {
    try {
      await _apiClient.post<Map<String, dynamic>>('/goals/$goalId/uncomplete');
      await fetchGoals();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteGoal(String goalId) async {
    try {
      await _apiClient.delete<Map<String, dynamic>>('/goals/$goalId');
      await fetchGoals();
    } catch (e) {
      rethrow;
    }
  }
}

