import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/tournament_card.dart';

class TournamentListScreen extends ConsumerStatefulWidget {
  const TournamentListScreen({super.key});

  @override
  ConsumerState<TournamentListScreen> createState() => _TournamentListScreenState();
}

class _TournamentListScreenState extends ConsumerState<TournamentListScreen> with TickerProviderStateMixin {
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
    // Mock tournament data - will be replaced with real API data
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
        'registrationEnd': DateTime.now().add(const Duration(days: 5)),
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
        'registrationEnd': DateTime.now().subtract(const Duration(days: 1)),
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
        'registrationEnd': DateTime.now().add(const Duration(days: 2)),
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
                const SnackBar(content: Text('Tournament Search - Coming Soon!')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tournament Filters - Coming Soon!')),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Create Tournament - Coming Soon!')),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildTournamentList(List<Map<String, dynamic>> tournaments) {
    if (tournaments.isEmpty) {
      return _buildEmptyState('No tournaments found');
    }

    return RefreshIndicator(
      onRefresh: () async {
        // TODO: Implement refresh logic
        await Future.delayed(const Duration(seconds: 1));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tournaments refreshed!')),
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: tournaments.length,
        itemBuilder: (context, index) {
          final tournament = tournaments[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TournamentCard(tournament: tournament),
          );
        },
      ),
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
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              _tabController.animateTo(0); // Go to All tournaments tab
            },
            child: const Text('Browse Tournaments'),
          ),
        ],
      ),
    );
  }
}
