import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../models/mood.dart';
import '../providers/mood_provider.dart';

class AddMoodScreen extends ConsumerStatefulWidget {
  const AddMoodScreen({super.key});

  @override
  ConsumerState<AddMoodScreen> createState() => _AddMoodScreenState();
}

class _AddMoodScreenState extends ConsumerState<AddMoodScreen> {
  MoodOption? _selectedMood;
  final Set<String> _selectedTags = {};
  final _customTagController = TextEditingController();
  final _notesController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _customTagController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _saveMood() async {
    if (_selectedMood == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select how you\'re feeling')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(moodsProvider.notifier).addMood(
            moodScore: _selectedMood!.score,
            moodLabel: _selectedMood!.label,
            tags: _selectedTags.toList(),
            notes: _notesController.text.trim(),
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Mood logged! +5 XP 🎉'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save mood: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _addCustomTag() {
    final tag = _customTagController.text.trim();
    if (tag.isNotEmpty && !_selectedTags.contains(tag)) {
      setState(() {
        _selectedTags.add(tag);
        _customTagController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('How are you feeling?'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveMood,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Save'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Mood selection
            const Text(
              'Select your mood',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: moodOptions.map((mood) {
                final isSelected = _selectedMood == mood;
                return GestureDetector(
                  onTap: () => setState(() => _selectedMood = mood),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? _getMoodColor(mood.score).withOpacity(0.2)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? _getMoodColor(mood.score)
                            : Colors.grey.shade200,
                        width: 2,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: _getMoodColor(mood.score).withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      children: [
                        Text(
                          mood.emoji,
                          style: const TextStyle(fontSize: 32),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          mood.label,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected
                                ? _getMoodColor(mood.score)
                                : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 32),

            // Tags
            const Text(
              'What\'s on your mind? (optional)',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ...predefinedMoodTags.map((tag) {
                  final isSelected = _selectedTags.contains(tag);
                  return FilterChip(
                    label: Text(tag),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedTags.add(tag);
                        } else {
                          _selectedTags.remove(tag);
                        }
                      });
                    },
                    selectedColor: AppTheme.primaryColor.withOpacity(0.2),
                    checkmarkColor: AppTheme.primaryColor,
                  );
                }),
                // Custom tags
                ..._selectedTags
                    .where((tag) => !predefinedMoodTags.contains(tag))
                    .map((tag) {
                  return Chip(
                    label: Text(tag),
                    deleteIcon: const Icon(Icons.close, size: 16),
                    onDeleted: () {
                      setState(() => _selectedTags.remove(tag));
                    },
                    backgroundColor: AppTheme.secondaryColor.withOpacity(0.2),
                  );
                }),
              ],
            ),

            const SizedBox(height: 12),

            // Custom tag input
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _customTagController,
                    decoration: const InputDecoration(
                      hintText: 'Add custom tag...',
                      isDense: true,
                    ),
                    onSubmitted: (_) => _addCustomTag(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: _addCustomTag,
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Notes
            const Text(
              'Notes (optional)',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            TextField(
              controller: _notesController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: 'Write about how you\'re feeling...',
              ),
            ),

            const SizedBox(height: 32),

            // Save button
            ElevatedButton(
              onPressed: _isLoading ? null : _saveMood,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Save Mood'),
            ),
          ],
        ),
      ),
    );
  }

  Color _getMoodColor(int score) {
    switch (score) {
      case 5:
        return AppTheme.moodAmazing;
      case 4:
        return AppTheme.moodGood;
      case 3:
        return AppTheme.moodOkay;
      case 2:
        return AppTheme.moodDown;
      case 1:
        return AppTheme.moodStruggling;
      default:
        return Colors.grey;
    }
  }
}

