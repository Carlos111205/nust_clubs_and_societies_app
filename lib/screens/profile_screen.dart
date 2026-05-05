import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Profile"),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Column(
        children: [
          SizedBox(height: 20),

          CircleAvatar(
            radius: 40,
            backgroundImage: NetworkImage("https://i.pravatar.cc/150?img=3"),
          ),

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