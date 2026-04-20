import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../pet/providers/pet_provider.dart';

// Shop items provider
final shopCatalogProvider = FutureProvider<List<ShopItem>>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final data = await apiClient.get<List<dynamic>>('/shop/catalog');
  return data.map((e) => ShopItem.fromJson(e)).toList();
});

class ShopItem {
  final String id;
  final String itemId;
  final String code;
  final String name;
  final String? description;
  final String type;
  final String slot;
  final String rarity;
  final String currency;
  final int price;
  final bool premiumOnly;
  final bool canPurchase;
  final bool owned;
  final bool featured;
  final Map<String, dynamic>? metadata;

  ShopItem({
    required this.id,
    required this.itemId,
    required this.code,
    required this.name,
    this.description,
    required this.type,
    required this.slot,
    required this.rarity,
    required this.currency,
    required this.price,
    required this.premiumOnly,
    required this.canPurchase,
    required this.owned,
    required this.featured,
    this.metadata,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    final priceData = json['price'] as Map<String, dynamic>;
    return ShopItem(
      id: json['id'],
      itemId: json['itemId'],
      code: json['code'],
      name: json['name'],
      description: json['description'],
      type: json['type'],
      slot: json['slot'],
      rarity: json['rarity'],
      currency: priceData['currency'],
      price: priceData['amount'],
      premiumOnly: json['premiumOnly'] ?? false,
      canPurchase: json['canPurchase'] ?? true,
      owned: json['owned'] ?? false,
      featured: json['featured'] ?? false,
      metadata: json['metadata'],
    );
  }
}

class ShopScreen extends ConsumerWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalogAsync = ref.watch(shopCatalogProvider);
    final walletAsync = ref.watch(walletProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: walletAsync.when(
              data: (wallet) => Row(
                children: [
                  Text('🪙 ${wallet.coins}'),
                  const SizedBox(width: 12),
                  Text('💎 ${wallet.gems}'),
                ],
              ),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(shopCatalogProvider);
          ref.invalidate(walletProvider);
        },
        child: catalogAsync.when(
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('No items available'));
            }

            // Group by type
            final backgrounds = items.where((i) => i.type == 'BACKGROUND').toList();
            final accessories = items.where((i) => i.type != 'BACKGROUND').toList();

            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (backgrounds.isNotEmpty) ...[
                  const Text(
                    'Backgrounds',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: backgrounds.length,
                    itemBuilder: (context, index) {
                      return _ShopItemCard(item: backgrounds[index]);
                    },
                  ),
                  const SizedBox(height: 24),
                ],
                if (accessories.isNotEmpty) ...[
                  const Text(
                    'Accessories',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    itemCount: accessories.length,
                    itemBuilder: (context, index) {
                      return _ShopItemCard(item: accessories[index]);
                    },
                  ),
                ],
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48),
                const SizedBox(height: 8),
                Text('Failed to load shop: $error'),
                TextButton(
                  onPressed: () => ref.invalidate(shopCatalogProvider),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ShopItemCard extends ConsumerWidget {
  final ShopItem item;

  const _ShopItemCard({required this.item});

  Color _getRarityColor(String rarity) {
    switch (rarity) {
      case 'COMMON':
        return Colors.grey;
      case 'UNCOMMON':
        return Colors.green;
      case 'RARE':
        return Colors.blue;
      case 'EPIC':
        return Colors.purple;
      case 'LEGENDARY':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rarityColor = _getRarityColor(item.rarity);

    return GestureDetector(
      onTap: item.owned || !item.canPurchase ? null : () => _showPurchaseDialog(context, ref),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: item.featured
              ? Border.all(color: AppTheme.moodAmazing, width: 2)
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
          children: [
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: _getBackgroundColor(),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: Center(
                  child: item.owned
                      ? const Icon(Icons.check_circle, color: AppTheme.success, size: 32)
                      : Text(
                          _getItemEmoji(),
                          style: const TextStyle(fontSize: 40),
                        ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                children: [
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: rarityColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      if (item.owned)
                        const Text(
                          'Owned',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.success,
                            fontWeight: FontWeight.w500,
                          ),
                        )
                      else
                        Text(
                          '${item.currency == 'coins' ? '🪙' : '💎'} ${item.price}',
                          style: const TextStyle(fontSize: 12),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getBackgroundColor() {
    if (item.metadata != null && item.metadata!['gradient'] != null) {
      final colors = item.metadata!['gradient'] as List;
      if (colors.isNotEmpty) {
        return _hexToColor(colors[0]);
      }
    }
    return Colors.grey.shade100;
  }

  Color _hexToColor(String hex) {
    hex = hex.replaceFirst('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  String _getItemEmoji() {
    if (item.metadata != null && item.metadata!['emoji'] != null) {
      return item.metadata!['emoji'];
    }
    switch (item.type) {
      case 'BACKGROUND':
        return '🖼️';
      case 'FRAME':
        return '🪟';
      default:
        return '✨';
    }
  }

  void _showPurchaseDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Buy ${item.name}?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(item.description ?? 'A nice item for your pet!'),
            const SizedBox(height: 16),
            Text(
              '${item.currency == 'coins' ? '🪙' : '💎'} ${item.price}',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                final apiClient = ref.read(apiClientProvider);
                await apiClient.post('/shop/purchase', data: {'shopItemId': item.id});
                ref.invalidate(shopCatalogProvider);
                ref.invalidate(walletProvider);
                ref.read(petProvider.notifier).refresh();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Purchased ${item.name}! 🎉'),
                      backgroundColor: AppTheme.success,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to purchase: $e')),
                  );
                }
              }
            },
            child: const Text('Buy'),
          ),
        ],
      ),
    );
  }
}

