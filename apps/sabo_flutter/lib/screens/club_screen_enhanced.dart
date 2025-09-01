import 'package:flutter/material.dart';

class ClubScreen extends StatefulWidget {
  const ClubScreen({super.key});

  @override
  State<ClubScreen> createState() => _ClubScreenState();
}

class _ClubScreenState extends State<ClubScreen> {
  late ScrollController _scrollController;
  bool _showScrollToTop = false;
  String _searchQuery = '';
  String _selectedFilter = 'all';

  // Mock data for clubs
  final List<Map<String, dynamic>> _clubs = [
    {
      'id': '1',
      'name': 'Elite Billiards',
      'description': 'Câu lạc bộ bida cao cấp với trang thiết bị hiện đại',
      'address': '123 Nguyễn Huệ, Q1, TP.HCM',
      'phone': '028 3824 5678',
      'hourly_rate': 80000,
      'available_tables': 12,
      'priority_score': 4.8,
      'is_sabo_owned': true,
      'image': null,
    },
    {
      'id': '2',
      'name': 'Pro Pool Arena',
      'description': 'Không gian thoải mái cho mọi cấp độ chơi bida',
      'address': '456 Lê Lợi, Q3, TP.HCM',
      'phone': '028 3824 9876',
      'hourly_rate': 60000,
      'available_tables': 8,
      'priority_score': 4.5,
      'is_sabo_owned': false,
      'image': null,
    },
    {
      'id': '3',
      'name': 'Champions Arena',
      'description': 'Nơi tập trung của các cao thủ bida chuyên nghiệp',
      'address': '789 Trần Hưng Đạo, Q5, TP.HCM',
      'phone': '028 3824 1234',
      'hourly_rate': 100000,
      'available_tables': 6,
      'priority_score': 4.9,
      'is_sabo_owned': true,
      'image': null,
    },
    {
      'id': '4',
      'name': 'Starter Club',
      'description': 'Câu lạc bộ thân thiện dành cho người mới bắt đầu',
      'address': '321 Võ Văn Tần, Q3, TP.HCM',
      'phone': '028 3824 5555',
      'hourly_rate': 45000,
      'available_tables': 10,
      'priority_score': 4.2,
      'is_sabo_owned': false,
      'image': null,
    },
    {
      'id': '5',
      'name': 'VIP Billiards Lounge',
      'description': 'Không gian VIP sang trọng với dịch vụ cao cấp',
      'address': '555 Nguyễn Thị Minh Khai, Q1, TP.HCM',
      'phone': '028 3824 7777',
      'hourly_rate': 120000,
      'available_tables': 4,
      'priority_score': 4.7,
      'is_sabo_owned': true,
      'image': null,
    },
  ];

  @override
  void initState() {
    super.initState();
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
              Expanded(child: _buildClubList()),
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
                  'Câu lạc bộ',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  'Khám phá các câu lạc bộ bida chất lượng cao',
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
              Icons.location_on,
              color: Color(0xFF4CAF50),
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
                hintText: 'Tìm kiếm câu lạc bộ...',
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
          // Filter options
          Row(
            children: [
              Expanded(
                child: _buildFilterChip('Tất cả', 'all'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildFilterChip('SABO Official', 'sabo'),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildFilterChip('Giá tốt', 'price'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF4CAF50) : const Color(0xFF2D3748),
          borderRadius: BorderRadius.circular(20),
          border: isSelected
              ? null
              : Border.all(
                  color: Colors.white.withAlpha(100),
                  width: 1,
                ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : Colors.white.withAlpha(180),
          ),
        ),
      ),
    );
  }

  Widget _buildClubList() {
    final filteredClubs = _clubs.where((club) {
      final matchesSearch =
          club['name'].toLowerCase().contains(_searchQuery.toLowerCase()) ||
              club['description']
                  .toLowerCase()
                  .contains(_searchQuery.toLowerCase());

      bool matchesFilter = true;
      if (_selectedFilter == 'sabo') {
        matchesFilter = club['is_sabo_owned'] == true;
      } else if (_selectedFilter == 'price') {
        matchesFilter = club['hourly_rate'] <= 60000;
      }

      return matchesSearch && matchesFilter;
    }).toList();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: filteredClubs.map((club) => _buildClubCard(club)).toList(),
      ),
    );
  }

  Widget _buildClubCard(Map<String, dynamic> club) {
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
          // Club header
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              club['name'],
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          if (club['is_sabo_owned'])
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [
                                    Color(0xFFFFA726),
                                    Color(0xFFFF9800)
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'SABO Official',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        club['description'],
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withAlpha(180),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Club details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _buildDetailRow('Địa chỉ', club['address'], Icons.location_on,
                    const Color(0xFF4CAF50)),
                _buildDetailRow('Điện thoại', club['phone'], Icons.phone,
                    const Color(0xFF2196F3)),
                _buildDetailRow(
                    'Giá giờ',
                    '${_formatPrice(club['hourly_rate'])}/giờ',
                    Icons.attach_money,
                    const Color(0xFFFFA726)),
                _buildDetailRow('Số bàn', '${club['available_tables']} bàn',
                    Icons.table_restaurant, const Color(0xFF9C27B0)),
                _buildDetailRow('Đánh giá', '${club['priority_score']} ⭐',
                    Icons.star, const Color(0xFFFF9800)),
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
                    onPressed: () => _showClubDetails(club),
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
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _showBookingDialog(club),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4CAF50),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('Đặt bàn'),
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

  String _formatPrice(int price) {
    return '${(price / 1000).toStringAsFixed(0)}k VND';
  }

  void _showClubDetails(Map<String, dynamic> club) {
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
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            club['name'],
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        if (club['is_sabo_owned'])
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFFA726), Color(0xFFFF9800)],
                              ),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'SABO Official',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      club['description'],
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withAlpha(180),
                      ),
                    ),
                    const SizedBox(height: 24),
                    _buildDetailRow('Địa chỉ', club['address'],
                        Icons.location_on, const Color(0xFF4CAF50)),
                    _buildDetailRow('Điện thoại', club['phone'], Icons.phone,
                        const Color(0xFF2196F3)),
                    _buildDetailRow(
                        'Giá giờ',
                        '${_formatPrice(club['hourly_rate'])}/giờ',
                        Icons.attach_money,
                        const Color(0xFFFFA726)),
                    _buildDetailRow('Số bàn', '${club['available_tables']} bàn',
                        Icons.table_restaurant, const Color(0xFF9C27B0)),
                    _buildDetailRow('Đánh giá', '${club['priority_score']} ⭐',
                        Icons.star, const Color(0xFFFF9800)),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => _showBookingDialog(club),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF4CAF50),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Đặt bàn ngay'),
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

  void _showBookingDialog(Map<String, dynamic> club) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D3748),
        title: const Text(
          'Đặt bàn',
          style: TextStyle(color: Colors.white),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Bạn muốn đặt bàn tại "${club['name']}"?',
              style: TextStyle(color: Colors.white.withAlpha(180)),
            ),
            const SizedBox(height: 16),
            Text(
              'Giá: ${_formatPrice(club['hourly_rate'])}/giờ',
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
                  content: Text('Đặt bàn thành công!'),
                  backgroundColor: Color(0xFF4CAF50),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4CAF50),
            ),
            child: const Text('Đặt bàn'),
          ),
        ],
      ),
    );
  }
}
