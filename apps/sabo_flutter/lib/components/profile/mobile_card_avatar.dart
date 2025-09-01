import 'package:flutter/material.dart';

// Card Avatar Component - port từ CardAvatar.tsx và DarkCardAvatar.tsx
class MobileCardAvatar extends StatelessWidget {
  final String userAvatar;
  final VoidCallback onAvatarChange;
  final bool uploading;
  final String nickname;
  final String rank;
  final int elo;
  final int spa;
  final int ranking;
  final int matches;
  final bool isDark;

  const MobileCardAvatar({
    super.key,
    required this.userAvatar,
    required this.onAvatarChange,
    required this.uploading,
    required this.nickname,
    required this.rank,
    required this.elo,
    required this.spa,
    required this.ranking,
    required this.matches,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: isDark
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF1e293b),
                  Color(0xFF0f172a),
                ],
              )
            : const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white,
                  Color(0xFFf8fafc),
                ],
              ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? Colors.black.withValues(alpha: 0.3)
                : Colors.grey.withValues(alpha: 0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar Section
            GestureDetector(
              onTap: uploading ? null : onAvatarChange,
              child: Stack(
                children: [
                  Container(
                    width: 96,
                    height: 96,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isDark ? Colors.blue[300]! : Colors.blue[600]!,
                        width: 3,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blue.withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: CircleAvatar(
                      radius: 46,
                      backgroundImage: userAvatar.isNotEmpty
                          ? NetworkImage(userAvatar)
                          : null,
                      backgroundColor: Colors.grey[300],
                      child: userAvatar.isEmpty
                          ? Icon(
                              Icons.person,
                              size: 48,
                              color: Colors.grey[600],
                            )
                          : null,
                    ),
                  ),
                  if (uploading)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withValues(alpha: 0.5),
                        ),
                        child: const Center(
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                    ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isDark ? Colors.blue[400] : Colors.blue[600],
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withValues(alpha: 0.4),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        size: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Name & Rank
            Text(
              nickname,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.grey[900],
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 4),

            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: isDark ? Colors.blue[400] : Colors.blue[600],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Hạng $rank',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),

            const SizedBox(height: 20),

            // Stats Grid
            Row(
              children: [
                _buildStatItem('ELO', elo.toString(), Icons.trending_up),
                _buildStatItem('SPA', spa.toString(), Icons.star),
                _buildStatItem('TOP', ranking.toString(), Icons.emoji_events),
                _buildStatItem('TRẬN', matches.toString(), Icons.sports_tennis),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isDark
              ? Colors.grey[800]!.withValues(alpha: 0.3)
              : Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark
                ? Colors.grey[700]!.withValues(alpha: 0.3)
                : Colors.grey[200]!,
          ),
        ),
        margin: const EdgeInsets.symmetric(horizontal: 2),
        child: Column(
          children: [
            Icon(
              icon,
              size: 18,
              color: isDark ? Colors.blue[300] : Colors.blue[600],
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.grey[900],
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
