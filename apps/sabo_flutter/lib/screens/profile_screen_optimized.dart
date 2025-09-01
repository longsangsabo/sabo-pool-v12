import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../types/unified_profile.dart';
import '../components/profile/mobile_card_avatar.dart';
import '../components/profile/profile_tabs_mobile.dart';

// Optimized Mobile Profile Screen - Port từ OptimizedMobileProfile.tsx
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  String _activeTab = 'activities';
  bool _showScrollTop = false;
  late ScrollController _scrollController;

  // State management
  UnifiedProfile? _profile;
  UnifiedProfile? _editingProfile;
  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;
  PlayerStats? _stats;
  PlayerRanking? _ranking;

  @override
  void initState() {
    super.initState();

    // Animation setup
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    // Scroll controller for scroll-to-top functionality
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    // Start animation and fetch data
    _animationController.forward();
    _fetchData();
  }

  void _fetchData() async {
    // Mock profile data
    await Future.delayed(const Duration(milliseconds: 500));

    setState(() {
      _profile = const UnifiedProfile(
        id: '1',
        userId: 'user_1',
        displayName: 'Nguyễn Văn An',
        phone: '0123456789',
        bio: 'Yêu thích billiards và muốn nâng cao kỹ năng',
        skillLevel: 'intermediate',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        avatarUrl: 'https://via.placeholder.com/150',
        memberSince: '2024-01-01',
        role: 'player',
        activeRole: 'player',
        verifiedRank: 'H3',
        email: 'user@example.com',
        fullName: 'Nguyễn Văn An',
        currentRank: 'H3',
        spaPoints: 1250,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z',
        completionPercentage: 85,
      );

      _editingProfile = _profile;

      _stats = const PlayerStats(
        elo: 1350,
        spa: 1250,
        totalMatches: 45,
        winRate: 68.9,
      );

      _ranking = const PlayerRanking(
        rankingPosition: 23,
        tier: 'Hạng III',
      );

      _loading = false;
    });
  }

  void _onScroll() {
    final show = _scrollController.offset > 300;
    if (show != _showScrollTop) {
      setState(() {
        _showScrollTop = show;
      });
    }
  }

  void _handleEditField(String field, dynamic value) {
    if (_editingProfile != null) {
      setState(() {
        switch (field) {
          case 'displayName':
            _editingProfile = _editingProfile!.copyWith(displayName: value);
            break;
          case 'phone':
            _editingProfile = _editingProfile!.copyWith(phone: value);
            break;
          case 'bio':
            _editingProfile = _editingProfile!.copyWith(bio: value);
            break;
          case 'city':
            _editingProfile = _editingProfile!.copyWith(city: value);
            break;
          case 'district':
            _editingProfile = _editingProfile!.copyWith(district: value);
            break;
          case 'skillLevel':
            _editingProfile = _editingProfile!.copyWith(skillLevel: value);
            break;
        }
      });
    }
  }

  Future<bool> _handleSaveProfile() async {
    if (_editingProfile == null) return false;

    setState(() {
      _saving = true;
    });

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 1000));

      // Update profile with editing data
      setState(() {
        _profile = _editingProfile;
        _saving = false;
      });

      return true;
    } catch (e) {
      setState(() {
        _saving = false;
      });
      return false;
    }
  }

  void _handleCancelEdit() {
    setState(() {
      _editingProfile = _profile;
    });
  }

  Future<void> _handleAvatarUpload() async {
    setState(() {
      _uploading = true;
    });

    // Simulate upload
    await Future.delayed(const Duration(milliseconds: 2000));

    setState(() {
      _uploading = false;
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF0f172a) : const Color(0xFFfafafa),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeInAnimation,
          child: _loading || _profile == null
              ? _buildLoadingState(isDark)
              : Stack(
                  children: [
                    // Main Content
                    ListView(
                      controller: _scrollController,
                      padding: const EdgeInsets.only(bottom: 100),
                      children: [
                        // Avatar & Stats Section
                        Container(
                          padding: const EdgeInsets.all(8),
                          child: MobileCardAvatar(
                            userAvatar: _profile!.avatarUrl ?? '',
                            onAvatarChange: _handleAvatarUpload,
                            uploading: _uploading,
                            nickname: getDisplayName(_profile!),
                            rank: _profile!.verifiedRank ?? 'K',
                            elo: _stats?.elo ?? 1000,
                            spa: _stats?.spa ?? 0,
                            ranking: _ranking?.rankingPosition ?? 0,
                            matches: _stats?.totalMatches ?? 0,
                            isDark: isDark,
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Tabs Card
                        Container(
                          margin: const EdgeInsets.symmetric(horizontal: 8),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF1e293b).withOpacity(0.9)
                                : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDark
                                  ? Colors.grey[700]!.withOpacity(0.5)
                                  : Colors.grey[200]!,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isDark
                                    ? Colors.black.withOpacity(0.3)
                                    : Colors.grey.withOpacity(0.1),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            children: [
                              // Tabs
                              ProfileTabsMobile(
                                activeTab: _activeTab,
                                onChange: (tab) =>
                                    setState(() => _activeTab = tab),
                                isDark: isDark,
                              ),

                              // Tab Content
                              _buildTabContent(context, isDark),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),

                        // Achievements & Completion Section
                        _buildAchievementsSection(_profile!, isDark),
                      ],
                    ),

                    // Scroll to Top Button
                    if (_showScrollTop)
                      Positioned(
                        bottom: 100,
                        right: 16,
                        child: _buildScrollTopButton(isDark),
                      ),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildLoadingState(bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: isDark ? Colors.blue[300] : Colors.blue[600],
          ),
          const SizedBox(height: 16),
          Text(
            'Đang tải hồ sơ...',
            style: TextStyle(
              color: isDark ? Colors.grey[300] : Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent(BuildContext context, bool isDark) {
    switch (_activeTab) {
      case 'activities':
        return _buildActivitiesTab(isDark);
      case 'edit':
        return _buildEditTab(context, isDark);
      case 'rank':
        return _buildRankTab(isDark);
      case 'spa-history':
        return _buildSpaHistoryTab(isDark);
      case 'club':
        return _buildClubTab(isDark);
      default:
        return _buildActivitiesTab(isDark);
    }
  }

  Widget _buildActivitiesTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Activity Highlights
          Text(
            'Hoạt động nổi bật',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.grey[800]!.withOpacity(0.3)
                  : Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark
                    ? Colors.grey[700]!.withOpacity(0.3)
                    : Colors.grey[200]!,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Icon(
                    Icons.trending_up,
                    color: Colors.green[600],
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Thắng 3 trận liên tiếp',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.grey[900],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Cách đây 2 giờ',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Recent Activities
          Text(
            'Hoạt động gần đây',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 12),

          // Activity items
          ...List.generate(3, (index) => _buildActivityItem(index, isDark)),
        ],
      ),
    );
  }

  Widget _buildActivityItem(int index, bool isDark) {
    final activities = [
      {
        'title': 'Tham gia giải đấu Spring Championship',
        'time': 'Cách đây 1 ngày',
        'icon': Icons.emoji_events,
        'color': Colors.amber,
      },
      {
        'title': 'Cập nhật thông tin hồ sơ',
        'time': 'Cách đây 3 ngày',
        'icon': Icons.person,
        'color': Colors.blue,
      },
      {
        'title': 'Tham gia CLB Sài Gòn Billiards',
        'time': 'Cách đây 1 tuần',
        'icon': Icons.group,
        'color': Colors.purple,
      },
    ];

    final activity = activities[index];

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color:
            isDark ? Colors.grey[800]!.withOpacity(0.3) : Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark
              ? Colors.grey[700]!.withOpacity(0.3)
              : Colors.grey[200]!,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: (activity['color'] as Color).withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              activity['icon'] as IconData,
              color: activity['color'] as Color,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  activity['title'] as String,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isDark ? Colors.white : Colors.grey[900],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  activity['time'] as String,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditTab(BuildContext context, bool isDark) {
    final editingProfile = _editingProfile;
    if (editingProfile == null) return const SizedBox();

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Chỉnh sửa thông tin',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 20),

          // Form fields
          _buildTextField(
            label: 'Tên hiển thị',
            value: editingProfile.displayName ?? '',
            onChanged: (value) => _handleEditField('displayName', value),
            isDark: isDark,
          ),

          const SizedBox(height: 16),

          _buildTextField(
            label: 'Số điện thoại',
            value: editingProfile.phone ?? '',
            onChanged: (value) => _handleEditField('phone', value),
            isDark: isDark,
          ),

          const SizedBox(height: 16),

          _buildTextField(
            label: 'Giới thiệu',
            value: editingProfile.bio ?? '',
            onChanged: (value) => _handleEditField('bio', value),
            isDark: isDark,
            maxLines: 3,
          ),

          const SizedBox(height: 16),

          _buildTextField(
            label: 'Thành phố',
            value: editingProfile.city ?? '',
            onChanged: (value) => _handleEditField('city', value),
            isDark: isDark,
          ),

          const SizedBox(height: 24),

          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _saving
                      ? null
                      : () {
                          _handleCancelEdit();
                        },
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: isDark ? Colors.grey[600]! : Colors.grey[400]!,
                    ),
                  ),
                  child: Text(
                    'Hủy',
                    style: TextStyle(
                      color: isDark ? Colors.grey[300] : Colors.grey[700],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _saving
                      ? null
                      : () async {
                          final success = await _handleSaveProfile();
                          if (success && context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Đã lưu thông tin thành công'),
                                backgroundColor: Colors.green,
                              ),
                            );
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[600],
                  ),
                  child: _saving
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Lưu',
                          style: TextStyle(color: Colors.white),
                        ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required String value,
    required Function(String) onChanged,
    required bool isDark,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isDark ? Colors.grey[300] : Colors.grey[700],
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: value,
          onChanged: onChanged,
          maxLines: maxLines,
          style: TextStyle(
            color: isDark ? Colors.white : Colors.grey[900],
          ),
          decoration: InputDecoration(
            filled: true,
            fillColor: isDark
                ? Colors.grey[800]!.withOpacity(0.3)
                : Colors.grey[50],
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: isDark
                    ? Colors.grey[700]!.withOpacity(0.3)
                    : Colors.grey[300]!,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: isDark
                    ? Colors.grey[700]!.withOpacity(0.3)
                    : Colors.grey[300]!,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: Colors.blue[600]!,
                width: 2,
              ),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildRankTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Đăng ký hạng đấu',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Đăng ký xét hạng để tham gia các giải đấu chính thức',
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement rank registration
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[600],
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Đăng ký xét hạng',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpaHistoryTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Lịch sử SPA',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark
                  ? Colors.grey[800]!.withOpacity(0.3)
                  : Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.account_balance_wallet,
                  color: Colors.amber[600],
                  size: 32,
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Số dư hiện tại',
                      style: TextStyle(
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                      ),
                    ),
                    Text(
                      '1,250 SPA',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.grey[900],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClubTab(bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Đăng ký CLB',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.grey[900],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Tham gia câu lạc bộ để kết nối với cộng đồng',
            style: TextStyle(
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              // TODO: Implement club registration
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.purple[600],
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: const Text(
              'Tìm câu lạc bộ',
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsSection(UnifiedProfile profile, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        children: [
          // Achievements Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF1e293b).withOpacity(0.4)
                  : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? Colors.grey[700]!.withOpacity(0.5)
                    : Colors.grey[200]!,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.emoji_events,
                      color: Colors.amber[600],
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Thành tích',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.grey[900],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildAchievementBadge('Tân thủ', Colors.green, isDark),
                    const SizedBox(width: 8),
                    _buildAchievementBadge(
                        'Thắng 10 trận', Colors.blue, isDark),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Profile Completion Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF1e293b).withOpacity(0.4)
                  : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark
                    ? Colors.grey[700]!.withOpacity(0.5)
                    : Colors.grey[200]!,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.settings,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Hoàn thiện hồ sơ',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white : Colors.grey[900],
                      ),
                    ),
                    const Spacer(),
                    Text(
                      '${profile.completionPercentage}%',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.blue[300] : Colors.blue[600],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: profile.completionPercentage / 100,
                  backgroundColor: isDark
                      ? Colors.grey[700]!.withOpacity(0.5)
                      : Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    isDark ? Colors.blue[300]! : Colors.blue[600]!,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Cập nhật đầy đủ thông tin để nhận được nhiều lợi ích hơn',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementBadge(String label, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withOpacity(0.3),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }

  Widget _buildScrollTopButton(bool isDark) {
    return FloatingActionButton.small(
      onPressed: () {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      },
      backgroundColor: isDark ? const Color(0xFF1e293b) : Colors.white,
      foregroundColor: isDark ? Colors.white : Colors.grey[700],
      child: const Icon(Icons.keyboard_arrow_up),
    );
  }
}
