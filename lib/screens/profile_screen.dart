import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
<<<<<<< Updated upstream
      appBar: AppBar(
        title: Text("Profile"),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
        elevation: 0,
=======
      backgroundColor: AppTheme.backgroundColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(20, 60, 20, 30),
              decoration: const BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppTheme.accentColor,
                    child: Text(
                      user.fullName
                          .split(' ')
                          .map((e) => e[0])
                          .take(2)
                          .join(''),
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    user.fullName,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    '${user.department} · ${user.year}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 25),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildStatItem('Clubs', joinedCount.toString()),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Account Settings',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildMenuTile(LucideIcons.user, 'Personal Information'),
                  _buildMenuTile(LucideIcons.bell, 'Notifications'),
                  _buildMenuTile(LucideIcons.shield, 'Security'),
                  const SizedBox(height: 25),
                  const Text(
                    'More',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildMenuTile(LucideIcons.helpCircle, 'Help & Support'),
                  _buildMenuTile(LucideIcons.info, 'About App'),
                  _buildMenuTile(
                    LucideIcons.logOut,
                    'Logout',
                    color: Colors.red,
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text('Logout'),
                          content: const Text(
                            'Are you sure you want to logout?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              style: TextButton.styleFrom(
                                overlayColor: Colors.grey.withOpacity(0.1),
                              ),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context);
                                ref.read(authProvider.notifier).logout();
                              },
                              style: TextButton.styleFrom(
                                overlayColor: Colors.red.withOpacity(0.1),
                              ),
                              child: const Text(
                                'Logout',
                                style: TextStyle(color: Colors.red),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
>>>>>>> Stashed changes
      ),
      body: Column(
        children: [
          SizedBox(height: 20),

          CircleAvatar(
            radius: 40,
            backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=3"),
          ),

<<<<<<< Updated upstream
          SizedBox(height: 10),
          Text("Jonathan Howard",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          Text("Traveller"),

          SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _stat("543", "Followers"),
              _stat("237", "Following"),
              _stat("673", "Likes"),
            ],
=======
  Widget _buildMenuTile(
    IconData icon,
    String title, {
    Color? color,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
>>>>>>> Stashed changes
          ),

          Expanded(
            child: ListView(
              children: [
                Image.network("https://picsum.photos/400/200"),
                Image.network("https://picsum.photos/400/201"),
              ],
            ),
          )
        ],
      ),
<<<<<<< Updated upstream
=======
      child: ListTile(
        leading: Icon(icon, color: color ?? AppTheme.primaryColor, size: 20),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: color ?? Colors.black87,
          ),
        ),
        trailing: Icon(
          LucideIcons.chevronRight,
          size: 16,
          color: Colors.grey.shade400,
        ),
        onTap: onTap ?? () {},
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        hoverColor: (color ?? AppTheme.primaryColor).withOpacity(0.1),
      ),
>>>>>>> Stashed changes
    );
  }

  Widget _stat(String num, String label) {
    return Column(
      children: [
        Text(num, style: TextStyle(fontWeight: FontWeight.bold)),
        Text(label),
      ],
    );
  }
}