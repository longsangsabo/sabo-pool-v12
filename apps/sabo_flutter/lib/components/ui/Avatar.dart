import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class Avatar extends StatelessWidget {
  final String? avatarUrl;
  final VoidCallback? onAvatarChange;
  final bool uploading;
  final String nickname;
  final String rank;
  final int elo;
  final int spa;
  final int ranking;
  final int matches;
  final bool isDark;

  const Avatar({
    super.key,
    this.avatarUrl,
    this.onAvatarChange,
    this.uploading = false,
    required this.nickname,
    this.rank = 'K',
    this.elo = 1000,
    this.spa = 0,
    this.ranking = 0,
    this.matches = 0,
    this.isDark = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      height: 400,
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: isDark
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.grey.shade900.withOpacity(0.9),
                  Colors.grey.shade800.withOpacity(0.95),
                ],
              )
            : LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white,
                  Colors.grey.shade50,
                ],
              ),
        boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 12,
              spreadRadius: 2,
            ),
        ],
        border: Border.all(
          color: isDark
              ? Colors.grey.shade700.withOpacity(0.5)
              : Colors.grey.shade200,
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Main avatar area
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 280,
              child: GestureDetector(
                onTap: onAvatarChange != null ? _handleAvatarTap : null,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.blue.shade600.withOpacity(0.1),
                        Colors.purple.shade600.withOpacity(0.1),
                      ],
                    ),
                  ),
                  child: Stack(
                    children: [
                      // Avatar image
                      if (avatarUrl != null && avatarUrl!.isNotEmpty)
                        Positioned.fill(
                          child: Image.network(
                            avatarUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                _buildPlaceholder(),
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return _buildPlaceholder();
                            },
                          ),
                        )
                      else
                        _buildPlaceholder(),

                      // Upload overlay
                      if (uploading)
                        Positioned.fill(
                          child: Container(
                            color: Colors.black.withOpacity(0.5),
                            child: const Center(
                              child: CircularProgressIndicator(
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),

                      // Nickname overlay
                      if (avatarUrl != null && avatarUrl!.isNotEmpty)
                        Positioned(
                          bottom: 0,
                          left: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.8),
                                ],
                              ),
                            ),
                            child: Text(
                              nickname,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                shadows: [
                                  Shadow(
                                    offset: Offset(1, 1),
                                    blurRadius: 3,
                                    color: Colors.black,
                                  ),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            // Stats area
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark
                      ? Colors.grey.shade800.withOpacity(0.95)
                      : Colors.white.withOpacity(0.95),
                  border: Border(
                    top: BorderSide(
                      color:
                          isDark ? Colors.grey.shade700 : Colors.grey.shade200,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    // Rank and ELO
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatItem('Hạng', rank, Icons.emoji_events),
                        _buildStatItem(
                            'ELO', elo.toString(), Icons.trending_up),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // SPA and Ranking
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildStatItem('SPA', spa.toString(), Icons.star),
                        _buildStatItem(
                            'Xếp hạng', '#$ranking', Icons.leaderboard),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: isDark ? Colors.grey.shade800 : Colors.grey.shade200,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.camera_alt_outlined,
            size: 40,
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade500,
          ),
          const SizedBox(height: 8),
          Text(
            'Đổi ảnh',
            style: TextStyle(
              color: isDark ? Colors.grey.shade400 : Colors.grey.shade500,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          size: 16,
          color: isDark ? Colors.blue.shade300 : Colors.blue.shade600,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.grey.shade900,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  void _handleAvatarTap() async {
    if (onAvatarChange == null) return;

    try {
      HapticFeedback.mediumImpact();
      onAvatarChange!();
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }
}
