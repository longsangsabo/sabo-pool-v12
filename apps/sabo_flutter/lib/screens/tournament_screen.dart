import 'package:flutter/material.dart';

class TournamentScreen extends StatefulWidget {
  const TournamentScreen({super.key});

  @override
  State<TournamentScreen> createState() => _TournamentScreenState();
}

class _TournamentScreenState extends State<TournamentScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Mock tournament data
    final mockTournaments = [
      {
        'id': '1',
        'name': 'Spring Pool Championship',
        'description': 'Annual spring tournament for all skill levels',
        'status': 'upcoming',
        'maxParticipants': 32,
        'currentParticipants': 18,
        'entryFee': 50.0,
        'prizePool': 1000.0,
        'venue': 'Central Pool Hall',
        'startTime': DateTime.now().add(const Duration(days: 7)),
      },
      {
        'id': '2',
        'name': 'Weekly 9-Ball Tournament',
        'description': 'Fast-paced 9-ball action every Friday',
        'status': 'ongoing',
        'maxParticipants': 16,
        'currentParticipants': 16,
        'entryFee': 25.0,
        'prizePool': 300.0,
        'venue': 'Downtown Billiards',
        'startTime': DateTime.now().subtract(const Duration(hours: 2)),
      },
      {
        'id': '3',
        'name': 'Beginner\'s 8-Ball Cup',
        'description': 'Perfect for newcomers to competitive pool',
        'status': 'upcoming',
        'maxParticipants': 24,
        'currentParticipants': 8,
        'entryFee': 20.0,
        'prizePool': 400.0,
        'venue': 'Rookie\'s Pool Lounge',
        'startTime': DateTime.now().add(const Duration(days: 3)),
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tournaments'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text('Tournament Search - Coming Soon!')),
              );
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Upcoming'),
            Tab(text: 'Live'),
            Tab(text: 'My Tournaments'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // All Tournaments
          _buildTournamentList(mockTournaments),

          // Upcoming Tournaments
          _buildTournamentList(
            mockTournaments.where((t) => t['status'] == 'upcoming').toList(),
          ),

          // Live Tournaments
          _buildTournamentList(
            mockTournaments.where((t) => t['status'] == 'ongoing').toList(),
          ),

          // My Tournaments
          _buildEmptyState('You haven\'t joined any tournaments yet!'),
        ],
      ),
    );
  }

  Widget _buildTournamentList(List<Map<String, dynamic>> tournaments) {
    if (tournaments.isEmpty) {
      return _buildEmptyState('No tournaments found');
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: tournaments.length,
      itemBuilder: (context, index) {
        final tournament = tournaments[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: TournamentCard(tournament: tournament),
        );
      },
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.emoji_events_outlined,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}

class TournamentCard extends StatelessWidget {
  final Map<String, dynamic> tournament;

  const TournamentCard({super.key, required this.tournament});

  @override
  Widget build(BuildContext context) {
    final status = tournament['status'] as String;
    final isLive = status == 'ongoing';

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                  'Tournament Details: ${tournament['name']} - Coming Soon!'),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Row
              Row(
                children: [
                  Expanded(
                    child: Text(
                      tournament['name'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  _buildStatusChip(status),
                ],
              ),

              const SizedBox(height: 8),

              // Description
              Text(
                tournament['description'] as String,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),

              const SizedBox(height: 12),

              // Tournament Info
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.people,
                      label: 'Participants',
                      value:
                          '${tournament['currentParticipants']}/${tournament['maxParticipants']}',
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.attach_money,
                      label: 'Entry Fee',
                      value: '\$${tournament['entryFee'].toStringAsFixed(0)}',
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.emoji_events,
                      label: 'Prize Pool',
                      value: '\$${tournament['prizePool'].toStringAsFixed(0)}',
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            '${isLive ? 'Watching' : 'Joining'} ${tournament['name']}!'),
                        backgroundColor: isLive ? Colors.red : Colors.green,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isLive ? Colors.red : Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(isLive ? 'Watch Live' : 'Join Tournament'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;

    switch (status) {
      case 'upcoming':
        color = Colors.orange;
        text = 'Upcoming';
        break;
      case 'ongoing':
        color = Colors.red;
        text = 'Live';
        break;
      case 'completed':
        color = Colors.green;
        text = 'Completed';
        break;
      default:
        color = Colors.grey;
        text = 'Unknown';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Icon(icon, size: 20, color: Colors.blue),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}
