import 'package:flutter/material.dart';

class RecentActivities extends StatelessWidget {
  const RecentActivities({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock data for now - will be replaced with real data
    final activities = [
      {
        'icon': Icons.emoji_events,
        'title': 'Welcome to SABO Pool Arena!',
        'subtitle': 'Start your pool journey today',
        'time': 'Just now',
        'color': Colors.green,
      },
      {
        'icon': Icons.star,
        'title': 'Complete your profile',
        'subtitle': 'Add your details to get started',
        'time': '1 min ago',
        'color': Colors.blue,
      },
      {
        'icon': Icons.business,
        'title': 'Find your first club',
        'subtitle': 'Discover nearby pool clubs',
        'time': '2 min ago',
        'color': Colors.purple,
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          ...activities.map((activity) => _buildActivityItem(
            icon: activity['icon'] as IconData,
            title: activity['title'] as String,
            subtitle: activity['subtitle'] as String,
            time: activity['time'] as String,
            color: activity['color'] as Color,
          )),
          
          // View All Button
          Container(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Activity History - Coming Soon!')),
                  );
                },
                child: const Text('View All Activities'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String time,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Colors.grey, width: 0.2),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }
}
