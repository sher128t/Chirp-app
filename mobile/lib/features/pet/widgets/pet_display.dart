import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';
import '../models/pet.dart';

class PetDisplay extends StatelessWidget {
  final Pet pet;

  const PetDisplay({super.key, required this.pet});

  @override
  Widget build(BuildContext context) {
    // Get background gradient from equipped item or use default
    final bgGradient = pet.backgroundGradient;
    final gradient = bgGradient != null
        ? LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: bgGradient.map((c) => _hexToColor(c)).toList(),
          )
        : const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF90EE90), Color(0xFF98FB98)],
          );

    // Get frame color from equipped item
    final frameColor = pet.frameColor != null
        ? _hexToColor(pet.frameColor!)
        : Colors.transparent;

    // Get hat emoji from equipped item
    final hatEmoji = pet.hatEmoji;

    return Container(
      height: 300,
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(24),
        border: frameColor != Colors.transparent
            ? Border.all(color: frameColor, width: 4)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Pet name badge at top
          Positioned(
            top: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    pet.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Lv.${pet.level}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Hat accessory (if equipped)
          if (hatEmoji != null)
            Positioned(
              top: 80,
              child: Text(
                hatEmoji,
                style: const TextStyle(fontSize: 32),
              ),
            ),

          // Main pet bird
          const Text(
            '🐦',
            style: TextStyle(fontSize: 100),
          ),

          // XP progress bar at bottom
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'XP',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700],
                      ),
                    ),
                    Text(
                      '${pet.xp} / ${pet.xpToNextLevel}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: pet.xpProgress,
                    backgroundColor: Colors.white.withOpacity(0.5),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppTheme.primaryColor,
                    ),
                    minHeight: 8,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _hexToColor(String hex) {
    hex = hex.replaceFirst('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex';
    }
    return Color(int.parse(hex, radix: 16));
  }
}

