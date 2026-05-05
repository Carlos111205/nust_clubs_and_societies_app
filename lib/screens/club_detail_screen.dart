import 'package:flutter/material.dart';

class ClubDetailsScreen extends StatefulWidget {
  const ClubDetailsScreen({super.key});

  @override
  State<ClubDetailsScreen> createState() => _ClubDetailsScreenState();
}

class _ClubDetailsScreenState extends State<ClubDetailsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Clubs/Teams"),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
        elevation: 0,
      ),

      body: Column(
        children: [
          _header(),
          _buttons(),
          _tabs(),
          Expanded(child: _tabViews()),
        ],
      ),
    );
  }

  // 🔥 HEADER (logo + name + stats)
  Widget _header() {
    return Column(
      children: [
        SizedBox(height: 10),

        CircleAvatar(
          radius: 35,
          backgroundColor: Colors.black,
          child: Text("R", style: TextStyle(color: Colors.white)),
        ),

        SizedBox(height: 10),

        Text(
          "Rotaract Club",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),

        SizedBox(height: 10),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _stat("82", "Members"),
            _stat("1650", "Followers"),
            _stat("25", "Events"),
          ],
        ),
      ],
    );
  }

  Widget _stat(String number, String label) {
    return Column(
      children: [
        Text(number,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, style: TextStyle(color: Colors.grey)),
      ],
    );
  }

  // 🔘 FOLLOW + JOIN BUTTONS
  Widget _buttons() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
              ),
              child: Text("Follow"),
            ),
          ),
          SizedBox(width: 10),
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              child: Text("Join team"),
            ),
          ),
        ],
      ),
    );
  }

  // 🧭 TABS
  Widget _tabs() {
    return TabBar(
      controller: _tabController,
      labelColor: Colors.black,
      tabs: [
        Tab(text: "About"),
        Tab(text: "Activities"),
        Tab(text: "Members"),
      ],
    );
  }

  // 📄 TAB CONTENT
  Widget _tabViews() {
    return TabBarView(
      controller: _tabController,
      children: [
        _aboutTab(),
        _activitiesTab(),
        _membersTab(),
      ],
    );
  }

  // 📘 ABOUT TAB
  Widget _aboutTab() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Text(
        "We are a community-driven club focused on leadership, volunteering, and making impact.",
      ),
    );
  }

  // 🎭 ACTIVITIES TAB (grid like your design)
  Widget _activitiesTab() {
    return GridView.count(
      crossAxisCount: 3,
      padding: EdgeInsets.all(8),
      crossAxisSpacing: 6,
      mainAxisSpacing: 6,
      children: List.generate(9, (index) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            image: DecorationImage(
              image: NetworkImage("https://picsum.photos/200?random=$index"),
              fit: BoxFit.cover,
            ),
          ),
        );
      }),
    );
  }

  // 👥 MEMBERS TAB
  Widget _membersTab() {
    return ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) {
        return ListTile(
          leading: CircleAvatar(
            backgroundImage:
                NetworkImage("https://i.pravatar.cc/150?img=$index"),
          ),
          title: Text("Member $index"),
          subtitle: Text("Role / Year"),
        );
      },
    );
  }
}