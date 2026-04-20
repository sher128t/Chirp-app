import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../models/pet.dart';

// Pet state provider
final petProvider = StateNotifierProvider<PetNotifier, AsyncValue<Pet>>((ref) {
  return PetNotifier(ref);
});

// Wallet provider
final walletProvider = FutureProvider<Wallet>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final data = await apiClient.get<Map<String, dynamic>>('/wallet');
  return Wallet.fromJson(data);
});

class PetNotifier extends StateNotifier<AsyncValue<Pet>> {
  final Ref _ref;

  PetNotifier(this._ref) : super(const AsyncValue.loading()) {
    fetchPet();
  }

  ApiClient get _apiClient => _ref.read(apiClientProvider);

  Future<void> fetchPet() async {
    state = const AsyncValue.loading();
    
    try {
      final data = await _apiClient.get<Map<String, dynamic>>('/pet');
      state = AsyncValue.data(Pet.fromJson(data));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> updatePet({String? name, String? pronouns}) async {
    try {
      final data = await _apiClient.patch<Map<String, dynamic>>(
        '/pet',
        data: {
          if (name != null) 'name': name,
          if (pronouns != null) 'pronouns': pronouns,
        },
      );
      
      // Refetch full pet data
      await fetchPet();
    } catch (e) {
      rethrow;
    }
  }

  void refresh() {
    fetchPet();
  }
}

class Wallet {
  final int coins;
  final int gems;

  Wallet({
    required this.coins,
    required this.gems,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      coins: json['coins'] ?? 0,
      gems: json['gems'] ?? 0,
    );
  }
}

