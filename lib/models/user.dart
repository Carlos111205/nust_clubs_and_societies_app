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

  factory AppUser.fromMap(Map<String, dynamic> map) {
    return AppUser(
      studentId: map['studentId'],
      fullName: map['fullName'],
      department: map['department'],
      year: map['year'],
      profileImageUrl: map['profileImageUrl'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'studentId': studentId,
      'fullName': fullName,
      'department': department,
      'year': year,
      'profileImageUrl': profileImageUrl,
    };
  }
}
