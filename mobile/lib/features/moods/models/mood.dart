class MoodEntry {
  final String id;
  final int moodScore;
  final String moodLabel;
  final List<String> tags;
  final String? notes;
  final DateTime createdAt;

  MoodEntry({
    required this.id,
    required this.moodScore,
    required this.moodLabel,
    required this.tags,
    this.notes,
    required this.createdAt,
  });

  factory MoodEntry.fromJson(Map<String, dynamic> json) {
    return MoodEntry(
      id: json['id'],
      moodScore: json['moodScore'],
      moodLabel: json['moodLabel'],
      tags: (json['tags'] as List?)?.cast<String>() ?? [],
      notes: json['notes'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'moodScore': moodScore,
      'moodLabel': moodLabel,
      'tags': tags,
      if (notes != null) 'notes': notes,
    };
  }
}

// Predefined mood options
class MoodOption {
  final int score;
  final String label;
  final String emoji;

  const MoodOption({
    required this.score,
    required this.label,
    required this.emoji,
  });
}

const List<MoodOption> moodOptions = [
  MoodOption(score: 5, label: 'Amazing', emoji: '🥰'),
  MoodOption(score: 4, label: 'Good', emoji: '😊'),
  MoodOption(score: 3, label: 'Okay', emoji: '😐'),
  MoodOption(score: 2, label: 'Down', emoji: '😔'),
  MoodOption(score: 1, label: 'Struggling', emoji: '😢'),
];

// Predefined tags
const List<String> predefinedMoodTags = [
  'Work',
  'School',
  'Friends',
  'Family',
  'Exercise',
  'Outdoors',
  'Alone time',
  'Creative',
  'Stressed',
  'Relaxed',
  'Tired',
  'Energized',
];

