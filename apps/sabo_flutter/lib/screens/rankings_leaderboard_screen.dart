import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/ranking_service.dart';
import '../services/user_profile_service.dart';
import '../components/ui/Avatar.dart';
import '../models/ranking.dart';

/// Rankings & Leaderboards Screen using shared business logic
/// Implements COPILOT 2: Rankings & Leaderboards features
class RankingsLeaderboardScreen extends StatefulWidget {
  final String? currentUserId;
  
  const RankingsLeaderboardScreen({
    Key? key,
    this.currentUserId,
  }) : super(key: key);

  @override
  State<RankingsLeaderboardScreen> createState() => _RankingsLeaderboardScreenState();
}

class _RankingsLeaderboardScreenState extends State<RankingsLeaderboardScreen>
    with TickerProviderStateMixin {
  
  late TabController _tabController;
  List<LeaderboardEntry> _eloLeaderboard = [];
  List<LeaderboardEntry> _spaLeaderboard = [];
  List<RankTier> _rankTiers = [];
  ELORating? _userELO;
  SPAPoints? _userSPA;
  Map<String, int>? _userRankPosition;
  bool _isLoading = true;
  int _selectedLeaderboard = 0; // 0: ELO, 1: SPA

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadRankingData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadRankingData() async {
    setState(() => _isLoading = true);
    
    try {
      final futures = <Future>[
        RankingService.getELOLeaderboard(
          limit: 50,
        ),
        RankingService.getSPALeaderboard(
          limit: 50,
        ),
        RankingService.getRankTiers(),
      ];

      if (widget.currentUserId != null) {
        futures.addAll([
          RankingService.getUserELO(widget.currentUserId!),
          RankingService.getUserSPA(widget.currentUserId!),
          RankingService.getUserRankingPosition(widget.currentUserId!),
        ]);
      }

      final results = await Future.wait(futures);

      setState(() {
        _eloLeaderboard = results[0] as List<LeaderboardEntry>;
        _spaLeaderboard = results[1] as List<LeaderboardEntry>;
        _rankTiers = results[2] as List<RankTier>;
        
        if (widget.currentUserId != null && results.length > 3) {
          _userELO = results[3] as ELORating?;
          _userSPA = results[4] as SPAPoints?;
          _userRankPosition = results[5] as Map<String, int>?;
        }
        
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Lỗi tải ranking: $e');
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.amber.shade900,
            Colors.orange.shade900,
          ],
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header title
            Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                ),
                const SizedBox(width: 16),
                const Text(
                  'Rankings & Leaderboards',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: _loadRankingData,
                  icon: const Icon(Icons.refresh, color: Colors.white),
                ),
              ],
            ),
            
            const SizedBox(height: 20),
            
            // User's current ranking (if logged in)
            if (widget.currentUserId != null && _userRankPosition != null)
              _buildUserRankingCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildUserRankingCard() {
    if (_userELO == null || _userSPA == null || _userRankPosition == null) {
      return const SizedBox();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Text(
            'Your Current Ranking',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          
          const SizedBox(height: 16),
          
          Row(
            children: [
              // ELO Ranking
              Expanded(
                child: _buildRankingMiniCard(
                  title: 'ELO Rank',
                  rank: _userRankPosition!['elo_rank']!,
                  value: _userELO!.rating.toString(),
                  tier: _userELO!.tier,
                  color: Colors.blue,
                ),
              ),
              
              const SizedBox(width: 16),
              
              // SPA Ranking
              Expanded(
                child: _buildRankingMiniCard(
                  title: 'SPA Rank',
                  rank: _userRankPosition!['spa_rank']!,
                  value: _userSPA!.points.toString(),
                  tier: _userSPA!.seasonTier,
                  color: Colors.purple,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRankingMiniCard({
    required String title,
    required int rank,
    required String value,
    required String tier,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '#$rank',
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            tier,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeaderboardTab() {
    final leaderboard = _selectedLeaderboard == 0 ? _eloLeaderboard : _spaLeaderboard;
    final title = _selectedLeaderboard == 0 ? 'ELO Rankings' : 'SPA Rankings';

    return Column(
      children: [
        // Leaderboard selector
        Container(
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    setState(() => _selectedLeaderboard = 0);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: _selectedLeaderboard == 0 ? Colors.blue : Colors.transparent,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Text(
                      'ELO Rankings',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _selectedLeaderboard == 0 ? Colors.white : Colors.grey.shade600,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.lightImpact();
                    setState(() => _selectedLeaderboard = 1);
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: _selectedLeaderboard == 1 ? Colors.purple : Colors.transparent,
                      borderRadius: BorderRadius.circular(25),
                    ),
                    child: Text(
                      'SPA Rankings',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _selectedLeaderboard == 1 ? Colors.white : Colors.grey.shade600,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        
        // Leaderboard list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: leaderboard.length,
            itemBuilder: (context, index) {
              final entry = leaderboard[index];
              return _buildLeaderboardItem(entry, index);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardItem(LeaderboardEntry entry, int index) {
    final isCurrentUser = false; // Will be set by UI logic
    final rankColor = _getRankColor(entry.rank);
    final value = _selectedLeaderboard == 0 ? entry.rating : entry.points;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCurrentUser ? Colors.blue.withOpacity(0.1) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrentUser ? Colors.blue : Colors.grey.shade200,
          width: isCurrentUser ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Rank badge
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: rankColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                entry.rank <= 3 ? _getRankIcon(entry.rank) : '${entry.rank}',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: entry.rank <= 3 ? 20.0 : 14.0,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
          // Avatar placeholder
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey.shade300,
            ),
            child: Icon(Icons.person, color: Colors.grey.shade600),
          ),
          
          const SizedBox(width: 16),
          
          // User info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.displayName,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isCurrentUser ? Colors.blue : Colors.black,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  entry.tier,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${entry.wins}W - ${entry.losses}L (${(entry.winRate * 100).toStringAsFixed(1)}%)',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
          
          // Rating/Points
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value.toString(),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _selectedLeaderboard == 0 ? Colors.blue : Colors.purple,
                ),
              ),
              Text(
                _selectedLeaderboard == 0 ? 'ELO' : 'SPA',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRankTiersTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _rankTiers.length,
      itemBuilder: (context, index) {
        final tier = _rankTiers[index];
        return _buildTierCard(tier);
      },
    );
  }

  Widget _buildTierCard(RankTier tier) {
    final color = _getTierColor(tier.color);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  tier.iconUrl,
                  style: const TextStyle(fontSize: 24),
                ),
              ),
              
              const SizedBox(width: 16),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tier.name,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${tier.minRating} - ${tier.maxRating} ELO',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          if (tier.benefits.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Text(
              'Benefits:',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ...tier.benefits.map((benefit) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  Icon(Icons.check_circle, color: color, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      benefit,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ),
                ],
              ),
            )).toList(),
          ],
        ],
      ),
    );
  }

  Widget _buildMyRankingTab() {
    if (widget.currentUserId == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.login, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Please login to view your ranking',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    if (_userELO == null || _userSPA == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // ELO Section
        _buildMyRankingCard(
          title: 'ELO Rating',
          icon: Icons.trending_up,
          color: Colors.blue,
          currentValue: _userELO!.rating.toString(),
          peakValue: 'Peak: ${_userELO!.peak ?? _userELO!.rating}',
          rank: _userRankPosition?['elo_rank'] ?? 0,
          tier: _userELO!.tier,
          gamesPlayed: _userELO!.gamesPlayed,
          progress: _userELO!.tierProgress / 100,
        ),
        
        const SizedBox(height: 16),
        
        // SPA Section
        _buildMyRankingCard(
          title: 'SPA Points',
          icon: Icons.stars,
          color: Colors.purple,
          currentValue: _userSPA!.points.toString(),
          peakValue: 'Season: ${_userSPA!.points}',
          rank: _userRankPosition?['spa_rank'] ?? 0,
          tier: _userSPA!.seasonTier,
          gamesPlayed: null,
          progress: (_userSPA!.points % 1000) / 1000,
        ),
      ],
    );
  }

  Widget _buildMyRankingCard({
    required String title,
    required IconData icon,
    required Color color,
    required String currentValue,
    required String peakValue,
    required int rank,
    required String tier,
    required int? gamesPlayed,
    required double progress,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white, size: 24),
              ),
              
              const SizedBox(width: 16),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                    Text(
                      'Rank #$rank',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    currentValue,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  Text(
                    peakValue,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Tier and progress
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tier,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: progress.clamp(0.0, 1.0),
                      backgroundColor: color.withOpacity(0.2),
                      valueColor: AlwaysStoppedAnimation<Color>(color),
                    ),
                  ],
                ),
              ),
              
              if (gamesPlayed != null) ...[
                const SizedBox(width: 16),
                Text(
                  '$gamesPlayed games',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Color _getRankColor(int rank) {
    if (rank == 1) return Colors.amber;
    if (rank == 2) return Colors.grey.shade400;
    if (rank == 3) return Colors.brown.shade400;
    if (rank <= 10) return Colors.purple;
    if (rank <= 50) return Colors.blue;
    return Colors.grey;
  }

  String _getRankIcon(int rank) {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  }

  Color _getTierColor(String colorName) {
    switch (colorName.toLowerCase()) {
      case 'bronze': return Colors.brown;
      case 'silver': return Colors.grey;
      case 'gold': return Colors.amber;
      case 'platinum': return Colors.blueGrey;
      case 'diamond': return Colors.lightBlue;
      case 'master': return Colors.purple;
      case 'grandmaster': return Colors.red;
      default: return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      body: Column(
        children: [
          _buildHeader(),
          
          // Tab Bar
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              indicatorColor: Colors.amber,
              labelColor: Colors.amber.shade800,
              unselectedLabelColor: Colors.grey,
              tabs: const [
                Tab(icon: Icon(Icons.leaderboard), text: 'Leaderboard'),
                Tab(icon: Icon(Icons.military_tech), text: 'Tiers'),
                Tab(icon: Icon(Icons.person), text: 'My Ranking'),
              ],
            ),
          ),
          
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildLeaderboardTab(),
                _buildRankTiersTab(),
                _buildMyRankingTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
