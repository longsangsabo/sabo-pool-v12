import 'package:flutter/material.dart';

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
              // Club Image Placeholder
              Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade200,
                  image: club['imageUrl'] != null
                      ? DecorationImage(
                          image: NetworkImage(club['imageUrl'] as String),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: club['imageUrl'] == null
                    ? Icon(
                        Icons.sports_bar,
                        size: 48,
                        color: Colors.grey.shade400,
                      )
                    : null,
              ),
              
              const SizedBox(height: 12),
              
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
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 12),
              
              // Rating and Reviews
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
                      icon: Icons.directions_walk,
                      label: 'Distance',
                      value: '${club['distance'].toStringAsFixed(1)}km',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Location and Hours
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
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
              
              const SizedBox(height: 4),
              
              Row(
                children: [
                  Icon(Icons.access_time, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(
                    _getHoursText(club),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
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
                      onPressed: isOpen ? () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Booking table at ${club['name']}...'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      } : null,
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
        color: isOpen ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
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
    final openTime = club['openTime'] as String;
    final closeTime = club['closeTime'] as String;
    final isOpen = club['isOpen'] as bool;
    
    if (isOpen) {
      return 'Open $openTime - $closeTime';
    } else {
      return 'Opens tomorrow at $openTime';
    }
  }
}
