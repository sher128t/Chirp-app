class Pet {
  final String id;
  final String name;
  final String pronouns;
  final int level;
  final int xp;
  final int xpToNextLevel;
  final int energy;
  final int happiness;
  final List<EquippedItem> equippedItems;
  final DateTime createdAt;
  final DateTime updatedAt;

  Pet({
    required this.id,
    required this.name,
    required this.pronouns,
    required this.level,
    required this.xp,
    required this.xpToNextLevel,
    required this.energy,
    required this.happiness,
    required this.equippedItems,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      id: json['id'],
      name: json['name'] ?? 'Pip',
      pronouns: json['pronouns'] ?? 'they/them',
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      xpToNextLevel: json['xpToNextLevel'] ?? 100,
      energy: json['energy'] ?? 50,
      happiness: json['happiness'] ?? 50,
      equippedItems: (json['equippedItems'] as List?)
              ?.map((e) => EquippedItem.fromJson(e))
              .toList() ??
          [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  double get xpProgress => xp / xpToNextLevel;

  // Get equipped item for a specific slot
  EquippedItem? getEquippedItem(String slot) {
    try {
      return equippedItems.firstWhere((item) => item.slot == slot);
    } catch (_) {
      return null;
    }
  }

  // Get background color from equipped background
  List<String>? get backgroundGradient {
    final bgItem = getEquippedItem('BACKGROUND');
    if (bgItem?.metadata != null) {
      final gradient = bgItem!.metadata!['gradient'];
      if (gradient is List) {
        return gradient.cast<String>();
      }
    }
    return null;
  }

  // Get frame color from equipped frame
  String? get frameColor {
    final frameItem = getEquippedItem('FRAME');
    return frameItem?.metadata?['borderColor'];
  }

  // Get hat emoji from equipped hat
  String? get hatEmoji {
    final hatItem = getEquippedItem('HAT');
    return hatItem?.metadata?['emoji'];
  }
}

class EquippedItem {
  final String id;
  final String code;
  final String name;
  final String type;
  final String slot;
  final Map<String, dynamic>? metadata;

  EquippedItem({
    required this.id,
    required this.code,
    required this.name,
    required this.type,
    required this.slot,
    this.metadata,
  });

  factory EquippedItem.fromJson(Map<String, dynamic> json) {
    return EquippedItem(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      type: json['type'],
      slot: json['slot'],
      metadata: json['metadata'],
    );
  }
}

