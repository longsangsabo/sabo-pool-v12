import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/user_profile.dart';
import '../models/ranking.dart';
import '../services/user_profile_service.dart';
import '../services/ranking_service.dart';

/// Enhanced profile statistics dashboard for COPILOT 2
/// Comprehensive analytics and performance visualization
class ProfileStatsDashboard extends StatefulWidget {
  final String userId;
  final UserProfile? profile;

  const ProfileStatsDashboard({
    Key? key,
    required this.userId,
    this.profile,
  }) : super(key: key);

  @override
  State<ProfileStatsDashboard> createState() => _ProfileStatsDashboardState();
}

class _ProfileStatsDashboardState extends State<ProfileStatsDashboard>
    with TickerProviderStateMixin {
  UserProfile? _profile;
  LeaderboardEntry? _ranking;
  List<Map<String, dynamic>> _recentMatches = [];
  Map<String, dynamic> _performanceStats = {};
  Map<String, List<double>> _chartData = {};
  
  bool _isLoading = true;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _profile = widget.profile;
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    try {
      final futures = await Future.wait([
        if (_profile == null)
          UserProfileService.getUserProfile(widget.userId),
        RankingService.getUserRanking(widget.userId),
        _loadRecentMatches(),
        _loadPerformanceStats(),
        _loadChartData(),
      ]);

      int index = 0;
      if (_profile == null) {
        _profile = futures[index] as UserProfile?;
        index++;
      }
      
      _ranking = futures[index] as LeaderboardEntry?;
      index++;
      _recentMatches = futures[index] as List<Map<String, dynamic>>;
      index++;
      _performanceStats = futures[index] as Map<String, dynamic>;
      index++;
      _chartData = futures[index] as Map<String, List<double>>;
      
    } catch (e) {
      _showErrorSnackBar('Failed to load statistics: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<List<Map<String, dynamic>>> _loadRecentMatches() async {
    // Mock data for recent matches
    return [
      {
        'opponent': 'Player123',
        'result': 'win',
        'score': '15-10',
        'date': DateTime.now().subtract(const Duration(hours: 2)),
        'gameType': 'Ranked',
        'duration': '12:30',
        'eloChange': '+15',
      },
      {
        'opponent': 'PoolPro',
        'result': 'loss',
        'score': '8-15',
        'date': DateTime.now().subtract(const Duration(days: 1)),
        'gameType': 'Tournament',
        'duration': '18:45',
        'eloChange': '-12',
      },
      {
        'opponent': 'BilliardMaster',
        'result': 'win',
        'score': '15-7',
        'date': DateTime.now().subtract(const Duration(days: 2)),
        'gameType': 'Casual',
        'duration': '15:20',
        'eloChange': '+18',
      },
      {
        'opponent': 'CueStick99',
        'result': 'win',
        'score': '15-12',
        'date': DateTime.now().subtract(const Duration(days: 3)),
        'gameType': 'Ranked',
        'duration': '22:10',
        'eloChange': '+20',
      },
      {
        'opponent': 'PoolShark',
        'result': 'loss',
        'score': '11-15',
        'date': DateTime.now().subtract(const Duration(days: 4)),
        'gameType': 'Tournament',
        'duration': '16:40',
        'eloChange': '-15',
      },
    ];
  }

  Future<Map<String, dynamic>> _loadPerformanceStats() async {
    // Mock performance statistics
    return {
      'averageGameDuration': '16:25',
      'bestStreak': 8,
      'currentStreak': 3,
      'favoriteGameType': 'Ranked',
      'bestOpponentBeaten': 'GrandMaster_Player',
      'totalPlayTime': '142h 30m',
      'averageEloGain': 12.5,
      'comebackWins': 15,
      'perfectGames': 3,
      'weeklyGames': 24,
      'monthlyGames': 89,
      'winRateImprovement': 8.5,
      'rankingImprovement': 25,
    };
  }

  Future<Map<String, List<double>>> _loadChartData() async {
    // Mock chart data for last 30 days
    return {
      'eloHistory': [1200, 1215, 1198, 1220, 1235, 1218, 1240, 1225, 1250, 1265, 
                     1248, 1270, 1285, 1275, 1295, 1280, 1300, 1315, 1305, 1320,
                     1335, 1325, 1340, 1355, 1345, 1360, 1375, 1365, 1380, 1390],
      'winRateHistory': [0.65, 0.67, 0.64, 0.68, 0.70, 0.69, 0.72, 0.71, 0.74, 0.76,
                        0.75, 0.77, 0.79, 0.78, 0.80, 0.79, 0.81, 0.83, 0.82, 0.84,
                        0.85, 0.84, 0.86, 0.87, 0.86, 0.88, 0.89, 0.88, 0.90, 0.89],
      'gamesPerDay': [2, 3, 1, 4, 2, 0, 1, 3, 4, 2, 1, 3, 2, 4, 1, 0, 2, 3, 4, 1,
                     2, 3, 1, 4, 2, 3, 1, 2, 4, 3],
    };
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error, color: Colors.white),
              const SizedBox(width: 8),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
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
      appBar: AppBar(
        title: const Text('Statistics Dashboard'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
            tooltip: 'Refresh Data',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.analytics), text: 'Overview'),
            Tab(icon: Icon(Icons.show_chart), text: 'Performance'),
            Tab(icon: Icon(Icons.history), text: 'Recent Games'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildPerformanceTab(),
          _buildRecentGamesTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPlayerSummaryCard(),
          const SizedBox(height: 16),
          _buildStatsGrid(),
          const SizedBox(height: 16),
          _buildPerformanceIndicators(),
        ],
      ),
    );
  }

  Widget _buildPlayerSummaryCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: _profile?.avatarUrl != null 
                        ? null 
                        : Theme.of(context).primaryColor,
                    borderRadius: BorderRadius.circular(30),
                    image: _profile?.avatarUrl != null
                        ? DecorationImage(
                            image: NetworkImage(_profile!.avatarUrl!),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  child: _profile?.avatarUrl == null
                      ? const Icon(Icons.person, color: Colors.white, size: 30)
                      : null,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _profile?.displayName ?? 'Unknown Player',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_ranking != null) ...[
                        Text(
                          'Rank #${_ranking!.rank}',
                          style: TextStyle(
                            fontSize: 16,
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          '${_ranking!.rankTier} Tier',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                if (_ranking != null)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${_ranking!.eloRating.currentRating}',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                      const Text(
                        'ELO',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
            if (_profile?.bio != null && _profile!.bio!.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(),
              Text(
                _profile!.bio!,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid() {
    final stats = [
      {
        'title': 'Total Wins',
        'value': '${_ranking?.totalWins ?? 0}',
        'icon': Icons.emoji_events,
        'color': Colors.amber,
      },
      {
        'title': 'Win Rate',
        'value': '${((_ranking?.winRate ?? 0) * 100).toStringAsFixed(1)}%',
        'icon': Icons.percent,
        'color': Colors.green,
      },
      {
        'title': 'Games Played',
        'value': '${(_ranking?.totalWins ?? 0) + (_ranking?.totalLosses ?? 0)}',
        'icon': Icons.sports_esports,
        'color': Colors.purple,
      },
      {
        'title': 'Best Streak',
        'value': '${_performanceStats['bestStreak'] ?? 0}',
        'icon': Icons.trending_up,
        'color': Colors.blue,
      },
      {
        'title': 'Play Time',
        'value': _performanceStats['totalPlayTime'] ?? '0h',
        'icon': Icons.access_time,
        'color': Colors.orange,
      },
      {
        'title': 'Avg Duration',
        'value': _performanceStats['averageGameDuration'] ?? '0:00',
        'icon': Icons.timer,
        'color': Colors.red,
      },
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.5,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        final stat = stats[index];
        return Card(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  stat['icon'] as IconData,
                  color: stat['color'] as Color,
                  size: 24,
                ),
                const SizedBox(height: 8),
                Text(
                  stat['value'] as String,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: stat['color'] as Color,
                  ),
                ),
                Text(
                  stat['title'] as String,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPerformanceIndicators() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Performance Indicators',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildIndicatorRow(
              'Current Streak',
              '${_performanceStats['currentStreak']} wins',
              _performanceStats['currentStreak'] / 10,
              Colors.green,
            ),
            _buildIndicatorRow(
              'Win Rate Improvement',
              '+${_performanceStats['winRateImprovement']}%',
              _performanceStats['winRateImprovement'] / 20,
              Colors.blue,
            ),
            _buildIndicatorRow(
              'Ranking Improvement',
              '+${_performanceStats['rankingImprovement']} positions',
              _performanceStats['rankingImprovement'] / 50,
              Colors.purple,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIndicatorRow(String title, String value, double progress, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildEloChart(),
          const SizedBox(height: 16),
          _buildWinRateChart(),
          const SizedBox(height: 16),
          _buildActivityChart(),
        ],
      ),
    );
  }

  Widget _buildEloChart() {
    final eloData = _chartData['eloHistory'] ?? [];
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'ELO Rating Trend (30 Days)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: eloData.asMap().entries.map((entry) {
                        return FlSpot(entry.key.toDouble(), entry.value);
                      }).toList(),
                      isCurved: true,
                      color: Colors.blue,
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: Colors.blue.withOpacity(0.1),
                      ),
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

  Widget _buildWinRateChart() {
    final winRateData = _chartData['winRateHistory'] ?? [];
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Win Rate Trend (30 Days)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  lineBarsData: [
                    LineChartBarData(
                      spots: winRateData.asMap().entries.map((entry) {
                        return FlSpot(entry.key.toDouble(), entry.value * 100);
                      }).toList(),
                      isCurved: true,
                      color: Colors.green,
                      barWidth: 3,
                      dotData: const FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: Colors.green.withOpacity(0.1),
                      ),
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

  Widget _buildActivityChart() {
    final activityData = _chartData['gamesPerDay'] ?? [];
    
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Activity (30 Days)',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  gridData: const FlGridData(show: false),
                  titlesData: const FlTitlesData(show: false),
                  borderData: FlBorderData(show: false),
                  barGroups: activityData.asMap().entries.map((entry) {
                    return BarChartGroupData(
                      x: entry.key,
                      barRods: [
                        BarChartRodData(
                          toY: entry.value,
                          color: Colors.purple,
                          width: 6,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentGamesTab() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _recentMatches.length,
      itemBuilder: (context, index) {
        final match = _recentMatches[index];
        final isWin = match['result'] == 'win';
        
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isWin ? Colors.green : Colors.red,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                isWin ? Icons.emoji_events : Icons.close,
                color: Colors.white,
              ),
            ),
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    'vs ${match['opponent']}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _getGameTypeColor(match['gameType']),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    match['gameType'],
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Score: ${match['score']} • Duration: ${match['duration']}',
                  style: const TextStyle(fontSize: 12),
                ),
                Text(
                  _formatDate(match['date']),
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            trailing: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  isWin ? 'WIN' : 'LOSS',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isWin ? Colors.green : Colors.red,
                  ),
                ),
                Text(
                  match['eloChange'],
                  style: TextStyle(
                    fontSize: 12,
                    color: match['eloChange'].startsWith('+') 
                        ? Colors.green 
                        : Colors.red,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Color _getGameTypeColor(String gameType) {
    switch (gameType.toLowerCase()) {
      case 'ranked':
        return Colors.blue;
      case 'tournament':
        return Colors.purple;
      case 'casual':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else {
      return '${difference.inDays} days ago';
    }
  }
}
