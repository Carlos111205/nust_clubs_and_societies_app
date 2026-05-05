class AppUser {
  final String studentId;
  final String fullName;
  final String department;
  final String year;
  final String? profileImageUrl;

  AppUser({
    required this.studentId,
    required this.fullName,
    required this.department,
    required this.year,
    this.profileImageUrl,
  });
}
