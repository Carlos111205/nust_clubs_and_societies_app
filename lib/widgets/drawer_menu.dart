import 'package:flutter/material.dart';

class DrawerMenu extends StatelessWidget {
  const DrawerMenu({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          SizedBox(height: 50),
          _item(Icons.person, "Profile"),
          _item(Icons.explore, "Discover"),
          _item(Icons.subscriptions, "Subscriptions"),
          _item(Icons.shopping_cart, "Shop"),
          _item(Icons.settings, "Settings"),
          Spacer(),
          _item(Icons.logout, "Logout"),
          SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _item(IconData icon, String title) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () {},
    );
  }
}