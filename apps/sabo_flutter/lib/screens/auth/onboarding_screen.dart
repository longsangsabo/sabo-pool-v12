import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback? onCompleted;
  
  const OnboardingScreen({super.key, this.onCompleted});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  int _currentPage = 0;
  bool _isLastPage = false;

  final List<OnboardingPage> _pages = [
    OnboardingPage(
      title: 'Chào mừng đến với SABO Pool',
      description: 'Cộng đồng billiards hàng đầu Việt Nam\nKết nối, thi đấu và thăng tiến cùng nhau',
      imagePath: 'assets/images/onboarding_1.png',
      backgroundColor: Colors.blue.shade50,
      primaryColor: Colors.blue.shade600,
    ),
    OnboardingPage(
      title: 'Tham gia giải đấu',
      description: 'Khám phá hàng trăm giải đấu\nTừ nghiệp dư đến chuyên nghiệp',
      imagePath: 'assets/images/onboarding_2.png',
      backgroundColor: Colors.green.shade50,
      primaryColor: Colors.green.shade600,
    ),
    OnboardingPage(
      title: 'Thách đấu và thăng hạng',
      description: 'Thách thức đối thủ và cải thiện ELO\nTrở thành cao thủ billiards',
      imagePath: 'assets/images/onboarding_3.png',
      backgroundColor: Colors.orange.shade50,
      primaryColor: Colors.orange.shade600,
    ),
    OnboardingPage(
      title: 'Kết nối cộng đồng',
      description: 'Tìm kiếm club gần bạn\nKết bạn với những người chơi cùng đam mê',
      imagePath: 'assets/images/onboarding_4.png',
      backgroundColor: Colors.purple.shade50,
      primaryColor: Colors.purple.shade600,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _animationController.forward();
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
      _isLastPage = page == _pages.length - 1;
    });
    
    _animationController.reset();
    _animationController.forward();
  }

  void _nextPage() {
    if (_isLastPage) {
      _completeOnboarding();
    } else {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _skipOnboarding() {
    _pageController.animateToPage(
      _pages.length - 1,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
    );
  }

  void _completeOnboarding() {
    // Save onboarding completion status
    // SharedPreferences, Hive, or other storage
    
    if (widget.onCompleted != null) {
      widget.onCompleted!();
    } else {
      context.go('/auth/login');
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              _pages[_currentPage].backgroundColor,
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Skip Button
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const SizedBox(width: 80), // Spacer for centering
                    
                    // Page Indicator
                    SmoothPageIndicator(
                      controller: _pageController,
                      count: _pages.length,
                      effect: WormEffect(
                        dotColor: Colors.grey.shade300,
                        activeDotColor: _pages[_currentPage].primaryColor,
                        dotHeight: 8,
                        dotWidth: 8,
                        spacing: 8,
                      ),
                    ),
                    
                    // Skip Button
                    if (!_isLastPage)
                      TextButton(
                        onPressed: _skipOnboarding,
                        child: Text(
                          'Bỏ qua',
                          style: TextStyle(
                            color: _pages[_currentPage].primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else
                      const SizedBox(width: 80),
                  ],
                ),
              ),
              
              // Page Content
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: _onPageChanged,
                  itemCount: _pages.length,
                  itemBuilder: (context, index) {
                    return AnimatedBuilder(
                      animation: _animationController,
                      builder: (context, child) {
                        return FadeTransition(
                          opacity: _fadeAnimation,
                          child: SlideTransition(
                            position: _slideAnimation,
                            child: _buildPageContent(_pages[index]),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              
              // Bottom Navigation
              Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Back Button
                    if (_currentPage > 0)
                      OutlinedButton(
                        onPressed: () {
                          _pageController.previousPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: _pages[_currentPage].primaryColor),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        ),
                        child: Text(
                          'Quay lại',
                          style: TextStyle(
                            color: _pages[_currentPage].primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else
                      const SizedBox(width: 100),
                    
                    // Next Button
                    ElevatedButton(
                      onPressed: _nextPage,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _pages[_currentPage].primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isLastPage ? 'Bắt đầu' : 'Tiếp tục',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            _isLastPage ? Icons.rocket_launch : Icons.arrow_forward,
                            size: 20,
                          ),
                        ],
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

  Widget _buildPageContent(OnboardingPage page) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Illustration
          Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              color: page.backgroundColor,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: page.primaryColor.withOpacity(0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Center(
              child: Icon(
                _getPageIcon(page),
                size: 120,
                color: page.primaryColor,
              ),
            ),
          ),
          
          const SizedBox(height: 60),
          
          // Title
          Text(
            page.title,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          
          const SizedBox(height: 24),
          
          // Description
          Text(
            page.description,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey.shade600,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
          
          const SizedBox(height: 40),
          
          // Feature Highlights
          _buildFeatureHighlights(page),
        ],
      ),
    );
  }

  Widget _buildFeatureHighlights(OnboardingPage page) {
    final features = _getPageFeatures(page);
    
    return Column(
      children: features.map((feature) {
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Row(
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: page.primaryColor,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  color: Colors.white,
                  size: 16,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  feature,
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  IconData _getPageIcon(OnboardingPage page) {
    switch (_pages.indexOf(page)) {
      case 0:
        return Icons.sports_baseball;
      case 1:
        return Icons.emoji_events;
      case 2:
        return Icons.trending_up;
      case 3:
        return Icons.groups;
      default:
        return Icons.sports_baseball;
    }
  }

  List<String> _getPageFeatures(OnboardingPage page) {
    switch (_pages.indexOf(page)) {
      case 0:
        return [
          'Hơn 10,000 người chơi đã tham gia',
          'Hệ thống xếp hạng ELO chính xác',
          'Giao diện thân thiện, dễ sử dụng',
        ];
      case 1:
        return [
          'Giải đấu từ cơ bản đến chuyên nghiệp',
          'Hệ thống bracket tự động',
          'Giải thưởng hấp dẫn hàng tháng',
        ];
      case 2:
        return [
          'Thách đấu thời gian thực',
          'Cải thiện kỹ năng với AI Coach',
          'Thống kê chi tiết từng trận đấu',
        ];
      case 3:
        return [
          'Tìm club billiards gần nhà',
          'Kết nối với cao thủ trong khu vực',
          'Chia sẻ kinh nghiệm và mẹo hay',
        ];
      default:
        return [];
    }
  }
}

class OnboardingPage {
  final String title;
  final String description;
  final String imagePath;
  final Color backgroundColor;
  final Color primaryColor;

  OnboardingPage({
    required this.title,
    required this.description,
    required this.imagePath,
    required this.backgroundColor,
    required this.primaryColor,
  });
}
