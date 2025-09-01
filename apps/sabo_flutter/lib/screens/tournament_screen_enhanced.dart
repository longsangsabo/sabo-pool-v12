import 'package:flutter/material.dart';

class TournamentScreenEnhanced extends StatefulWidget {
  const TournamentScreenEnhanced({super.key});

  @override
  State<TournamentScreenEnhanced> createState() =>
      _TournamentScreenEnhancedState();
}

class _TournamentScreenEnhancedState extends State<TournamentScreenEnhanced>
    with TickerProviderStateMixin {
  late TabController _tabController;
  late ScrollController _scrollController;
  bool _showScrollToTop = false;
  String _searchQuery = '';
  String _selectedFilter = 'all';

  // Mock data for tournaments
  final List<Map<String, dynamic>> _tournaments = [
    {
      'id': '1',
      'name': 'Championship Monthly',
      'description': 'Giải đấu hàng tháng cho những cao thủ',
      'status': 'registration_open',
      'start_date': '2025-09-15',
      'prize_pool': '5,000,000',
      'participants': 32,
      'max_participants': 64,
      'entry_fee': '50,000',
      'club_name': 'Elite Billiards',
      'image': null,
    },
    {
      'id': '2',
      'name': 'Weekly Challenge',
      'description': 'Thách đấu hàng tuần dành cho mọi cấp độ',
      'status': 'ongoing',
      'start_date': '2025-09-08',
      'prize_pool': '1,500,000',
      'participants': 16,
      'max_participants': 32,
      'entry_fee': '25,000',
      'club_name': 'Pro Pool Arena',
      'image': null,
    },
    {
      'id': '3',
      'name': 'Beginner Cup',
      'description': 'Giải đấu dành cho người mới bắt đầu',
      'status': 'upcoming',
      'start_date': '2025-09-20',
      'prize_pool': '800,000',
      'participants': 8,
      'max_participants': 16,
      'entry_fee': '20,000',
      'club_name': 'Starter Club',
      'image': null,
    },
    {
      'id': '4',
      'name': 'Grand Masters',
      'description': 'Giải đấu đẳng cấp cho các cao thủ',
      'status': 'completed',
      'start_date': '2025-08-30',
      'prize_pool': '10,000,000',
      'participants': 16,
      'max_participants': 16,
      'entry_fee': '100,000',
      'club_name': 'Champions Arena',
      'image': null,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
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
              _buildSearchAndFilter(),
              _buildTabBar(),
              Expanded(child: _buildTabContent()),
            ],
          ),
          if (_showScrollToTop)
            Positioned(
              bottom: 20,
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
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF667eea),
        onPressed: _showCreateTournamentDialog,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Giải đấu',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Tham gia và thể hiện kỹ năng của bạn',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withAlpha(180),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF2D3748),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.emoji_events,
              color: Color(0xFFFFA726),
              size: 24,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return Container(
      margin: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Search bar
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF2D3748),
              borderRadius: BorderRadius.circular(12),
            ),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Tìm kiếm giải đấu...',
                hintStyle: TextStyle(color: Colors.white.withAlpha(150)),
                prefixIcon: const Icon(Icons.search, color: Colors.white),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(16),
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
            ),
          ),
          const SizedBox(height: 12),
          // Filter dropdown
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF2D3748),
              borderRadius: BorderRadius.circular(12),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedFilter,
                dropdownColor: const Color(0xFF2D3748),
                style: const TextStyle(color: Colors.white),
                icon: const Icon(Icons.filter_list, color: Colors.white),
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('Tất cả')),
                  DropdownMenuItem(
                      value: 'registration_open',
                      child: Text('Đang mở đăng ký')),
                  DropdownMenuItem(
                      value: 'ongoing', child: Text('Đang diễn ra')),
                  DropdownMenuItem(
                      value: 'upcoming', child: Text('Sắp diễn ra')),
                  DropdownMenuItem(
                      value: 'completed', child: Text('Đã kết thúc')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedFilter = value;
                    });
                  }
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF2D3748),
        borderRadius: BorderRadius.circular(12),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: const Color(0xFF4CAF50),
          borderRadius: BorderRadius.circular(8),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white.withAlpha(150),
        dividerColor: Colors.transparent,
        tabs: const [
          Tab(text: 'Tất cả'),
          Tab(text: 'Đang mở'),
          Tab(text: 'Đang diễn ra'),
          Tab(text: 'Sắp tới'),
        ],
      ),
    );
  }

  Widget _buildTabContent() {
    return TabBarView(
      controller: _tabController,
      children: [
        _buildTournamentList('all'),
        _buildTournamentList('registration_open'),
        _buildTournamentList('ongoing'),
        _buildTournamentList('upcoming'),
      ],
    );
  }

  Widget _buildTournamentList(String filterStatus) {
    final filteredTournaments = _tournaments.where((tournament) {
      final matchesSearch = tournament['name']
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          tournament['description']
              .toLowerCase()
              .contains(_searchQuery.toLowerCase());
      final matchesFilter =
          filterStatus == 'all' || tournament['status'] == filterStatus;
      return matchesSearch && matchesFilter;
    }).toList();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.all(20),
      child: Column(
        children: filteredTournaments
            .map((tournament) => _buildTournamentCard(tournament))
            .toList(),
      ),
    );
  }

  Widget _buildTournamentCard(Map<String, dynamic> tournament) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF2D3748),
        borderRadius: BorderRadius.circular(16),
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
          // Tournament header with status
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tournament['name'],
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        tournament['description'],
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withAlpha(180),
                        ),
                      ),
                    ],
                  ),
                ),
                _buildStatusBadge(tournament['status']),
              ],
            ),
          ),

          // Tournament details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _buildDetailRow(
                    'Giải thưởng',
                    '${tournament['prize_pool']} VND',
                    Icons.emoji_events,
                    const Color(0xFFFFA726)),
                _buildDetailRow(
                    'Phí tham gia',
                    '${tournament['entry_fee']} VND',
                    Icons.payment,
                    const Color(0xFF4CAF50)),
                _buildDetailRow(
                    'Thành viên',
                    '${tournament['participants']}/${tournament['max_participants']}',
                    Icons.people,
                    const Color(0xFF2196F3)),
                _buildDetailRow('Câu lạc bộ', tournament['club_name'],
                    Icons.location_on, const Color(0xFF9C27B0)),
                _buildDetailRow('Ngày bắt đầu', tournament['start_date'],
                    Icons.calendar_today, const Color(0xFFFF9800)),
              ],
            ),
          ),

          // Action buttons
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _showTournamentDetails(tournament),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF667eea),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Xem chi tiết'),
                  ),
                ),
                const SizedBox(width: 12),
                if (tournament['status'] == 'registration_open')
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _showRegistrationDialog(tournament),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF4CAF50),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Đăng ký'),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(
      String label, String value, IconData icon, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: color.withAlpha(50),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Icon(icon, color: color, size: 12),
          ),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withAlpha(150),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String text;

    switch (status) {
      case 'registration_open':
        color = const Color(0xFF4CAF50);
        text = 'Mở đăng ký';
        break;
      case 'ongoing':
        color = const Color(0xFF2196F3);
        text = 'Đang diễn ra';
        break;
      case 'upcoming':
        color = const Color(0xFFFF9800);
        text = 'Sắp diễn ra';
        break;
      case 'completed':
        color = const Color(0xFF9E9E9E);
        text = 'Đã kết thúc';
        break;
      default:
        color = const Color(0xFF9E9E9E);
        text = 'Không xác định';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withAlpha(50),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: color,
        ),
      ),
    );
  }

  void _showTournamentDetails(Map<String, dynamic> tournament) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
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
                      tournament['name'],
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      tournament['description'],
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withAlpha(180),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildDetailRow(
                        'Giải thưởng',
                        '${tournament['prize_pool']} VND',
                        Icons.emoji_events,
                        const Color(0xFFFFA726)),
                    _buildDetailRow(
                        'Phí tham gia',
                        '${tournament['entry_fee']} VND',
                        Icons.payment,
                        const Color(0xFF4CAF50)),
                    _buildDetailRow(
                        'Thành viên',
                        '${tournament['participants']}/${tournament['max_participants']}',
                        Icons.people,
                        const Color(0xFF2196F3)),
                    _buildDetailRow('Câu lạc bộ', tournament['club_name'],
                        Icons.location_on, const Color(0xFF9C27B0)),
                    _buildDetailRow('Ngày bắt đầu', tournament['start_date'],
                        Icons.calendar_today, const Color(0xFFFF9800)),
                    const SizedBox(height: 24),
                    if (tournament['status'] == 'registration_open')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => _showRegistrationDialog(tournament),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4CAF50),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text('Đăng ký tham gia'),
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

  void _showRegistrationDialog(Map<String, dynamic> tournament) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Đăng ký tham gia',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Bạn có muốn đăng ký tham gia giải đấu "${tournament['name']}"?',
              style: TextStyle(color: Colors.white.withAlpha(180)),
            ),
            const SizedBox(height: 16),
            Text(
              'Phí tham gia: ${tournament['entry_fee']} VND',
              style: const TextStyle(
                color: Color(0xFF4CAF50),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Đăng ký thành công!'),
                  backgroundColor: Color(0xFF4CAF50),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4CAF50),
            ),
            child: const Text('Đăng ký'),
          ),
        ],
      ),
    );
  }

  void _showCreateTournamentDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Tạo giải đấu',
          style: TextStyle(color: Colors.white),
        ),
        content: Text(
          'Bạn cần đăng ký làm chủ câu lạc bộ để tạo giải đấu.',
          style: TextStyle(color: Colors.white.withAlpha(180)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Chuyển đến trang đăng ký CLB...'),
                  backgroundColor: Color(0xFF667eea),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF667eea),
            ),
            child: const Text('Đăng ký CLB'),
          ),
        ],
      ),
    );
  }
}
