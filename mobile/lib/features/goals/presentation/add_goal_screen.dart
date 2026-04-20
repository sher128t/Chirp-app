import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../models/goal.dart';
import '../providers/goals_provider.dart';

class AddGoalScreen extends ConsumerStatefulWidget {
  const AddGoalScreen({super.key});

  @override
  ConsumerState<AddGoalScreen> createState() => _AddGoalScreenState();
}

class _AddGoalScreenState extends ConsumerState<AddGoalScreen> {
  final _titleController = TextEditingController();
  SelfCareAreaInfo? _selectedArea;
  bool _isLoading = false;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _saveGoal() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a goal title')),
      );
      return;
    }

    if (_selectedArea == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a self-care area')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ref.read(goalsProvider.notifier).addGoal(
            title: _titleController.text.trim(),
            selfCareArea: _selectedArea!.value,
          );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Goal created! 🎯'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to create goal: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Goal'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _saveGoal,
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
            // Title input
            const Text(
              'What do you want to achieve?',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _titleController,
              autofocus: true,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                hintText: 'e.g., Exercise for 30 minutes',
              ),
            ),

            const SizedBox(height: 32),

            // Self-care area selection
            const Text(
              'Self-care area',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: selfCareAreas.map((area) {
                final isSelected = _selectedArea == area;
                final color = Color(area.colorValue);

                return GestureDetector(
                  onTap: () => setState(() => _selectedArea = area),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? color.withOpacity(0.2) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? color : Colors.grey.shade200,
                        width: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          area.emoji,
                          style: const TextStyle(fontSize: 20),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          area.label,
                          style: TextStyle(
                            fontWeight:
                                isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? color : Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 32),

            // Suggestions
            const Text(
              'Quick suggestions',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppTheme.textSecondaryLight,
              ),
            ),
            const SizedBox(height: 12),
            
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _SuggestionChip(
                  title: 'Drink 8 glasses of water',
                  area: selfCareAreas.firstWhere((a) => a.value == 'NUTRITION'),
                  onTap: () {
                    _titleController.text = 'Drink 8 glasses of water';
                    setState(() {
                      _selectedArea = selfCareAreas.firstWhere((a) => a.value == 'NUTRITION');
                    });
                  },
                ),
                _SuggestionChip(
                  title: 'Sleep 8 hours',
                  area: selfCareAreas.firstWhere((a) => a.value == 'SLEEP'),
                  onTap: () {
                    _titleController.text = 'Sleep 8 hours';
                    setState(() {
                      _selectedArea = selfCareAreas.firstWhere((a) => a.value == 'SLEEP');
                    });
                  },
                ),
                _SuggestionChip(
                  title: 'Meditate for 10 minutes',
                  area: selfCareAreas.firstWhere((a) => a.value == 'MIND'),
                  onTap: () {
                    _titleController.text = 'Meditate for 10 minutes';
                    setState(() {
                      _selectedArea = selfCareAreas.firstWhere((a) => a.value == 'MIND');
                    });
                  },
                ),
                _SuggestionChip(
                  title: 'Take a walk',
                  area: selfCareAreas.firstWhere((a) => a.value == 'BODY'),
                  onTap: () {
                    _titleController.text = 'Take a walk';
                    setState(() {
                      _selectedArea = selfCareAreas.firstWhere((a) => a.value == 'BODY');
                    });
                  },
                ),
                _SuggestionChip(
                  title: 'Call a friend',
                  area: selfCareAreas.firstWhere((a) => a.value == 'SOCIAL'),
                  onTap: () {
                    _titleController.text = 'Call a friend';
                    setState(() {
                      _selectedArea = selfCareAreas.firstWhere((a) => a.value == 'SOCIAL');
                    });
                  },
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Save button
            ElevatedButton(
              onPressed: _isLoading ? null : _saveGoal,
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Create Goal'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SuggestionChip extends StatelessWidget {
  final String title;
  final SelfCareAreaInfo area;
  final VoidCallback onTap;

  const _SuggestionChip({
    required this.title,
    required this.area,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = Color(area.colorValue);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(area.emoji, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 4),
            Text(
              title,
              style: TextStyle(
                fontSize: 13,
                color: color,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

