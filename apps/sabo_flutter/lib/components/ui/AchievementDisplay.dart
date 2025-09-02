import 'package:flutter/material.dart';

/// Achievement data model
class Achievement {
  final String id;
  final String title;
  final String description;
  final String iconUrl;
  final String category;
  final bool isUnlocked;
  final DateTime? unlockedAt;
  final int progress;
  final int maxProgress;
  final String rarity; // common, rare, epic, legendary

  Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.iconUrl,
    required this.category,
    required this.isUnlocked,
    this.unlockedAt,
    required this.progress,
    required this.maxProgress,
    required this.rarity,
  });

  double get progressPercentage => maxProgress > 0 ? progress / maxProgress : 0.0;

  Color get rarityColor {
    switch (rarity.toLowerCase()) {
      case 'legendary': return Colors.orange;
      case 'epic': return Colors.purple;
      case 'rare': return Colors.blue;
      default: return Colors.grey;
    }
  }
}

/// User milestone data model
class Milestone {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final DateTime achievedAt;
  final String value;
  final String category;

  Milestone({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.achievedAt,
    required this.value,
    required this.category,
  });
}

/// Achievement display component for COPILOT 2 Profile Management
class AchievementDisplay extends StatelessWidget {
  final List<Achievement> achievements;
  final List<Milestone> milestones;
  final String currentUserId;

