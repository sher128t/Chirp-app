class JournalEntry {
  final String id;
  final String? title;
  final String content;
  final List<String> tags;
  final DateTime createdAt;
  final DateTime updatedAt;

  JournalEntry({
    required this.id,
    this.title,
    required this.content,
    required this.tags,
    required this.createdAt,
    required this.updatedAt,
  });

  factory JournalEntry.fromJson(Map<String, dynamic> json) {
    return JournalEntry(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      tags: (json['tags'] as List?)?.cast<String>() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}

