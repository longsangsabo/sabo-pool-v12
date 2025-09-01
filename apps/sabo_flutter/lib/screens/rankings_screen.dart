import 'package:flutter/material.dart';
import '../components/ui/EnhancedLeaderboard.dart';

class RankingsScreen extends StatelessWidget {
  const RankingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rankings'),
        centerTitle: true,
      ),
      body: const EnhancedLeaderboard(
        userId: 'current_user_id',
        showCurrentUser: true,
        itemsPerPage: 25,
      ),
    );
  }
}

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _fetchData();
    _animationController.forward();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _fetchData() async {
    await Future.delayed(const Duration(milliseconds: 500));

    setState(() {
      _currentPlayer = Player(
        id: 'current_user',
        name: 'Nguyễn Văn An',
        avatar: 'https://via.placeholder.com/150',
        elo: 1350,
        spa: 1250,
        monthlyWins: 12,
        tier: 'Hạng III',
        rank: 23,
        winRate: 68.9,
        totalMatches: 45,
        location: 'TP.HCM',
      );

      _eloLeaderboard = [
        Player(
          id: '1',
          name: 'Trần Văn B',
          avatar: 'https://via.placeholder.com/150',
          elo: 1850,
          spa: 2150,
          monthlyWins: 28,
          tier: 'Hạng I',
          rank: 1,
          winRate: 89.2,
          totalMatches: 156,
          location: 'Hà Nội',
        ),
        Player(
          id: '2',
          name: 'Lê Thị C',
          avatar: 'https://via.placeholder.com/150',
          elo: 1780,
          spa: 1980,
          monthlyWins: 25,
          tier: 'Hạng I',
          rank: 2,
          winRate: 84.7,
          totalMatches: 134,
          location: 'TP.HCM',
        ),
        Player(
          id: '3',
          name: 'Phạm Văn D',
          avatar: 'https://via.placeholder.com/150',
          elo: 1720,
          spa: 1850,
          monthlyWins: 22,
          tier: 'Hạng I',
          rank: 3,
          winRate: 81.3,
          totalMatches: 121,
          location: 'Đà Nẵng',
        ),
        Player(
          id: '4',
          name: 'Hoàng Thị E',
          avatar: 'https://via.placeholder.com/150',
          elo: 1680,
          spa: 1750,
          monthlyWins: 20,
          tier: 'Hạng II',
          rank: 4,
          winRate: 78.9,
          totalMatches: 114,
          location: 'TP.HCM',
        ),
        Player(
          id: '5',
          name: 'Vũ Văn F',
          avatar: 'https://via.placeholder.com/150',
          elo: 1620,
          spa: 1680,
          monthlyWins: 18,
          tier: 'Hạng II',
          rank: 5,
          winRate: 75.2,
          totalMatches: 98,
          location: 'Hà Nội',
        ),
        // Add current player to show relative position
        _currentPlayer!,
      ];

      _spaLeaderboard = List.from(_eloLeaderboard)
        ..sort((a, b) => b.spa.compareTo(a.spa));

      _monthlyLeaderboard = List.from(_eloLeaderboard)
        ..sort((a, b) => b.monthlyWins.compareTo(a.monthlyWins));

      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0B),
      body: _loading ? _buildLoading() : _buildContent(),
    );
  }

  Widget _buildLoading() {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4CAF50)),
      ),
    );
  }

  Widget _buildContent() {
    return FadeTransition(
      opacity: _fadeInAnimation,
      child: CustomScrollView(
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildCurrentPlayerCard(),
                const SizedBox(height: 16),
                _buildTabBar(),
                SizedBox(
                  height: MediaQuery.of(context).size.height * 0.6,
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildEloLeaderboard(),
                      _buildSpaLeaderboard(),
                      _buildMonthlyLeaderboard(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF1A1A1B),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () => Navigator.pop(context),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF1A1A1B),
                Color(0xFF0A0A0B),
              ],
            ),
          ),
          child: const Center(
            child: Padding(
              padding: EdgeInsets.only(top: 40),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Bảng Xếp Hạng',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Cạnh tranh và so sánh kỹ năng',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCurrentPlayerCard() {
    if (_currentPlayer == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF4CAF50),
            Color(0xFF2E7D32),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4CAF50).withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundImage: NetworkImage(_currentPlayer!.avatar),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _currentPlayer!.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Hạng ${_currentPlayer!.rank} • ${_currentPlayer!.tier}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _buildStatChip('ELO', _currentPlayer!.elo.toString()),
                    const SizedBox(width: 8),
                    _buildStatChip('SPA', _currentPlayer!.spa.toString()),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              Text(
                '#${_currentPlayer!.rank}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Text(
                'Xếp hạng',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      color: const Color(0xFF1A1A1B),
      child: TabBar(
        controller: _tabController,
        indicatorColor: const Color(0xFF4CAF50),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white54,
        tabs: const [
          Tab(text: 'ELO'),
          Tab(text: 'SPA'),
          Tab(text: 'Tháng này'),
        ],
      ),
    );
  }

  Widget _buildEloLeaderboard() {
    return _buildLeaderboard(_eloLeaderboard, 'elo');
  }

  Widget _buildSpaLeaderboard() {
    return _buildLeaderboard(_spaLeaderboard, 'spa');
  }

  Widget _buildMonthlyLeaderboard() {
    return _buildLeaderboard(_monthlyLeaderboard, 'monthly');
  }

  Widget _buildLeaderboard(List<Player> players, String type) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: players.length,
      itemBuilder: (context, index) {
        final player = players[index];
        final isCurrentUser = player.id == _currentPlayer?.id;

        if (isCurrentUser && index > 5) {
          // Show separator before current user if they're not in top 5
          return Column(
            children: [
              if (index == 6) _buildSeparator(),
              _buildPlayerCard(player, index + 1, type, isCurrentUser),
            ],
          );
        }

        return _buildPlayerCard(player, index + 1, type, isCurrentUser);
      },
    );
  }

  Widget _buildSeparator() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          const Expanded(child: Divider(color: Colors.white54)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1B),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white54),
            ),
            child: const Text(
              'Vị trí của bạn',
              style: TextStyle(
                color: Colors.white54,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const Expanded(child: Divider(color: Colors.white54)),
        ],
      ),
    );
  }

  Widget _buildPlayerCard(Player player, int position, String type, bool isCurrentUser) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isCurrentUser 
          ? const Color(0xFF4CAF50).withOpacity(0.1)
          : const Color(0xFF1A1A1B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCurrentUser 
            ? const Color(0xFF4CAF50) 
            : const Color(0xFF333333),
          width: isCurrentUser ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          _buildRankBadge(position),
          const SizedBox(width: 12),
          CircleAvatar(
            radius: 24,
            backgroundImage: NetworkImage(player.avatar),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        player.name,
                        style: TextStyle(
                          color: isCurrentUser ? const Color(0xFF4CAF50) : Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    if (isCurrentUser)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4CAF50),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'Bạn',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                  ],
                ),
                Text(
                  '${player.tier} • ${player.location}',
                  style: const TextStyle(
                    color: Colors.white54,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                _buildPlayerStats(player, type),
              ],
            ),
          ),
          _buildMainStat(player, type),
        ],
      ),
    );
  }

  Widget _buildRankBadge(int position) {
    Color badgeColor;
    IconData? icon;

    if (position == 1) {
      badgeColor = const Color(0xFFFFD700); // Gold
      icon = Icons.emoji_events;
    } else if (position == 2) {
      badgeColor = const Color(0xFFC0C0C0); // Silver
      icon = Icons.emoji_events;
    } else if (position == 3) {
      badgeColor = const Color(0xFFCD7F32); // Bronze
      icon = Icons.emoji_events;
    } else {
      badgeColor = const Color(0xFF666666);
    }

    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Center(
        child: icon != null
          ? Icon(icon, color: Colors.white, size: 18)
          : Text(
              position.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),
      ),
    );
  }

  Widget _buildPlayerStats(Player player, String type) {
    return Row(
      children: [
        if (type != 'elo') 
          _buildStatBadge('ELO', player.elo.toString(), Colors.blue),
        if (type != 'spa') ...[
          if (type != 'elo') const SizedBox(width: 4),
          _buildStatBadge('SPA', player.spa.toString(), Colors.orange),
        ],
        if (type == 'monthly') ...[
          const SizedBox(width: 4),
          _buildStatBadge('Thắng', player.monthlyWins.toString(), Colors.green),
        ],
        const SizedBox(width: 4),
        _buildStatBadge('WR', '${player.winRate.toStringAsFixed(1)}%', Colors.purple),
      ],
    );
  }

  Widget _buildStatBadge(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.5), width: 0.5),
      ),
      child: Text(
        '$label: $value',
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildMainStat(Player player, String type) {
    String value;
    String label;
    Color color;

    switch (type) {
      case 'elo':
        value = player.elo.toString();
        label = 'ELO';
        color = Colors.blue;
        break;
      case 'spa':
        value = player.spa.toString();
        label = 'SPA';
        color = Colors.orange;
        break;
      case 'monthly':
        value = player.monthlyWins.toString();
        label = 'Thắng';
        color = Colors.green;
        break;
      default:
        value = player.elo.toString();
        label = 'ELO';
        color = Colors.blue;
    }

    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: color.withOpacity(0.7),
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

// Player model for rankings
class Player {
  final String id;
  final String name;
  final String avatar;
  final int elo;
  final int spa;
  final int monthlyWins;
  final String tier;
  final int rank;
  final double winRate;
  final int totalMatches;
  final String location;

  Player({
    required this.id,
    required this.name,
    required this.avatar,
    required this.elo,
    required this.spa,
    required this.monthlyWins,
    required this.tier,
    required this.rank,
    required this.winRate,
    required this.totalMatches,
    required this.location,
  });
}
