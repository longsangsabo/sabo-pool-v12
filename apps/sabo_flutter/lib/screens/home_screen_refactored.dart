import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../design_system/sabo_design_system.dart';

/// SABO Pool - Refactored Home Screen
/// Demonstrates design system implementation
class HomeScreenRefactored extends StatefulWidget {
  const HomeScreenRefactored({super.key});

  @override
  State<HomeScreenRefactored> createState() => _HomeScreenRefactoredState();
}

class _HomeScreenRefactoredState extends State<HomeScreenRefactored>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeInAnimation;
  bool _isLoading = true;
  bool _hasError = false;

  final List<Map<String, dynamic>> _mockTournaments = [
    {
      'name': 'Giải Vô Địch SABO 2025',
      'prize': '50,000,000 VND',
      'participants': 128,
      'date': '15/09/2025',
      'status': 'Sắp diễn ra',
    },
    {
      'name': 'Cúp Mùa Thu 2025',
      'prize': '25,000,000 VND',
      'participants': 64,
      'date': '22/09/2025',
      'status': 'Đang mở đăng ký',
    },
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _fadeInAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _animationController.forward();
    
    // Simulate loading
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: SaboColors.surface,
      appBar: SaboAppBar(
        title: 'SABO Pool Arena',
        actions: [
          IconButton(
            onPressed: () {
              HapticFeedback.lightImpact();
              SaboAccessibility.announceMessage('Thông báo được nhấn');
            },
            icon: Stack(
              children: [
                const Icon(Icons.notifications_rounded, size: 24),
                Positioned(
                  right: 0,
                  top: 0,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeInAnimation,
          child: _isLoading 
              ? _buildLoadingState()
              : _hasError 
                  ? _buildErrorState()
                  : _buildContent(),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(SaboSpacing.lg),
      child: Column(
        children: [
          SaboLoadingStates.skeletonProfileHeader(),
          SizedBox(height: SaboSpacing.xl),
          SaboLoadingStates.skeletonStatsGrid(),
          SizedBox(height: SaboSpacing.xl),
          SaboLoadingStates.skeletonList(itemCount: 3),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return SaboErrorState(
      message: 'Không thể tải dữ liệu trang chủ',
      actionText: 'Thử lại',
      onRetry: () {
        setState(() {
          _isLoading = true;
          _hasError = false;
        });
        _loadData();
      },
    );
  }

  Widget _buildContent() {
    return CustomScrollView(
      slivers: [
        // Welcome Section
        SliverToBoxAdapter(
          child: Container(
            margin: EdgeInsets.all(SaboSpacing.lg),
            child: SaboCard.elevated(
              customShadow: SaboElevation.primaryGlow,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: SaboColors.primaryGradient,
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
                padding: EdgeInsets.all(SaboSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 25,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          child: Text(
                            'P',
                            style: SaboTextStyles.titleLarge.copyWith(
                              color: Colors.white,
                            ),
                          ),
                        ),
                        SizedBox(width: SaboSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Chào mừng trở lại!',
                                style: SaboTextStyles.bodyLarge.copyWith(
                                  color: Colors.white.withOpacity(0.9),
                                ),
                              ),
                              Text(
                                'Player Pro',
                                style: SaboTextStyles.headlineMedium.copyWith(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: SaboSpacing.lg),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildWelcomeStatItem('Hạng', '#156'),
                        _buildWelcomeStatItem('Điểm', '2,450'),
                        _buildWelcomeStatItem('Thắng', '87%'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Quick Actions
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: SaboSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Thao tác nhanh',
                  style: SaboTextStyles.headlineSmall.copyWith(
                    color: SaboColors.onSurface,
                  ),
                ),
                SizedBox(height: SaboSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: SaboAccessibility.accessibleButton(
                        text: 'Tham gia giải',
                        semanticLabel: 'Tham gia giải đấu mới',
                        onPressed: () {},
                        icon: const Icon(Icons.emoji_events_rounded, size: 18),
                        variant: SaboButtonVariant.primary,
                      ),
                    ),
                    SizedBox(width: SaboSpacing.sm),
                    Expanded(
                      child: SaboAccessibility.accessibleButton(
                        text: 'Tìm đối thủ',
                        semanticLabel: 'Tìm kiếm đối thủ chơi',
                        onPressed: () {},
                        icon: const Icon(Icons.sports_rounded, size: 18),
                        variant: SaboButtonVariant.secondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        SliverToBoxAdapter(child: SizedBox(height: SaboSpacing.xl)),

        // Stats Grid
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: SaboSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Thống kê của bạn',
                  style: SaboTextStyles.headlineSmall.copyWith(
                    color: SaboColors.onSurface,
                  ),
                ),
                SizedBox(height: SaboSpacing.md),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: SaboSpacing.sm,
                  mainAxisSpacing: SaboSpacing.sm,
                  childAspectRatio: 1.5,
                  children: [
                    SaboAccessibility.accessibleStatsCard(
                      title: 'Trận thắng',
                      value: '245',
                      icon: Icons.emoji_events_rounded,
                      iconColor: SaboColors.success,
                      onTap: () {},
                    ),
                    SaboAccessibility.accessibleStatsCard(
                      title: 'Tổng trận',
                      value: '312',
                      icon: Icons.sports_billiards_rounded,
                      iconColor: SaboColors.primary,
                      onTap: () {},
                    ),
                    SaboAccessibility.accessibleStatsCard(
                      title: 'Điểm SPA',
                      value: '2,450',
                      icon: Icons.stars_rounded,
                      iconColor: Colors.amber,
                      onTap: () {},
                    ),
                    SaboAccessibility.accessibleStatsCard(
                      title: 'Xếp hạng',
                      value: '#156',
                      icon: Icons.leaderboard_rounded,
                      iconColor: SaboColors.secondary,
                      onTap: () {},
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        SliverToBoxAdapter(child: SizedBox(height: SaboSpacing.xl)),

        // Featured Tournaments
        SliverToBoxAdapter(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: SaboSpacing.lg),
            child: Text(
              'Giải đấu nổi bật',
              style: SaboTextStyles.headlineSmall.copyWith(
                color: SaboColors.onSurface,
              ),
            ),
          ),
        ),

        SliverList(
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final tournament = _mockTournaments[index];
              return Padding(
                padding: EdgeInsets.fromLTRB(
                  SaboSpacing.lg,
                  SaboSpacing.sm,
                  SaboSpacing.lg,
                  index == _mockTournaments.length - 1 ? SaboSpacing.xl : 0,
                ),
                child: SaboAccessibility.accessibleTournamentCard(
                  name: tournament['name'],
                  prize: tournament['prize'],
                  status: tournament['status'],
                  date: tournament['date'],
                  participants: tournament['participants'],
                  isHighlighted: index == 0,
                  onTap: () {
                    SaboAccessibility.announceMessage('Mở chi tiết giải ${tournament['name']}');
                  },
                ),
              );
            },
            childCount: _mockTournaments.length,
          ),
        ),
      ],
    );
  }

  Widget _buildWelcomeStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: SaboTextStyles.titleMedium.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: SaboSpacing.xxs),
        Text(
          label,
          style: SaboTextStyles.bodySmall.copyWith(
            color: Colors.white.withOpacity(0.8),
          ),
        ),
      ],
    );
  }
}
