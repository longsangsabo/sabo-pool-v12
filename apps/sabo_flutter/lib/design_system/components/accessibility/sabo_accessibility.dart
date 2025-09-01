import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../design_system/sabo_design_system.dart';

/// SABO Pool - Accessibility Helper Components
/// Provides semantic labels and focus management
class SaboAccessibility {
  
  /// Semantic Button with accessibility features
  static Widget accessibleButton({
    required String text,
    required VoidCallback? onPressed,
    String? semanticLabel,
    String? tooltip,
    SaboButtonVariant variant = SaboButtonVariant.primary,
    SaboButtonSize size = SaboButtonSize.medium,
    Widget? icon,
    bool isLoading = false,
    bool isFullWidth = false,
  }) {
    return Semantics(
      label: semanticLabel ?? text,
      hint: tooltip,
      button: true,
      enabled: onPressed != null && !isLoading,
      child: Tooltip(
        message: tooltip ?? text,
        child: SaboButton(
          text: text,
          onPressed: onPressed != null ? () {
            HapticFeedback.lightImpact();
            onPressed();
          } : null,
          variant: variant,
          size: size,
          icon: icon,
          isLoading: isLoading,
          isFullWidth: isFullWidth,
        ),
      ),
    );
  }

  /// Semantic Card with accessibility features
  static Widget accessibleCard({
    required Widget child,
    VoidCallback? onTap,
    String? semanticLabel,
    String? semanticHint,
    SaboCardVariant variant = SaboCardVariant.elevated,
    EdgeInsets? padding,
    EdgeInsets? margin,
    bool showShadow = true,
  }) {
    return Semantics(
      label: semanticLabel,
      hint: semanticHint,
      button: onTap != null,
      child: SaboCard(
        variant: variant,
        onTap: onTap != null ? () {
          HapticFeedback.selectionClick();
          onTap();
        } : null,
        padding: padding,
        margin: margin,
        showShadow: showShadow,
        child: child,
      ),
    );
  }

  /// Accessible Stats Card
  static Widget accessibleStatsCard({
    required String title,
    required String value,
    required IconData icon,
    Color? iconColor,
    String? subtitle,
    VoidCallback? onTap,
  }) {
    final semanticLabel = 'Thống kê $title: $value${subtitle != null ? ', $subtitle' : ''}';
    
    return Semantics(
      label: semanticLabel,
      hint: onTap != null ? 'Nhấn để xem chi tiết' : null,
      button: onTap != null,
      child: SaboStatsCard(
        title: title,
        value: value,
        icon: icon,
        iconColor: iconColor,
        subtitle: subtitle,
        onTap: onTap != null ? () {
          HapticFeedback.selectionClick();
          onTap();
        } : null,
      ),
    );
  }

  /// Accessible Tournament Card
  static Widget accessibleTournamentCard({
    required String name,
    required String prize,
    required String status,
    required String date,
    required int participants,
    VoidCallback? onTap,
    bool isHighlighted = false,
  }) {
    final semanticLabel = 'Giải đấu $name, giải thưởng $prize, trạng thái $status, ngày $date, $participants người tham gia';
    
    return Semantics(
      label: semanticLabel,
      hint: onTap != null ? 'Nhấn để xem chi tiết giải đấu' : null,
      button: onTap != null,
      child: SaboTournamentCard(
        name: name,
        prize: prize,
        status: status,
        date: date,
        participants: participants,
        isHighlighted: isHighlighted,
        onTap: onTap != null ? () {
          HapticFeedback.selectionClick();
          onTap();
        } : null,
      ),
    );
  }

  /// Accessible Text Field
  static Widget accessibleTextField({
    required String label,
    String? hint,
    String? semanticLabel,
    TextEditingController? controller,
    ValueChanged<String>? onChanged,
    VoidCallback? onTap,
    bool obscureText = false,
    TextInputType? keyboardType,
    Widget? suffixIcon,
    Widget? prefixIcon,
    String? errorText,
    bool enabled = true,
  }) {
    return Semantics(
      label: semanticLabel ?? label,
      hint: hint,
      textField: true,
      enabled: enabled,
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        onTap: onTap,
        obscureText: obscureText,
        keyboardType: keyboardType,
        enabled: enabled,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          suffixIcon: suffixIcon,
          prefixIcon: prefixIcon,
          errorText: errorText,
        ),
      ),
    );
  }

  /// Focus Management Utilities
  static void announceMessage(String message) {
    SemanticsService.announce(message, TextDirection.ltr);
  }

  static void requestFocus(FocusNode focusNode) {
    focusNode.requestFocus();
  }

  static void clearFocus() {
    FocusScope.of(NavigationService.navigatorKey.currentContext!).unfocus();
  }

  /// Screen Reader Announcements
  static void announceScreenChange(String screenName) {
    announceMessage('Đã chuyển đến màn hình $screenName');
  }

  static void announceAction(String action) {
    announceMessage(action);
  }

  static void announceError(String error) {
    announceMessage('Lỗi: $error');
  }

  static void announceSuccess(String success) {
    announceMessage('Thành công: $success');
  }
}

/// Navigation Service for accessibility
class NavigationService {
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
}

/// Accessible App Bar
class SaboAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final Color? backgroundColor;
  final double elevation;

  const SaboAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
    this.centerTitle = true,
    this.backgroundColor,
    this.elevation = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      header: true,
      label: 'Thanh tiêu đề: $title',
      child: AppBar(
        title: Text(
          title,
          style: SaboTextStyles.titleLarge.copyWith(
            color: SaboColors.onSurface,
          ),
        ),
        centerTitle: centerTitle,
        backgroundColor: backgroundColor ?? SaboColors.surfaceVariant,
        elevation: elevation,
        leading: leading != null 
            ? Semantics(
                label: 'Nút quay lại',
                button: true,
                child: leading,
              )
            : null,
        actions: actions?.map((action) => Semantics(
          button: true,
          child: action,
        )).toList(),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

/// Accessible Bottom Navigation
class SaboBottomNavigation extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<SaboBottomNavItem> items;

  const SaboBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Thanh điều hướng dưới',
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) {
          HapticFeedback.selectionClick();
          SaboAccessibility.announceMessage('Đã chọn ${items[index].label}');
          onTap(index);
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: SaboColors.surfaceVariant,
        selectedItemColor: SaboColors.primary,
        unselectedItemColor: SaboColors.onSurfaceSecondary,
        items: items.map((item) => BottomNavigationBarItem(
          icon: Semantics(
            label: '${item.label}${currentIndex == items.indexOf(item) ? ', đã chọn' : ''}',
            button: true,
            selected: currentIndex == items.indexOf(item),
            child: Icon(item.icon),
          ),
          label: item.label,
        )).toList(),
      ),
    );
  }
}

class SaboBottomNavItem {
  final IconData icon;
  final String label;

  const SaboBottomNavItem({
    required this.icon,
    required this.label,
  });
}

/// High Contrast Mode Support
class SaboHighContrastColors {
  static bool get isHighContrastEnabled {
    return MediaQueryData.fromWindow(WidgetsBinding.instance.window).highContrast;
  }

  static Color get primaryColor {
    return isHighContrastEnabled ? Colors.white : SaboColors.primary;
  }

  static Color get surfaceColor {
    return isHighContrastEnabled ? Colors.black : SaboColors.surface;
  }

  static Color get textColor {
    return isHighContrastEnabled ? Colors.white : SaboColors.onSurface;
  }
}
