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
<<<<<<< Updated upstream
          ),
          SizedBox(width: 10),
          Expanded(
            child: OutlinedButton(
              onPressed: () {},
              child: Text("Join team"),
=======
            leading: IconButton(
              icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
              onPressed: () => Navigator.pop(context),
              hoverColor: Colors.white.withOpacity(0.2),
            ),
            actions: [
              IconButton(
                icon: const Icon(LucideIcons.moreVertical, color: Colors.white),
                onPressed: () {},
                hoverColor: Colors.white.withOpacity(0.2),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      StatCard(
                        icon: LucideIcons.users,
                        value: club.memberCount.toString(),
                        label: 'Members',
                      ),
                      StatCard(
                        icon: LucideIcons.calendar,
                        value: events.length.toString(),
                        label: 'Events',
                      ),
                      StatCard(
                        icon: LucideIcons.award,
                        value: '4.8',
                        label: 'Rating',
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    'About Club',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    club.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 30),
                  const Text(
                    'Leadership',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 25,
                          backgroundColor: Colors.blue.shade100,
                          child: Text(
                            club.leaderName[0],
                            style: TextStyle(
                              color: Colors.blue.shade700,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 15),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              club.leaderName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              club.leaderTitle,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 30),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Upcoming Events',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      if (events.isNotEmpty)
                        TextButton(
                          onPressed: () {},
                          style: TextButton.styleFrom(
                            overlayColor: Colors.orange.withOpacity(0.1),
                          ),
                          child: const Text(
                            'View all',
                            style: TextStyle(color: Colors.orange),
                          ),
                        ),
                    ],
                  ),
                  if (events.isEmpty)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(child: Text('No upcoming events')),
                    )
                  else
                    ...events.map((event) => EventTile(event: event)),
                  const SizedBox(height: 100),
                ],
              ),
>>>>>>> Stashed changes
            ),
          ),
        ],
      ),
<<<<<<< Updated upstream
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
=======
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
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
        child: ElevatedButton(
          onPressed: () {
            ref.read(membershipProvider.notifier).toggleMembership(club.id);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(isJoined ? 'Left ${club.name}' : 'Joined ${club.name}!'),
                duration: const Duration(seconds: 2),
                backgroundColor: isJoined ? Colors.redAccent : Colors.green,
                behavior: SnackBarBehavior.floating,
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: isJoined ? Colors.grey.shade200 : AppTheme.primaryColor,
            foregroundColor: isJoined ? Colors.black87 : Colors.white,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
            elevation: 0,
            overlayColor: isJoined ? Colors.black.withOpacity(0.1) : Colors.white.withOpacity(0.2),
          ),
          child: Text(
            isJoined ? 'Leave Club' : 'Join Club',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
>>>>>>> Stashed changes
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