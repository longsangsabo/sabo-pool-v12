import 'package:flutter/material.dart';

class ClubScreen extends StatefulWidget {
  const ClubScreen({super.key});

  @override
  State<ClubScreen> createState() => _ClubScreenState();
}

class _ClubScreenState extends State<ClubScreen> {
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    // Mock club data
    final mockClubs = [
      {
        'id': '1',
        'name': 'Elite Billiards Club',
        'description': 'Premium pool hall with professional tables',
        'address': '123 Main Street, Downtown',
        'rating': 4.8,
        'reviewCount': 124,
        'tableCount': 12,
        'hourlyRate': 25,
        'isOpen': true,
        'openTime': '10:00 AM',
        'closeTime': '2:00 AM',
      },
      {
        'id': '2',
        'name': 'Corner Pocket Lounge',
        'description': 'Casual pool hall with friendly atmosphere',
        'address': '456 Oak Avenue, Midtown',
        'rating': 4.3,
        'reviewCount': 89,
        'tableCount': 8,
        'hourlyRate': 20,
        'isOpen': true,
        'openTime': '12:00 PM',
        'closeTime': '12:00 AM',
      },
      {
        'id': '3',
        'name': 'Student Pool Center',
        'description': 'Affordable pool hall for students',
        'address': '789 University Drive, Campus',
        'rating': 3.9,
        'reviewCount': 67,
        'tableCount': 15,
        'hourlyRate': 12,
        'isOpen': false,
        'openTime': '2:00 PM',
        'closeTime': '10:00 PM',
      },
    ];

    final filteredClubs = _filterClubs(mockClubs);

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
                  _buildFilterChip('High Rated', 'rated'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Budget Friendly', 'budget'),
                ],
              ),
            ),
          ),

          // Clubs List
          Expanded(
            child: _buildClubsList(filteredClubs),
          ),
        ],
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

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: clubs.length,
      itemBuilder: (context, index) {
        final club = clubs[index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: ClubCard(club: club),
        );
      },
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
        ],
      ),
    );
  }

  List<Map<String, dynamic>> _filterClubs(List<Map<String, dynamic>> clubs) {
    switch (_selectedFilter) {
      case 'open':
        return clubs.where((club) => club['isOpen'] as bool).toList();
      case 'rated':
        return clubs
            .where((club) => (club['rating'] as double) >= 4.5)
            .toList();
      case 'budget':
        return clubs
            .where((club) => (club['hourlyRate'] as int) <= 20)
            .toList();
      default:
        return clubs;
    }
  }
}

class ClubCard extends StatelessWidget {
  final Map<String, dynamic> club;

  const ClubCard({super.key, required this.club});

  @override
  Widget build(BuildContext context) {
    final isOpen = club['isOpen'] as bool;
    final rating = club['rating'] as double;

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Club Details: ${club['name']} - Coming Soon!'),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Club Name and Status
              Row(
                children: [
                  Expanded(
                    child: Text(
                      club['name'] as String,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  _buildStatusIndicator(isOpen),
                ],
              ),

              const SizedBox(height: 8),

              // Description
              Text(
                club['description'] as String,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),

              const SizedBox(height: 12),

              // Rating
              Row(
                children: [
                  ...List.generate(5, (index) {
                    return Icon(
                      index < rating.floor()
                          ? Icons.star
                          : index < rating
                              ? Icons.star_half
                              : Icons.star_border,
                      color: Colors.amber,
                      size: 16,
                    );
                  }),
                  const SizedBox(width: 8),
                  Text(
                    rating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    ' (${club['reviewCount']} reviews)',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Club Info
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.table_bar,
                      label: 'Tables',
                      value: '${club['tableCount']}',
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.attach_money,
                      label: 'Per Hour',
                      value: '\$${club['hourlyRate']}',
                    ),
                  ),
                  Expanded(
                    child: _buildInfoItem(
                      icon: Icons.access_time,
                      label: 'Hours',
                      value: _getHoursText(club),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Location
              Row(
                children: [
                  Icon(Icons.location_on,
                      size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      club['address'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Calling ${club['name']}...'),
                            backgroundColor: Colors.blue,
                          ),
                        );
                      },
                      icon: const Icon(Icons.phone, size: 16),
                      label: const Text('Call'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: isOpen
                          ? () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                      'Booking table at ${club['name']}...'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          : null,
                      icon: const Icon(Icons.calendar_today, size: 16),
                      label: Text(isOpen ? 'Book Table' : 'Closed'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(bool isOpen) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isOpen
            ? Colors.green.withOpacity(0.1)
            : Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isOpen ? Colors.green : Colors.red),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: isOpen ? Colors.green : Colors.red,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            isOpen ? 'Open' : 'Closed',
            style: TextStyle(
              color: isOpen ? Colors.green : Colors.red,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
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

  String _getHoursText(Map<String, dynamic> club) {
    final isOpen = club['isOpen'] as bool;
    return isOpen ? 'Open Now' : 'Closed';
  }
}
