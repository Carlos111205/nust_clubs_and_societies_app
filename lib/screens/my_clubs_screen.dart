import 'package:flutter/material.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F5B43),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const HeaderSection(),

              const SizedBox(height: 20),

              const Text(
                "Communities Nearby",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),

              const SizedBox(height: 10),

              const CategorySection(title: "Food"),

              const SizedBox(height: 20),

              const CategorySection(title: "Health and wellness"),

              const Spacer(),

              const BottomButtons(),
            ],
          ),
        ),
<<<<<<< Updated upstream
=======
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.moreVertical, color: AppTheme.primaryColor),
            onPressed: () {},
            hoverColor: AppTheme.primaryColor.withOpacity(0.1),
          ),
        ],
>>>>>>> Stashed changes
      ),
    );
  }
}
class HeaderSection extends StatelessWidget {
  const HeaderSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Expanded(
          child: Text(
            "Nearby Communities based on your location",
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ),
        IconButton(
          onPressed: () {},
          icon: const Icon(Icons.location_on, color: Colors.white),
        ),
      ],
    );
  }
}
class CategorySection extends StatelessWidget {
  final String title;

  const CategorySection({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),

        const SizedBox(height: 10),

        SizedBox(
          height: 140,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: const [
              CommunityCard(
                image: "assets/food1.jpg",
                title: "Cooking Lovers",
              ),
              SizedBox(width: 10),
              CommunityCard(
                image: "assets/food2.jpg",
                title: "Yummy Recipes",
              ),
            ],
          ),
        ),
      ],
    );
  }
}
class CommunityCard extends StatelessWidget {
  final String image;
  final String title;

  const CommunityCard({
    super.key,
    required this.image,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 110,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            image: DecorationImage(
              image: AssetImage(image),
              fit: BoxFit.cover,
            ),
          ),
        ),

        Positioned(
          bottom: 10,
          left: 10,
          child: Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),

        const Positioned(
          top: 8,
          right: 8,
          child: CircleAvatar(
            radius: 10,
            backgroundColor: Colors.green,
            child: Icon(Icons.check, size: 14, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
class BottomButtons extends StatelessWidget {
  const BottomButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.orange,
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () {},
            child: const Text("Next (3/3)"),
          ),
        ),

        const SizedBox(height: 10),

        OutlinedButton(
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Colors.orange),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: () {},
          child: const Text(
            "Create Community",
            style: TextStyle(color: Colors.orange),
          ),
        ),
      ],
    );
  }
}