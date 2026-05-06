import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/club.dart';
import '../models/event.dart';

final clubsProvider = FutureProvider<List<Club>>((ref) async {
  // Commenting out Supabase query to bypass permission errors
  // final data = await Supabase.instance.client.from('clubs').select();
  // return data.map((json) => Club.fromJson(json)).toList();

  return [
    Club(
      id: '1',
      name: 'NUST Tech Wizards',
      category: 'Technology',
      description: 'For all programming and tech enthusiasts.',
      logoEmoji: '💻',
      memberCount: 120,
      leaderName: 'John Doe',
      leaderTitle: 'President',
      isFeatured: true,
    ),
    Club(
      id: '2',
      name: 'Campus Rovers FC',
      category: 'Sports',
      description: 'The official soccer club on campus.',
      logoEmoji: '⚽',
      memberCount: 45,
      leaderName: 'Mike Smith',
      leaderTitle: 'Captain',
      isFeatured: true,
    ),
    Club(
      id: '3',
      name: 'Art Society',
      category: 'Arts',
      description: 'Expressing creativity through drawing and painting.',
      logoEmoji: '🎨',
      memberCount: 80,
      leaderName: 'Jane Doe',
      leaderTitle: 'President',
      isFeatured: false,
    ),
  ];
});

final eventsProvider = FutureProvider<List<ClubEvent>>((ref) async {
  // Commenting out Supabase query to bypass permission errors
  // final data = await Supabase.instance.client.from('events').select();
  // return data.map((json) => ClubEvent.fromJson(json)).toList();

  return [
    ClubEvent(
      id: '101',
      clubId: '1',
      title: 'Hackathon 2026',
      date: 'Aug 15',
      time: '09:00 AM',
      location: 'Computer Science Lab',
      description: 'Annual 24-hour hackathon.',
    ),
    ClubEvent(
      id: '102',
      clubId: '2',
      title: 'Inter-Faculty Tournament',
      date: 'Aug 20',
      time: '02:00 PM',
      location: 'Main Stadium',
      description: 'Annual soccer tournament.',
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

final filteredClubsProvider = Provider<AsyncValue<List<Club>>>((ref) {
  final clubsAsync = ref.watch(clubsProvider);
  final searchQuery = ref.watch(searchProvider).toLowerCase();
  final categoryFilter = ref.watch(categoryFilterProvider);

  return clubsAsync.whenData((clubs) {
    return clubs.where((club) {
      final matchesSearch = club.name.toLowerCase().contains(searchQuery);
      final matchesCategory = categoryFilter == 'All' || club.category == categoryFilter;
      return matchesSearch && matchesCategory;
    }).toList();
  });
});

final joinedClubsProvider = Provider<AsyncValue<List<Club>>>((ref) {
  final clubsAsync = ref.watch(clubsProvider);
  final memberships = ref.watch(membershipProvider);
  
  return clubsAsync.whenData((clubs) {
    return clubs.where((club) => memberships.contains(club.id)).toList();
  });
});
