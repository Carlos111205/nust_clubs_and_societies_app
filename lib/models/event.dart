class ClubEvent {
  final String id;
  final String clubId;
  final String title;
  final String date;
  final String time;
  final String location;
  final String description;

  ClubEvent({
    required this.id,
    required this.clubId,
    required this.title,
    required this.date,
    required this.time,
    required this.location,
    required this.description,
  });

  factory ClubEvent.fromJson(Map<String, dynamic> json) {
    String dt = json['date_time'] ?? '';
    String dateStr = '';
    String timeStr = '';
    if (dt.isNotEmpty) {
      try {
        DateTime parsed = DateTime.parse(dt);
        List<String> months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateStr = '${months[parsed.month - 1]} ${parsed.day}';
        int displayHour = parsed.hour % 12;
        if (displayHour == 0) displayHour = 12;
        String hour = displayHour.toString().padLeft(2, '0');
        String minute = parsed.minute.toString().padLeft(2, '0');
        String ampm = parsed.hour >= 12 ? 'PM' : 'AM';
        timeStr = '$hour:$minute $ampm';
      } catch (e) {
        // ignore
      }
    }

    return ClubEvent(
      id: json['id'],
      clubId: json['club_id'],
      title: json['title'] ?? '',
      date: dateStr,
      time: timeStr,
      location: json['location'] ?? '',
      description: json['description'] ?? '',
    );
  }
}
