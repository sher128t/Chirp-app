class Quest {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String? selfCareArea;
  final Map<String, dynamic> requirements;
  final Map<String, dynamic> rewards;
  final String state;
  final Map<String, dynamic> progress;
  final DateTime? expiresAt;

  Quest({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.selfCareArea,
    required this.requirements,
    required this.rewards,
    required this.state,
    required this.progress,
    this.expiresAt,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'],
      title: json['title'],
      description: json['description'],
      type: json['type'] ?? 'DAILY',
      selfCareArea: json['selfCareArea'],
      requirements: json['requirements'] ?? {},
      rewards: json['rewards'] ?? {},
      state: json['state'] ?? 'ACTIVE',
      progress: json['progress'] ?? {},
      expiresAt: json['expiresAt'] != null ? DateTime.parse(json['expiresAt']) : null,
    );
  }

  bool get isCompleted => state == 'COMPLETED';
  bool get isClaimed => state == 'CLAIMED';
  bool get canClaim => isCompleted && !isClaimed;
  
  int get currentProgress => (progress['count'] ?? 0) as int;
  int get requiredCount => (requirements['count'] ?? 1) as int;
  double get progressPercent => currentProgress / requiredCount;

  int get xpReward => (rewards['xp'] ?? 0) as int;
  int get coinsReward => (rewards['coins'] ?? 0) as int;
  int get gemsReward => (rewards['gems'] ?? 0) as int;
}

class Streak {
  final String id;
  final String selfCareArea;
  final int currentStreakDays;
  final int longestStreakDays;
  final DateTime? lastActiveDate;

  Streak({
    required this.id,
    required this.selfCareArea,
    required this.currentStreakDays,
    required this.longestStreakDays,
    this.lastActiveDate,
  });

  factory Streak.fromJson(Map<String, dynamic> json) {
    return Streak(
      id: json['id'],
      selfCareArea: json['selfCareArea'],
      currentStreakDays: json['currentStreakDays'] ?? 0,
      longestStreakDays: json['longestStreakDays'] ?? 0,
      lastActiveDate: json['lastActiveDate'] != null 
          ? DateTime.parse(json['lastActiveDate']) 
          : null,
    );
  }
}

