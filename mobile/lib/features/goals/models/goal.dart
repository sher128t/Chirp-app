class Goal {
  final String id;
  final String title;
  final String selfCareArea;
  final String scheduleType;
  final bool completedToday;
  final DateTime createdAt;
  final DateTime? archivedAt;

  Goal({
    required this.id,
    required this.title,
    required this.selfCareArea,
    required this.scheduleType,
    required this.completedToday,
    required this.createdAt,
    this.archivedAt,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      id: json['id'],
      title: json['title'],
      selfCareArea: json['selfCareArea'] ?? 'MIND',
      scheduleType: json['scheduleType'] ?? 'DAILY',
      completedToday: json['completedToday'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      archivedAt: json['archivedAt'] != null
          ? DateTime.parse(json['archivedAt'])
          : null,
    );
  }
}

// Self-care areas with display info
class SelfCareAreaInfo {
  final String value;
  final String label;
  final String emoji;
  final int colorValue;

  const SelfCareAreaInfo({
    required this.value,
    required this.label,
    required this.emoji,
    required this.colorValue,
  });
}

const List<SelfCareAreaInfo> selfCareAreas = [
  SelfCareAreaInfo(value: 'MIND', label: 'Mind', emoji: '🧠', colorValue: 0xFF7B68EE),
  SelfCareAreaInfo(value: 'BODY', label: 'Body', emoji: '💪', colorValue: 0xFF6BCB77),
  SelfCareAreaInfo(value: 'SOCIAL', label: 'Social', emoji: '👥', colorValue: 0xFFFF9F7F),
  SelfCareAreaInfo(value: 'SLEEP', label: 'Sleep', emoji: '😴', colorValue: 0xFF5DADE2),
  SelfCareAreaInfo(value: 'NUTRITION', label: 'Nutrition', emoji: '🥗', colorValue: 0xFFFFD93D),
  SelfCareAreaInfo(value: 'CREATIVITY', label: 'Creative', emoji: '🎨', colorValue: 0xFFE066FF),
  SelfCareAreaInfo(value: 'PRODUCTIVITY', label: 'Productivity', emoji: '📝', colorValue: 0xFFFF6B6B),
];

SelfCareAreaInfo getSelfCareAreaInfo(String area) {
  return selfCareAreas.firstWhere(
    (a) => a.value == area,
    orElse: () => selfCareAreas[0],
  );
}

