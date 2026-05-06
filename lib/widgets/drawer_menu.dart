import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/profile_screen.dart';
import '../screens/my_clubs_screen.dart';

class DrawerMenu extends ConsumerWidget {
  const DrawerMenu({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Drawer(
      child: Column(
        children: [
          const SizedBox(height: 50),
          _item(context, Icons.person, "Profile", () {
            Navigator.pop(context);
            Navigator.push(context, MaterialPageRoute(builder: (_) => ProfileScreen()));
          }),
          _item(context, Icons.explore, "Discover", () {
            Navigator.pop(context);
          }),
          _item(context, Icons.subscriptions, "Communities", () {
            Navigator.pop(context);
            Navigator.push(context, MaterialPageRoute(builder: (_) => const CommunityScreen()));
          }),
          _item(context, Icons.shopping_cart, "Shop", () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Shop coming soon')));
          }),
          _item(context, Icons.settings, "Settings", () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Settings coming soon')));
          }),
          const Spacer(),
          _item(context, Icons.logout, "Logout", () {
            Navigator.pop(context);
            ref.read(authProvider.notifier).logout();
          }),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _item(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: onTap,
    );
  }
}