  const AchievementDisplay({
    super.key,
    required this.achievements,
    required this.milestones,
    required this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          // Tab bar
          Container(
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: TabBar(
              tabs: const [
                Tab(
                  icon: Icon(Icons.emoji_events),
                  text: 'Thành tích',
                ),
                Tab(
                  icon: Icon(Icons.timeline),
                  text: 'Cột mốc',
                ),
              ],
              labelColor: Theme.of(context).primaryColor,
              unselectedLabelColor: Colors.grey,
              indicator: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Tab content
          Expanded(
            child: TabBarView(
              children: [
                _buildAchievementsTab(),
                _buildMilestonesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsTab() {
    final unlockedAchievements = achievements.where((a) => a.isUnlocked).toList();
    final lockedAchievements = achievements.where((a) => !a.isUnlocked).toList();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary stats
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue.shade400, Colors.blue.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.emoji_events, color: Colors.white, size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${unlockedAchievements.length}/${achievements.length} Đã mở khóa',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${(unlockedAchievements.length / achievements.length * 100).round()}% hoàn thành',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Unlocked achievements
          if (unlockedAchievements.isNotEmpty) ...[
            Text(
              'Đã đạt được (${unlockedAchievements.length})',
              style: Theme.of(null).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ...unlockedAchievements.map((achievement) => 
              _buildAchievementCard(achievement, isUnlocked: true)
            ),
            const SizedBox(height: 24),
          ],

          // Locked achievements
          if (lockedAchievements.isNotEmpty) ...[
            Text(
              'Chưa đạt được (${lockedAchievements.length})',
              style: Theme.of(null).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 12),
            ...lockedAchievements.map((achievement) => 
              _buildAchievementCard(achievement, isUnlocked: false)
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAchievementCard(Achievement achievement, {required bool isUnlocked}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Card(
        elevation: isUnlocked ? 4 : 1,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: isUnlocked ? Border.all(
              color: achievement.rarityColor,
              width: 2,
            ) : null,
          ),
          child: Row(
            children: [
              // Achievement icon
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isUnlocked ? achievement.rarityColor.withOpacity(0.1) : Colors.grey.shade200,
                ),
                child: Stack(
                  children: [
                    Center(
                      child: achievement.iconUrl.isNotEmpty
                          ? Image.network(
                              achievement.iconUrl,
                              width: 40,
                              height: 40,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.emoji_events,
                                  size: 40,
                                  color: isUnlocked ? achievement.rarityColor : Colors.grey,
                                );
                              },
                            )
                          : Icon(
                              Icons.emoji_events,
                              size: 40,
                              color: isUnlocked ? achievement.rarityColor : Colors.grey,
                            ),
                    ),
                    if (!isUnlocked)
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.black.withOpacity(0.6),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.lock,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(width: 16),

              // Achievement info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            achievement.title,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: isUnlocked ? Colors.black : Colors.grey,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: achievement.rarityColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: achievement.rarityColor, width: 1),
                          ),
                          child: Text(
                            achievement.rarity.toUpperCase(),
                            style: TextStyle(
                              color: achievement.rarityColor,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      achievement.description,
                      style: TextStyle(
                        color: isUnlocked ? Colors.grey.shade600 : Colors.grey.shade400,
                        fontSize: 14,
                      ),
                    ),
                    if (!isUnlocked && achievement.maxProgress > 0) ...[
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: achievement.progressPercentage,
                        backgroundColor: Colors.grey.shade300,
                        valueColor: AlwaysStoppedAnimation<Color>(achievement.rarityColor),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${achievement.progress}/${achievement.maxProgress}',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 12,
                        ),
                      ),
                    ],
                    if (isUnlocked && achievement.unlockedAt != null)
                      Text(
                        'Đạt được: ${_formatDate(achievement.unlockedAt!)}',
                        style: TextStyle(
                          color: achievement.rarityColor,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMilestonesTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          if (milestones.isEmpty)
            Center(
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  Icon(
                    Icons.timeline,
                    size: 64,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có cột mốc nào',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: milestones.length,
              itemBuilder: (context, index) {
                final milestone = milestones[index];
                return _buildMilestoneCard(milestone, index);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildMilestoneCard(Milestone milestone, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          // Timeline line
          Container(
            width: 40,
            child: Column(
              children: [
                if (index > 0)
                  Container(
                    width: 2,
                    height: 20,
                    color: Colors.grey.shade300,
                  ),
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Theme.of(null).primaryColor,
                  ),
                  child: Icon(
                    milestone.icon,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
                if (index < milestones.length - 1)
                  Container(
                    width: 2,
                    height: 20,
                    color: Colors.grey.shade300,
                  ),
              ],
            ),
          ),

          const SizedBox(width: 16),

          // Milestone content
          Expanded(
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            milestone.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        Text(
                          milestone.value,
                          style: TextStyle(
                            color: Theme.of(null).primaryColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      milestone.description,
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _formatDate(milestone.achievedAt),
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

/// Mock data provider for achievements and milestones
class MockAchievementData {
  static List<Achievement> getAchievements() {
    return [
      Achievement(
        id: '1',
        title: 'Người mới bắt đầu',
        description: 'Hoàn thành 5 trận đấu đầu tiên',
        iconUrl: '',
        category: 'progression',
        isUnlocked: true,
        unlockedAt: DateTime.now().subtract(const Duration(days: 30)),
        progress: 5,
        maxProgress: 5,
        rarity: 'common',
      ),
      Achievement(
        id: '2',
        title: 'Thần đồng',
        description: 'Thắng 10 trận liên tiếp',
        iconUrl: '',
        category: 'skill',
        isUnlocked: true,
        unlockedAt: DateTime.now().subtract(const Duration(days: 15)),
        progress: 10,
        maxProgress: 10,
        rarity: 'rare',
      ),
      Achievement(
        id: '3',
        title: 'Cao thủ',
        description: 'Đạt ELO trên 2000',
        iconUrl: '',
        category: 'ranking',
        isUnlocked: false,
        progress: 1450,
        maxProgress: 2000,
        rarity: 'epic',
      ),
      Achievement(
        id: '4',
        title: 'Huyền thoại',
        description: 'Vô địch giải đấu lớn',
        iconUrl: '',
        category: 'tournament',
        isUnlocked: false,
        progress: 0,
        maxProgress: 1,
        rarity: 'legendary',
      ),
    ];
  }

  static List<Milestone> getMilestones() {
    return [
      Milestone(
        id: '1',
        title: 'Trận đấu đầu tiên',
        description: 'Hoàn thành trận đấu đầu tiên',
        icon: Icons.sports_esports,
        achievedAt: DateTime.now().subtract(const Duration(days: 60)),
        value: '1',
        category: 'progression',
      ),
      Milestone(
        id: '2',
        title: 'Thắng 10 trận',
        description: 'Đạt được 10 chiến thắng',
        icon: Icons.emoji_events,
        achievedAt: DateTime.now().subtract(const Duration(days: 45)),
        value: '10',
        category: 'wins',
      ),
      Milestone(
        id: '3',
        title: 'ELO 1400',
        description: 'Đạt mức ELO 1400',
        icon: Icons.trending_up,
        achievedAt: DateTime.now().subtract(const Duration(days: 20)),
        value: '1400',
        category: 'rating',
      ),
      Milestone(
        id: '4',
        title: 'Tham gia giải đấu',
        description: 'Tham gia giải đấu đầu tiên',
        icon: Icons.tournament,
        achievedAt: DateTime.now().subtract(const Duration(days: 10)),
        value: '1',
        category: 'tournament',
      ),
    ];
  }
}
