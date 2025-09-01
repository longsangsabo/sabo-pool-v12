import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/club_card.dart';

class ClubListScreen extends ConsumerStatefulWidget {
  const ClubListScreen({super.key});

  @override
  ConsumerState<ClubListScreen> createState() => _ClubListScreenState();
}

class _ClubListScreenState extends ConsumerState<ClubListScreen> {
  String _selectedFilter = 'all';
  String _sortBy = 'distance';

  @override
  Widget build(BuildContext context) {
    // Mock club data - will be replaced with real API data
    final mockClubs = [
      {
        'id': '1',
        'name': 'Elite Billiards Club',
        'description': 'Premium pool hall with professional tables and expert coaching available.',
        'address': '123 Main Street, Downtown',
        'rating': 4.8,
        'reviewCount': 124,
        'tableCount': 12,
        'hourlyRate': 25,
        'distance': 1.2,
        'isOpen': true,
        'openTime': '10:00 AM',
        'closeTime': '2:00 AM',
        'imageUrl': null,
        'amenities': ['WiFi', 'Food', 'Drinks', 'Parking', 'AC'],
      },
      {
        'id': '2',
        'name': 'Corner Pocket Lounge',
        'description': 'Casual pool hall with a friendly atmosphere and great food.',
        'address': '456 Oak Avenue, Midtown',
        'rating': 4.3,
        'reviewCount': 89,
        'tableCount': 8,
        'hourlyRate': 20,
        'distance': 2.1,
        'isOpen': true,
        'openTime': '12:00 PM',
        'closeTime': '12:00 AM',
        'imageUrl': null,
        'amenities': ['Food', 'Drinks', 'Music', 'Events'],
      },
      {
        'id': '3',
        'name': 'Rookie\'s Pool Hall',
        'description': 'Perfect for beginners with coaching lessons and practice sessions.',
        'address': '789 Pine Street, Westside',
        'rating': 4.1,
        'reviewCount': 56,
        'tableCount': 6,
        'hourlyRate': 15,
        'distance': 3.4,
        'isOpen': false,
        'openTime': '2:00 PM',
        'closeTime': '10:00 PM',
        'imageUrl': null,
        'amenities': ['Lessons', 'Equipment Rental', 'Beginner Friendly'],
      },
      {
        'id': '4',
        'name': 'Champions Sports Bar',
        'description': 'Sports bar with pool tables, multiple screens, and tournament nights.',
        'address': '321 Cedar Road, Northside',
        'rating': 4.5,
        'reviewCount': 98,
        'tableCount': 10,
        'hourlyRate': 22,
        'distance': 4.2,
        'isOpen': true,
        'openTime': '11:00 AM',
        'closeTime': '1:00 AM',
        'imageUrl': null,
        'amenities': ['Sports TV', 'Food', 'Drinks', 'Tournaments', 'Parking'],
      },
      {
        'id': '5',
        'name': 'Student Pool Center',
        'description': 'Affordable pool hall popular with students and young professionals.',
        'address': '654 University Drive, Campus',
        'rating': 3.9,
        'reviewCount': 67,
        'tableCount': 15,
        'hourlyRate': 12,
        'distance': 5.1,
        'isOpen': true,
        'openTime': '9:00 AM',
        'closeTime': '11:00 PM',
        'imageUrl': null,
        'amenities': ['Student Discount', 'Study Area', 'WiFi', 'Snacks'],
      },
    ];

    final filteredClubs = _filterClubs(mockClubs);
    final sortedClubs = _sortClubs(filteredClubs);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pool Clubs'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Club Search - Coming Soon!')),
              );
            },
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.sort),
            onSelected: (String value) {
              setState(() {
                _sortBy = value;
              });
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem(
                value: 'distance',
                child: Text('Sort by Distance'),
              ),
              const PopupMenuItem(
                value: 'rating',
                child: Text('Sort by Rating'),
              ),
              const PopupMenuItem(
                value: 'price',
                child: Text('Sort by Price'),
              ),
              const PopupMenuItem(
                value: 'name',
                child: Text('Sort by Name'),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All Clubs', 'all'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Open Now', 'open'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Nearby', 'nearby'),
                  const SizedBox(width: 8),
                  _buildFilterChip('High Rated', 'rated'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Budget Friendly', 'budget'),
                ],
              ),
            ),
          ),
          
          // Clubs List
          Expanded(
            child: _buildClubsList(sortedClubs),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Map View - Coming Soon!')),
          );
        },
        icon: const Icon(Icons.map),
        label: const Text('Map View'),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (bool selected) {
        setState(() {
          _selectedFilter = selected ? value : 'all';
        });
      },
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
      checkmarkColor: Theme.of(context).primaryColor,
    );
  }

  Widget _buildClubsList(List<Map<String, dynamic>> clubs) {
    if (clubs.isEmpty) {
      return _buildEmptyState();
    }

    return RefreshIndicator(
      onRefresh: () async {
        // TODO: Implement refresh logic
        await Future.delayed(const Duration(seconds: 1));
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Clubs refreshed!')),
        );
      },
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: clubs.length,
        itemBuilder: (context, index) {
          final club = clubs[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: ClubCard(club: club),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.sports_bar_outlined,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'No clubs found',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your filters',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _selectedFilter = 'all';
              });
            },
            child: const Text('Show All Clubs'),
          ),
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _filterClubs(List<Map<String, dynamic>> clubs) {
    switch (_selectedFilter) {
      case 'open':
        return clubs.where((club) => club['isOpen'] as bool).toList();
      case 'nearby':
        return clubs.where((club) => (club['distance'] as double) <= 3.0).toList();
      case 'rated':
        return clubs.where((club) => (club['rating'] as double) >= 4.5).toList();
      case 'budget':
        return clubs.where((club) => (club['hourlyRate'] as int) <= 20).toList();
      default:
        return clubs;
    }
  }

  List<Map<String, dynamic>> _sortClubs(List<Map<String, dynamic>> clubs) {
    final sortedClubs = List<Map<String, dynamic>>.from(clubs);
    
    switch (_sortBy) {
      case 'rating':
        sortedClubs.sort((a, b) => (b['rating'] as double).compareTo(a['rating'] as double));
        break;
      case 'price':
        sortedClubs.sort((a, b) => (a['hourlyRate'] as int).compareTo(b['hourlyRate'] as int));
        break;
      case 'name':
        sortedClubs.sort((a, b) => (a['name'] as String).compareTo(b['name'] as String));
        break;
      case 'distance':
      default:
        sortedClubs.sort((a, b) => (a['distance'] as double).compareTo(b['distance'] as double));
        break;
    }
    
    return sortedClubs;
  }
}
