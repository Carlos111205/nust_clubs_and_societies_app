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
}
