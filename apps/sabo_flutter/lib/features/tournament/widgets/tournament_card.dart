import 'package:flutter/material.dart';

class TournamentCard extends StatelessWidget {
  final Map<String, dynamic> tournament;

  const TournamentCard({super.key, required this.tournament});

  @override
  Widget build(BuildContext context) {
    final status = tournament['status'] as String;
    final isLive = status == 'ongoing';
    final isUpcoming = status == 'upcoming';
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Tournament Details: ${tournament['name']} - Coming Soon!'),
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
                      value: '${tournament['currentParticipants']}/${tournament['maxParticipants']}',
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
              
              // Location and Time
              Row(
                children: [
                  Icon(Icons.location_on, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      tournament['venue'] as String,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(Icons.schedule, size: 16, color: Colors.grey.shade600),
                  const SizedBox(width: 4),
                  Text(
                    _formatDate(tournament['startTime'] as DateTime),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Action Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _canJoin(tournament) ? () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Joining ${tournament['name']} - Coming Soon!'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isLive ? Colors.red : Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(_getActionText(tournament)),
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

  bool _canJoin(Map<String, dynamic> tournament) {
    final status = tournament['status'] as String;
    final current = tournament['currentParticipants'] as int;
    final max = tournament['maxParticipants'] as int;
    final registrationEnd = tournament['registrationEnd'] as DateTime;
    
    return status == 'upcoming' && 
           current < max && 
           DateTime.now().isBefore(registrationEnd);
  }

  String _getActionText(Map<String, dynamic> tournament) {
    final status = tournament['status'] as String;
    
    if (status == 'ongoing') {
      return 'Watch Live';
    } else if (status == 'completed') {
      return 'View Results';
    } else if (_canJoin(tournament)) {
      return 'Join Tournament';
    } else {
      return 'Registration Closed';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now).inDays;
    
    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Tomorrow';
    } else if (difference > 0) {
      return '${difference}d';
    } else {
      return 'Live';
    }
  }
}
