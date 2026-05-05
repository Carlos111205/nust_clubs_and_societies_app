import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/club.dart';
import '../models/event.dart';

final clubsProvider = FutureProvider<List<Club>>((ref) async {
  final data = await Supabase.instance.client.from('clubs').select();
  return data.map((json) => Club.fromJson(json)).toList();
});

final eventsProvider = FutureProvider<List<ClubEvent>>((ref) async {
  final data = await Supabase.instance.client.from('events').select();
  return data.map((json) => ClubEvent.fromJson(json)).toList();
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
