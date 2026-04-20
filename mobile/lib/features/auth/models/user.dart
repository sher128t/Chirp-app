class User {
  final String id;
  final String email;
  final String timezone;
  final String locale;
  final DateTime createdAt;
  final DateTime? lastLoginAt;
  final UserSettings? settings;
  final Subscription? subscription;

  User({
    required this.id,
    required this.email,
    required this.timezone,
    required this.locale,
    required this.createdAt,
    this.lastLoginAt,
    this.settings,
    this.subscription,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      timezone: json['timezone'] ?? 'UTC',
      locale: json['locale'] ?? 'en',
      createdAt: DateTime.parse(json['createdAt']),
      lastLoginAt: json['lastLoginAt'] != null
          ? DateTime.parse(json['lastLoginAt'])
          : null,
      settings: json['settings'] != null
          ? UserSettings.fromJson(json['settings'])
          : null,
      subscription: json['subscription'] != null
          ? Subscription.fromJson(json['subscription'])
          : null,
    );
  }

  bool get isPremium => subscription?.tier == 'PREMIUM';
}

class UserSettings {
  final bool notificationsEnabled;
  final bool marketingOptIn;
  final bool darkMode;

  UserSettings({
    required this.notificationsEnabled,
    required this.marketingOptIn,
    required this.darkMode,
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      notificationsEnabled: json['notificationsEnabled'] ?? true,
      marketingOptIn: json['marketingOptIn'] ?? false,
      darkMode: json['darkMode'] ?? false,
    );
  }
}

class Subscription {
  final String tier;
  final DateTime? expiresAt;

  Subscription({
    required this.tier,
    this.expiresAt,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      tier: json['tier'] ?? 'FREE',
      expiresAt: json['expiresAt'] != null
          ? DateTime.parse(json['expiresAt'])
          : null,
    );
  }

  bool get isPremium => tier == 'PREMIUM';
}

