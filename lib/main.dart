import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'theme/app_theme.dart';
import 'screens/explore_screen.dart';
import 'screens/my_clubs_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/login_screen.dart';
import 'providers/auth_provider.dart';

void main() {
  runApp(const ProviderScope(child: NUSTClubsApp()));
}

class NUSTClubsApp extends ConsumerWidget {
  const NUSTClubsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'NUST Clubs & Societies',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      // Authentication Flow
      home: authState.isAuthenticated
          ? const MainNavigationScreen()
          : const LoginScreen(),
    );
  }
}

class MainNavigationScreen extends ConsumerStatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  ConsumerState<MainNavigationScreen> createState() =>
      _MainNavigationScreenState();
}

class _MainNavigationScreenState extends ConsumerState<MainNavigationScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const ExploreScreen(),
    const MyClubsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _screens),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          backgroundColor: Colors.white,
          selectedItemColor: AppTheme.primaryColor,
          unselectedItemColor: Colors.grey.shade400,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.compass),
              activeIcon: Icon(
                LucideIcons.compass,
                color: AppTheme.primaryColor,
              ),
              label: 'Explore',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.star),
              activeIcon: Icon(LucideIcons.star, color: AppTheme.primaryColor),
              label: 'My Clubs',
            ),
            BottomNavigationBarItem(
              icon: Icon(LucideIcons.user),
              activeIcon: Icon(LucideIcons.user, color: AppTheme.primaryColor),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
