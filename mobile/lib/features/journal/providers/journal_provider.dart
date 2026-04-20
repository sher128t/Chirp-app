import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../pet/providers/pet_provider.dart';
import '../models/journal_entry.dart';

// Journal entries provider
final journalProvider = StateNotifierProvider<JournalNotifier, AsyncValue<List<JournalEntry>>>((ref) {
  return JournalNotifier(ref);
});

class JournalNotifier extends StateNotifier<AsyncValue<List<JournalEntry>>> {
  final Ref _ref;

  JournalNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchEntries();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> fetchEntries() async {
    state = const AsyncValue.loading();

    try {
      final data = await _apiClient.get<List<dynamic>>('/journal');
      final entries = data.map((e) => JournalEntry.fromJson(e)).toList();
      state = AsyncValue.data(entries);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> createEntry({
    String? title,
    required String content,
    List<String>? tags,
  }) async {
    try {
      await _apiClient.post<Map<String, dynamic>>(
        '/journal',
        data: {
          if (title != null && title.isNotEmpty) 'title': title,
          'content': content,
          'tags': tags ?? [],
        },
      );
      await fetchEntries();
      _ref.read(petProvider.notifier).refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateEntry(String id, {
    String? title,
    String? content,
    List<String>? tags,
  }) async {
    try {
      await _apiClient.patch<Map<String, dynamic>>(
        '/journal/$id',
        data: {
          if (title != null) 'title': title,
          if (content != null) 'content': content,
          if (tags != null) 'tags': tags,
        },
      );
      await fetchEntries();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteEntry(String id) async {
    try {
      await _apiClient.delete<Map<String, dynamic>>('/journal/$id');
      await fetchEntries();
    } catch (e) {
      rethrow;
    }
  }
}

