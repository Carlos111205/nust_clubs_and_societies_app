import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/club.dart';
import '../models/event.dart';

final clubsProvider = Provider<List<Club>>((ref) {
  return [
    Club(
      id: '1',
      name: 'NUST Tech Nexus',
      category: 'Technology',
      description: 'The hub for all things tech at NUST. We focus on software development, AI, and cybersecurity.',
      logoEmoji: '💻',
      memberCount: 312,
      leaderName: 'Tafara Mukucha',
      leaderTitle: 'President',
      isFeatured: true,
    ),
    Club(
      id: '2',
      name: 'Creative Arts Society',
      category: 'Arts',
      description: 'Unleash your creativity! We host workshops on painting, digital art, and photography.',
      logoEmoji: '🎨',
      memberCount: 148,
      leaderName: 'Sarah Moyo',
      leaderTitle: 'Chairperson',
      isNew: true,
      isFeatured: true,
    ),
    Club(
      id: '3',
      name: 'Robotics & AI Club',
      category: 'Technology',
      description: 'Building the future, one robot at a time. Join us for hands-on robotics and machine learning projects.',
      logoEmoji: '🤖',
      memberCount: 89,
      leaderName: 'John Dube',
      leaderTitle: 'Technical Lead',
    ),
    Club(
      id: '4',
      name: 'NUST Sports Federation',
      category: 'Sports',
      description: 'Promoting health and teamwork through competitive and recreational sports.',
      logoEmoji: '⚽',
      memberCount: 490,
      leaderName: 'Mike Phiri',
      leaderTitle: 'Sports Captain',
    ),
    Club(
      id: '5',
      name: 'Entrepreneurship Hub',
      category: 'Business',
      description: 'Fostering the next generation of business leaders and innovators.',
      logoEmoji: '🚀',
      memberCount: 175,
      leaderName: 'Elena Sibanda',
      leaderTitle: 'Hub Coordinator',
    ),
    Club(
      id: '6',
      name: 'Environment & Green Club',
      category: 'Science',
      description: 'Dedicated to sustainability and environmental awareness on campus.',
      logoEmoji: '🌿',
      memberCount: 96,
      leaderName: 'Dr. Green',
      leaderTitle: 'Faculty Advisor',
    ),
    Club(
      id: '7',
      name: 'NUST Drama Guild',
      category: 'Arts',
      description: 'A place for actors, directors, and playwrights to shine.',
      logoEmoji: '🎭',
      memberCount: 62,
      leaderName: 'Grace Nyoni',
      leaderTitle: 'Artistic Director',
    ),
    Club(
      id: '8',
      name: 'Ndebele Cultural Society',
      category: 'Culture',
      description: 'Celebrating and preserving the rich Ndebele heritage through traditional dance and music.',
      logoEmoji: '🪘',
      memberCount: 210,
      leaderName: 'Bhekinkosi Moyo',
      leaderTitle: 'Cultural Representative',
    ),
  ];
});

final eventsProvider = Provider<List<ClubEvent>>((ref) {
  return [
    ClubEvent(
      id: 'e1',
      clubId: '1',
      title: 'Hackathon 2024',
      date: 'May 15',
      time: '09:00 AM',
      location: 'Main Hall',
      description: '24-hour coding challenge to solve local problems.',
    ),
    ClubEvent(
      id: 'e2',
      clubId: '2',
      title: 'Art Exhibition',
      date: 'June 2',
      time: '02:00 PM',
      location: 'Library Gallery',
      description: 'Showcasing the best student art from the semester.',
    ),
    ClubEvent(
      id: 'e3',
      clubId: '1',
      title: 'AI Workshop',
      date: 'May 20',
      time: '11:00 AM',
      location: 'CS Lab 1',
      description: 'Introduction to neural networks and PyTorch.',
    ),
  ];
});

class MembershipNotifier extends StateNotifier<Set<String>> {
  MembershipNotifier() : super({});

  void toggleMembership(String clubId) {
    if (state.contains(clubId)) {
      state = {...state}..remove(clubId);
    } else {
      state = {...state, clubId};
    }
  }

  bool isMember(String clubId) => state.contains(clubId);
}

final membershipProvider = StateNotifierProvider<MembershipNotifier, Set<String>>((ref) {
  return MembershipNotifier();
});

final searchProvider = StateProvider<String>((ref) => '');
final categoryFilterProvider = StateProvider<String>((ref) => 'All');

final filteredClubsProvider = Provider<List<Club>>((ref) {
  final clubs = ref.watch(clubsProvider);
  final searchQuery = ref.watch(searchProvider).toLowerCase();
  final categoryFilter = ref.watch(categoryFilterProvider);

  return clubs.where((club) {
    final matchesSearch = club.name.toLowerCase().contains(searchQuery);
    final matchesCategory = categoryFilter == 'All' || club.category == categoryFilter;
    return matchesSearch && matchesCategory;
  }).toList();
});

final joinedClubsProvider = Provider<List<Club>>((ref) {
  final clubs = ref.watch(clubsProvider);
  final memberships = ref.watch(membershipProvider);
  return clubs.where((club) => memberships.contains(club.id)).toList();
});
