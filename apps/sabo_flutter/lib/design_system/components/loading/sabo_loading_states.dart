import 'package:flutter/material.dart';
import '../../design_system/sabo_design_system.dart';

/// SABO Pool - Loading State Components
/// Provides skeleton loading patterns for better UX
class SaboLoadingStates {
  
  /// Skeleton Loading for Cards
  static Widget skeletonCard({
    double? height,
    EdgeInsets? margin,
  }) {
    return Container(
      height: height ?? 120,
      margin: margin ?? EdgeInsets.all(SaboSpacing.xs),
      decoration: BoxDecoration(
        color: SaboColors.surfaceContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(SaboSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _SkeletonBox(width: 60, height: 20),
                const Spacer(),
                _SkeletonBox(width: 24, height: 24, isCircle: true),
              ],
            ),
            SizedBox(height: SaboSpacing.sm),
            _SkeletonBox(width: double.infinity, height: 16),
            SizedBox(height: SaboSpacing.xs),
            _SkeletonBox(width: 150, height: 14),
            SizedBox(height: SaboSpacing.xs),
            Row(
              children: [
                _SkeletonBox(width: 100, height: 12),
                const Spacer(),
                _SkeletonBox(width: 80, height: 12),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Skeleton Loading for Lists
  static Widget skeletonList({
    int itemCount = 5,
    double itemHeight = 120,
  }) {
    return ListView.builder(
      itemCount: itemCount,
      itemBuilder: (context, index) => skeletonCard(height: itemHeight),
    );
  }

  /// Skeleton Loading for Stats Grid
  static Widget skeletonStatsGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.5,
      ),
      itemCount: 4,
      itemBuilder: (context, index) => Container(
        padding: EdgeInsets.all(SaboSpacing.md),
        decoration: BoxDecoration(
          color: SaboColors.surfaceContainer,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _SkeletonBox(width: 32, height: 32, isCircle: true),
                const Spacer(),
              ],
            ),
            SizedBox(height: SaboSpacing.sm),
            _SkeletonBox(width: 80, height: 20),
            SizedBox(height: SaboSpacing.xxs),
            _SkeletonBox(width: 60, height: 14),
          ],
        ),
      ),
    );
  }

  /// Skeleton Loading for Profile Header
  static Widget skeletonProfileHeader() {
    return Container(
      padding: EdgeInsets.all(SaboSpacing.lg),
      decoration: BoxDecoration(
        gradient: SaboColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          _SkeletonBox(width: 80, height: 80, isCircle: true),
          SizedBox(height: SaboSpacing.md),
          _SkeletonBox(width: 150, height: 20),
          SizedBox(height: SaboSpacing.xs),
          _SkeletonBox(width: 100, height: 14),
          SizedBox(height: SaboSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Column(
                children: [
                  _SkeletonBox(width: 40, height: 16),
                  SizedBox(height: SaboSpacing.xxs),
                  _SkeletonBox(width: 60, height: 12),
                ],
              ),
              Column(
                children: [
                  _SkeletonBox(width: 40, height: 16),
                  SizedBox(height: SaboSpacing.xxs),
                  _SkeletonBox(width: 60, height: 12),
                ],
              ),
              Column(
                children: [
                  _SkeletonBox(width: 40, height: 16),
                  SizedBox(height: SaboSpacing.xxs),
                  _SkeletonBox(width: 60, height: 12),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Loading Spinner with Text
  static Widget loadingSpinner({
    String? message,
    Color? color,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(
              color ?? SaboColors.primary,
            ),
          ),
          if (message != null) ...[
            SizedBox(height: SaboSpacing.md),
            Text(
              message,
              style: SaboTextStyles.bodyMedium.copyWith(
                color: SaboColors.onSurfaceVariant,
              ),
            ),
          ],
        ],
      ),
    );
  }

  /// Shimmer Effect Loading
  static Widget shimmerLoading({
    required Widget child,
  }) {
    return _ShimmerWrapper(child: child);
  }
}

/// Internal Skeleton Box Component
class _SkeletonBox extends StatelessWidget {
  final double width;
  final double height;
  final bool isCircle;

  const _SkeletonBox({
    required this.width,
    required this.height,
    this.isCircle = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: SaboColors.onSurfaceSecondary.withOpacity(0.1),
        borderRadius: isCircle 
            ? BorderRadius.circular(width / 2)
            : BorderRadius.circular(4),
      ),
    );
  }
}

/// Shimmer Animation Wrapper
class _ShimmerWrapper extends StatefulWidget {
  final Widget child;

  const _ShimmerWrapper({required this.child});

  @override
  State<_ShimmerWrapper> createState() => _ShimmerWrapperState();
}

class _ShimmerWrapperState extends State<_ShimmerWrapper>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: -2.0,
      end: 2.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOutSine,
    ));
    _animationController.repeat();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              colors: [
                SaboColors.onSurfaceSecondary.withOpacity(0.1),
                SaboColors.onSurfaceSecondary.withOpacity(0.3),
                SaboColors.onSurfaceSecondary.withOpacity(0.1),
              ],
              stops: const [0.0, 0.5, 1.0],
              begin: Alignment(_animation.value - 1.0, 0.0),
              end: Alignment(_animation.value, 0.0),
            ).createShader(bounds);
          },
          child: widget.child,
        );
      },
    );
  }
}

/// Error State Component
class SaboErrorState extends StatelessWidget {
  final String? message;
  final String? actionText;
  final VoidCallback? onRetry;
  final IconData? icon;

  const SaboErrorState({
    super.key,
    this.message,
    this.actionText,
    this.onRetry,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(SaboSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.error_outline_rounded,
              size: 64,
              color: SaboColors.error,
            ),
            SizedBox(height: SaboSpacing.md),
            Text(
              message ?? 'Đã xảy ra lỗi',
              style: SaboTextStyles.titleMedium.copyWith(
                color: SaboColors.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              SizedBox(height: SaboSpacing.lg),
              SaboButton.primary(
                text: actionText ?? 'Thử lại',
                onPressed: onRetry,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Empty State Component
class SaboEmptyState extends StatelessWidget {
  final String? message;
  final String? actionText;
  final VoidCallback? onAction;
  final IconData? icon;

  const SaboEmptyState({
    super.key,
    this.message,
    this.actionText,
    this.onAction,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(SaboSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon ?? Icons.inbox_outlined,
              size: 64,
              color: SaboColors.onSurfaceSecondary,
            ),
            SizedBox(height: SaboSpacing.md),
            Text(
              message ?? 'Không có dữ liệu',
              style: SaboTextStyles.titleMedium.copyWith(
                color: SaboColors.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            if (onAction != null) ...[
              SizedBox(height: SaboSpacing.lg),
              SaboButton.primary(
                text: actionText ?? 'Thêm mới',
                onPressed: onAction,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
