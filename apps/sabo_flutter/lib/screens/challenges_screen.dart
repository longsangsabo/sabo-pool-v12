import 'package:flutter/material.dart';

class ChallengesScreen extends StatefulWidget {
  const ChallengesScreen({super.key});

  @override
  State<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends State<ChallengesScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late ScrollController _scrollController;
  bool _showScrollToTop = false;

  // Mock data for challenges
  final List<Map<String, dynamic>> _challenges = [
    {
      'id': '1',
      'title': 'Thách đấu 9-Ball Pro',
      'challenger_name': 'Cao Thủ Minh',
      'challenger_avatar': null,
      'bet_amount': 500000,
      'game_type': '9-Ball',
      'status': 'pending',
      'time_limit': '30 phút',
      'skill_level': 'Pro',
      'description': 'Ai dám thách đấu với tôi?',
      'created_at': DateTime.now().subtract(const Duration(minutes: 5)),
    },
    {
      'id': '2',
      'title': 'Kèo 8-Ball 200k',
      'challenger_name': 'Bida King',
      'challenger_avatar': null,
      'bet_amount': 200000,
      'game_type': '8-Ball',
      'status': 'live',
      'time_limit': '45 phút',
      'skill_level': 'Intermediate',
      'description': 'Bàn 2, ai tới tìm tôi!',
      'created_at': DateTime.now().subtract(const Duration(minutes: 15)),
    },
    {
      'id': '3',
      'title': 'Thách đấu Carom',
      'challenger_name': 'Pool Master',
      'challenger_avatar': null,
      'bet_amount': 100000,
      'game_type': 'Carom',
      'status': 'accepted',
      'time_limit': '20 phút',
      'skill_level': 'Beginner',
      'description': 'Newbie muốn học hỏi',
      'created_at': DateTime.now().subtract(const Duration(hours: 1)),
    },
    {
      'id': '4',
      'title': 'My Challenge 1',
      'challenger_name': 'Tôi',
      'challenger_avatar': null,
      'bet_amount': 300000,
      'game_type': '9-Ball',
      'status': 'pending',
      'time_limit': '30 phút',
      'skill_level': 'Pro',
      'description': 'Tôi thách đấu ai dám nhận?',
      'created_at': DateTime.now().subtract(const Duration(minutes: 10)),
      'is_mine': true,
    },
    {
      'id': '5',
      'title': 'My Match Tomorrow',
      'challenger_name': 'Tôi',
      'challenger_avatar': null,
      'bet_amount': 400000,
      'game_type': '8-Ball',
      'status': 'accepted',
      'time_limit': '45 phút',
      'skill_level': 'Pro',
      'description': 'Trận đấu ngày mai',
      'scheduled_time': DateTime.now().add(const Duration(days: 1)),
      'is_mine': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _scrollController = ScrollController();

    _scrollController.addListener(() {
      if (_scrollController.offset > 200 && !_showScrollToTop) {
        setState(() {
          _showScrollToTop = true;
        });
      } else if (_scrollController.offset <= 200 && _showScrollToTop) {
        setState(() {
          _showScrollToTop = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1a1a1a),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFF1a1a1a),
                  Color(0xFF2a2a2a),
                ],
              ),
            ),
          ),
          Column(
            children: [
              const SizedBox(height: 40),
              _buildHeader(),
              _buildTabBar(),
              Expanded(child: _buildTabContent()),
              _buildBottomStats(),
            ],
          ),
          _buildFloatingButtons(),
          if (_showScrollToTop)
            Positioned(
              bottom: 100,
              right: 20,
              child: FloatingActionButton(
                mini: true,
                backgroundColor: const Color(0xFF4CAF50),
                onPressed: () {
                  _scrollController.animateTo(
                    0,
                    duration: const Duration(milliseconds: 500),
                    curve: Curves.easeInOut,
                  );
                },
                child: const Icon(Icons.keyboard_arrow_up, color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Text(
                          '🏆 THÁCH ĐẤU 🎯',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFF4CAF50),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Hệ thống mới - Trải nghiệm tối ưu! ⚡',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withAlpha(180),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: _handleRefresh,
                icon: Icon(
                  Icons.refresh,
                  size: 16,
                  color: Colors.white.withAlpha(200),
                ),
                label: const Text('Làm mới'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2D3748),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: _showCreateChallengeDialog,
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Tạo Thách Đấu 🎯'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF2D3748),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: const Color(0xFF4CAF50),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white.withAlpha(150),
        tabs: [
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.people, size: 16),
                const SizedBox(width: 8),
                const Text('Cộng đồng'),
                const SizedBox(width: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${_getCommunityCount()}',
                    style: const TextStyle(fontSize: 10, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person, size: 16),
                const SizedBox(width: 8),
                const Text('Của tôi'),
                const SizedBox(width: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    '${_getMyCount()}',
                    style: const TextStyle(fontSize: 10, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent() {
    return TabBarView(
      controller: _tabController,
      children: [
        _buildCommunityTab(),
        _buildMyTab(),
      ],
    );
  }

  Widget _buildCommunityTab() {
    final communityKeo = _challenges
        .where((c) => c['status'] == 'pending' && c['is_mine'] != true)
        .toList();
    final communityLive = _challenges
        .where((c) => c['status'] == 'live' && c['is_mine'] != true)
        .toList();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (communityLive.isNotEmpty) ...[
            _buildSectionHeader(
                '🔥 ĐANG LIVE', communityLive.length, Colors.red),
            ...communityLive
                .map((challenge) => _buildChallengeCard(challenge, true)),
            const SizedBox(height: 20),
          ],

          if (communityKeo.isNotEmpty) ...[
            _buildSectionHeader(
                '🎯 KÈO MỚI', communityKeo.length, const Color(0xFF4CAF50)),
            ...communityKeo
                .map((challenge) => _buildChallengeCard(challenge, false)),
          ],

          const SizedBox(height: 100), // Space for floating buttons
        ],
      ),
    );
  }

  Widget _buildMyTab() {
    final myPending = _challenges
        .where((c) => c['is_mine'] == true && c['status'] == 'pending')
        .toList();
    final myAccepted = _challenges
        .where((c) => c['is_mine'] == true && c['status'] == 'accepted')
        .toList();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (myPending.isNotEmpty) ...[
            _buildSectionHeader(
                '⏳ ĐỢI ĐỐI THỦ', myPending.length, const Color(0xFFFFA726)),
            ...myPending.map((challenge) =>
                _buildChallengeCard(challenge, false, isMine: true)),
            const SizedBox(height: 20),
          ],

          if (myAccepted.isNotEmpty) ...[
            _buildSectionHeader(
                '📅 SẮP TỚI', myAccepted.length, const Color(0xFF2196F3)),
            ...myAccepted.map((challenge) =>
                _buildChallengeCard(challenge, false, isMine: true)),
          ],

          const SizedBox(height: 100), // Space for floating buttons
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, int count, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withAlpha(50),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(Map<String, dynamic> challenge, bool isLive,
      {bool isMine = false}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF2D3748),
        borderRadius: BorderRadius.circular(16),
        border: isLive ? Border.all(color: Colors.red, width: 2) : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(50),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: const Color(0xFF4CAF50),
                  child: Text(
                    challenge['challenger_name'][0],
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
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
                              challenge['title'],
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          if (isLive)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.red,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'LIVE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                      Text(
                        'bởi ${challenge['challenger_name']}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withAlpha(150),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              challenge['description'],
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withAlpha(180),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Info chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildInfoChip('💰 ${_formatPrice(challenge['bet_amount'])}',
                    const Color(0xFFFFA726)),
                _buildInfoChip(
                    '🎱 ${challenge['game_type']}', const Color(0xFF2196F3)),
                _buildInfoChip(
                    '⏱️ ${challenge['time_limit']}', const Color(0xFF9C27B0)),
                _buildInfoChip(
                    '🏆 ${challenge['skill_level']}', const Color(0xFF4CAF50)),
              ],
            ),
          ),

          // Actions
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                if (!isMine) ...[
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _joinChallenge(challenge['id']),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4CAF50),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Tham gia'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _showChallengeDetails(challenge),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF667eea),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Chi tiết'),
                    ),
                  ),
                ] else ...[
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _cancelChallenge(challenge['id']),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Hủy'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _showChallengeDetails(challenge),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF667eea),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Chi tiết'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoChip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(50),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withAlpha(100)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildFloatingButtons() {
    return Positioned(
      bottom: 20,
      right: 20,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.extended(
            onPressed: _showCreateChallengeDialog,
            backgroundColor: const Color(0xFFFF5722),
            foregroundColor: Colors.white,
            icon: const Icon(Icons.local_fire_department),
            label: const Text('KHIÊU CHIẾN NGAY'),
          ),
          const SizedBox(height: 12),
          FloatingActionButton(
            onPressed: _showSupportDialog,
            backgroundColor: const Color(0xFF2D3748),
            foregroundColor: Colors.white,
            child: const Icon(Icons.help_outline),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomStats() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2D3748),
        border: Border(
          top: BorderSide(color: Colors.white.withAlpha(50)),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.track_changes,
                      color: Colors.white, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${_challenges.length}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Text(
                'Tổng kèo',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withAlpha(150),
                ),
              ),
            ],
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department,
                      color: Colors.red, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${_challenges.where((c) => c['status'] == 'live').length}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.red,
                    ),
                  ),
                ],
              ),
              Text(
                'Đang live',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withAlpha(150),
                ),
              ),
            ],
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.emoji_events,
                      color: Color(0xFF4CAF50), size: 16),
                  const SizedBox(width: 4),
                  Text(
                    '${_challenges.where((c) => c['is_mine'] == true && c['status'] == 'completed').length}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF4CAF50),
                    ),
                  ),
                ],
              ),
              Text(
                'Đã xong',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.white.withAlpha(150),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatPrice(int price) {
    return '${(price / 1000).toStringAsFixed(0)}k VND';
  }

  int _getCommunityCount() {
    return _challenges.where((c) => c['is_mine'] != true).length;
  }

  int _getMyCount() {
    return _challenges.where((c) => c['is_mine'] == true).length;
  }

  void _handleRefresh() async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Dữ liệu mới nhất đã sẵn sàng! 🚀'),
        backgroundColor: Color(0xFF4CAF50),
      ),
    );
  }

  void _showCreateChallengeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Tạo thách đấu',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Chức năng tạo thách đấu sẽ được phát triển sớm!',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _joinChallenge(String challengeId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('🎯 Kèo ngon đã sẵn sàng! Chuẩn bị đối đầu nào! 🔥'),
        backgroundColor: Color(0xFF4CAF50),
      ),
    );
  }

  void _cancelChallenge(String challengeId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Hủy thách đấu',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Bạn có chắc chắn muốn hủy thách đấu này?',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Không'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('🚫 Đã hủy thách đấu thành công!'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hủy'),
          ),
        ],
      ),
    );
  }

  void _showChallengeDetails(Map<String, dynamic> challenge) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: Color(0xFF2D3748),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 10),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(100),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      challenge['title'],
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      challenge['description'],
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withAlpha(180),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Challenge details would go here
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4CAF50),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Đóng'),
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

  void _showSupportDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Hỗ trợ',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Liên hệ hỗ trợ qua email: support@sabopool.com',
          style: TextStyle(color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}
