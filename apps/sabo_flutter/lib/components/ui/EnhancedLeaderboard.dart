import 'package:flutter/material.dart';
import '../models/ranking.dart';
import '../services/ranking_service.dart';

/// Enhanced leaderboard widget for COPILOT 2: Rankings & Leaderboards
/// Implements comprehensive ranking display with filtering and search
class EnhancedLeaderboard extends StatefulWidget {
  final String? userId;
  final bool showCurrentUser;
  final int itemsPerPage;

  const EnhancedLeaderboard({
    Key? key,
    this.userId,
    this.showCurrentUser = true,
    this.itemsPerPage = 20,
  }) : super(key: key);

  @override
  State<EnhancedLeaderboard> createState() => _EnhancedLeaderboardState();
}

class _EnhancedLeaderboardState extends State<EnhancedLeaderboard>
    with TickerProviderStateMixin {
  late TabController _tabController;
  List<LeaderboardEntry> _allTimeEntries = [];
  List<LeaderboardEntry> _weeklyEntries = [];
  List<LeaderboardEntry> _monthlyEntries = [];
  List<RankTier> _rankTiers = [];
  LeaderboardEntry? _currentUserRanking;
  
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedFilter = 'all';
  int _currentPage = 1;
  
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      // Load all leaderboard data in parallel
      final futures = await Future.wait([
        RankingService.getLeaderboard('all_time', limit: 100),
        RankingService.getLeaderboard('weekly', limit: 100),
        RankingService.getLeaderboard('monthly', limit: 100),
        RankingService.getRankTiers(),
        if (widget.userId != null)
          RankingService.getUserRanking(widget.userId!),
      ]);

      setState(() {
        _allTimeEntries = futures[0] as List<LeaderboardEntry>;
        _weeklyEntries = futures[1] as List<LeaderboardEntry>;
        _monthlyEntries = futures[2] as List<LeaderboardEntry>;
        _rankTiers = futures[3] as List<RankTier>;
        if (widget.userId != null && futures.length > 4) {
          _currentUserRanking = futures[4] as LeaderboardEntry?;
        }
      });
    } catch (e) {
      _showErrorSnackBar('Failed to load leaderboard: $e');
    } finally {
      setState(() => _isLoading = false);
    }
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

  List<LeaderboardEntry> get _currentEntries {
    List<LeaderboardEntry> entries;
    switch (_tabController.index) {
      case 0:
        entries = _allTimeEntries;
        break;
      case 1:
        entries = _weeklyEntries;
        break;
      case 2:
        entries = _monthlyEntries;
        break;
      default:
        entries = _allTimeEntries;
    }

    // Apply search filter
    if (_searchQuery.isNotEmpty) {
      entries = entries.where((entry) {
        return entry.userName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
               entry.realName?.toLowerCase().contains(_searchQuery.toLowerCase()) == true;
      }).toList();
    }

    // Apply rank filter
    if (_selectedFilter != 'all') {
      entries = entries.where((entry) {
        return entry.rankTier.toLowerCase() == _selectedFilter.toLowerCase();
      }).toList();
    }

    return entries;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildHeader(),
        if (widget.showCurrentUser && _currentUserRanking != null)
          _buildCurrentUserCard(),
        _buildSearchAndFilters(),
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildTabView(),
        ),
      ],
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).primaryColor,
            Theme.of(context).primaryColor.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Row(
        children: [
          const Icon(
            Icons.leaderboard,
            color: Colors.white,
            size: 32,
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Leaderboard',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Total Players: ${_allTimeEntries.length}',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
            tooltip: 'Refresh Rankings',
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentUserCard() {
    final user = _currentUserRanking!;
    final tier = _getRankTier(user.rankTier);
    
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.amber.withOpacity(0.1),
            Colors.amber.withOpacity(0.05),
          ],
        ),
        border: Border.all(color: Colors.amber, width: 2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.amber,
              borderRadius: BorderRadius.circular(25),
            ),
            child: const Icon(
              Icons.person,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your Ranking',
                  style: TextStyle(
                    color: Colors.amber[700],
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
                Text(
                  user.userName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                if (tier != null)
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: _getTierColor(tier.name),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          tier.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '#${user.rank}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.amber,
                ),
              ),
              Text(
                '${user.eloRating.currentRating} ELO',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                '${user.totalWins}W/${user.totalLosses}L',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search players...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: (value) {
              setState(() => _searchQuery = value);
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text('Filter by Rank: '),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButton<String>(
                  value: _selectedFilter,
                  isExpanded: true,
                  underline: const SizedBox(),
                  items: [
                    const DropdownMenuItem(
                      value: 'all',
                      child: Text('All Ranks'),
                    ),
                    ..._rankTiers.map((tier) => DropdownMenuItem(
                          value: tier.name.toLowerCase(),
                          child: Row(
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: _getTierColor(tier.name),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(tier.name),
                            ],
                          ),
                        )),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedFilter = value ?? 'all');
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabView() {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All Time'),
            Tab(text: 'This Week'),
            Tab(text: 'This Month'),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildLeaderboardList(),
              _buildLeaderboardList(),
              _buildLeaderboardList(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardList() {
    final entries = _currentEntries;
    
    if (entries.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.emoji_events_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No players found',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey[600],
              ),
            ),
            if (_searchQuery.isNotEmpty)
              Text(
                'Try adjusting your search',
                style: TextStyle(
                  color: Colors.grey[500],
                ),
              ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: entries.length,
      itemBuilder: (context, index) {
        return _buildLeaderboardItem(entries[index], index);
      },
    );
  }

  Widget _buildLeaderboardItem(LeaderboardEntry entry, int index) {
    final tier = _getRankTier(entry.rankTier);
    final isCurrentUser = entry.userId == widget.userId;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: isCurrentUser 
            ? Colors.amber.withOpacity(0.1)
            : null,
        border: isCurrentUser 
            ? Border.all(color: Colors.amber, width: 1)
            : null,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Card(
        elevation: isCurrentUser ? 4 : 1,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          leading: _buildRankBadge(entry.rank),
          title: Row(
            children: [
              Expanded(
                child: Text(
                  entry.userName,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isCurrentUser ? Colors.amber[700] : null,
                  ),
                ),
              ),
              if (tier != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _getTierColor(tier.name),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    tier.name,
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
              if (entry.realName != null && entry.realName!.isNotEmpty)
                Text(
                  entry.realName!,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
              Row(
                children: [
                  Text(
                    '${entry.totalWins}W/${entry.totalLosses}L',
                    style: const TextStyle(fontSize: 12),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Win Rate: ${(entry.winRate * 100).toStringAsFixed(1)}%',
                    style: TextStyle(
                      fontSize: 12,
                      color: entry.winRate >= 0.6 
                          ? Colors.green 
                          : entry.winRate >= 0.4 
                              ? Colors.orange 
                              : Colors.red,
                    ),
                  ),
                ],
              ),
            ],
          ),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${entry.eloRating.currentRating}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              Text(
                'ELO',
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey[600],
                ),
              ),
              if (entry.eloRating.change != 0)
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      entry.eloRating.change > 0
                          ? Icons.trending_up
                          : Icons.trending_down,
                      size: 12,
                      color: entry.eloRating.change > 0
                          ? Colors.green
                          : Colors.red,
                    ),
                    Text(
                      '${entry.eloRating.change > 0 ? '+' : ''}${entry.eloRating.change}',
                      style: TextStyle(
                        fontSize: 10,
                        color: entry.eloRating.change > 0
                            ? Colors.green
                            : Colors.red,
                      ),
                    ),
                  ],
                ),
            ],
          ),
          onTap: () => _showPlayerDetails(entry),
        ),
      ),
    );
  }

  Widget _buildRankBadge(int rank) {
    Color badgeColor;
    IconData icon;
    
    if (rank == 1) {
      badgeColor = Colors.amber;
      icon = Icons.emoji_events;
    } else if (rank == 2) {
      badgeColor = Colors.grey[400]!;
      icon = Icons.emoji_events;
    } else if (rank == 3) {
      badgeColor = Colors.brown;
      icon = Icons.emoji_events;
    } else {
      badgeColor = Colors.blue;
      icon = Icons.person;
    }

    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (rank <= 3)
            Icon(
              icon,
              color: Colors.white,
              size: 16,
            )
          else
            Text(
              '#$rank',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
        ],
      ),
    );
  }

  Color _getTierColor(String tierName) {
    switch (tierName.toLowerCase()) {
      case 'bronze':
        return Colors.brown;
      case 'silver':
        return Colors.grey;
      case 'gold':
        return Colors.amber;
      case 'platinum':
        return Colors.cyan;
      case 'diamond':
        return Colors.blue;
      case 'master':
        return Colors.purple;
      case 'grandmaster':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  RankTier? _getRankTier(String tierName) {
    try {
      return _rankTiers.firstWhere(
        (tier) => tier.name.toLowerCase() == tierName.toLowerCase(),
      );
    } catch (e) {
      return null;
    }
  }

  void _showPlayerDetails(LeaderboardEntry entry) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildPlayerDetailsSheet(entry),
    );
  }

  Widget _buildPlayerDetailsSheet(LeaderboardEntry entry) {
    final tier = _getRankTier(entry.rankTier);
    
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: _getTierColor(entry.rankTier),
                          borderRadius: BorderRadius.circular(30),
                        ),
                        child: const Icon(
                          Icons.person,
                          color: Colors.white,
                          size: 36,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              entry.userName,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (entry.realName != null && entry.realName!.isNotEmpty)
                              Text(
                                entry.realName!,
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey[600],
                                ),
                              ),
                            Row(
                              children: [
                                Text(
                                  '#${entry.rank}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.amber,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                if (tier != null)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _getTierColor(tier.name),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      tier.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  // Player statistics cards would go here
                  // This could be expanded with more detailed stats
                  Expanded(
                    child: GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      children: [
                        _buildStatCard(
                          'ELO Rating',
                          '${entry.eloRating.currentRating}',
                          Icons.trending_up,
                          Colors.blue,
                        ),
                        _buildStatCard(
                          'Win Rate',
                          '${(entry.winRate * 100).toStringAsFixed(1)}%',
                          Icons.percent,
                          Colors.green,
                        ),
                        _buildStatCard(
                          'Total Wins',
                          '${entry.totalWins}',
                          Icons.emoji_events,
                          Colors.amber,
                        ),
                        _buildStatCard(
                          'Total Games',
                          '${entry.totalWins + entry.totalLosses}',
                          Icons.sports_esports,
                          Colors.purple,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
