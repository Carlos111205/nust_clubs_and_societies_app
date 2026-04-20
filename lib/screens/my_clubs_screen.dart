import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/clubs_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/club_card.dart';
import 'club_detail_screen.dart';

class MyClubsScreen extends ConsumerWidget {
  const MyClubsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final joinedClubs = ref.watch(joinedClubsProvider);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text(
          'My Clubs',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryColor,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.moreVertical, color: AppTheme.primaryColor),
            onPressed: () {},
          ),
        ],
      ),
      body: joinedClubs.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    alignment: Alignment.center,
                    child: Icon(
                      LucideIcons.star,
                      size: 50,
                      color: Colors.grey.shade300,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'No clubs joined yet',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Explore and join some clubs to see\nthem here!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: joinedClubs.length,
              itemBuilder: (context, index) {
                final club = joinedClubs[index];
                return ClubCard(
                  club: club,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ClubDetailScreen(club: club),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
