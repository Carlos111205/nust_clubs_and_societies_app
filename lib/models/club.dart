class Club {
  final String id;
  final String name;
  final String category;
  final String description;
  final String logoEmoji;
  final int memberCount;
  final String leaderName;
  final String leaderTitle;
  final List<String> galleryImages;
  final bool isFeatured;
  final bool isNew;

  Club({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.logoEmoji,
    required this.memberCount,
    required this.leaderName,
    required this.leaderTitle,
    this.galleryImages = const [],
    this.isFeatured = false,
    this.isNew = false,
  });

  factory Club.fromJson(Map<String, dynamic> json) {
    String category = json['category'] ?? 'Other';
    String logoEmoji = '🏢';
    if (json['image_url'] != null) {
      logoEmoji = json['image_url'];
    } else {
      switch (category.toLowerCase()) {
        case 'tech':
        case 'technology':
          logoEmoji = '💻';
          break;
        case 'sports':
          logoEmoji = '⚽';
          break;
        case 'arts':
          logoEmoji = '🎨';
          break;
        default:
          logoEmoji = '🏢';
      }
    }

    return Club(
      id: json['id'],
      name: json['name'] ?? '',
      category: category,
      description: json['description'] ?? '',
      logoEmoji: logoEmoji,
      memberCount: json['member_count'] ?? 0,
      leaderName: 'N/A',
      leaderTitle: 'Leader',
      isFeatured: json['is_featured'] ?? false,
    );
  }
}
