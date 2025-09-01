import 'package:flutter/material.dart';
import '../../design_system/sabo_design_system.dart';

/// SABO Pool - Unified Button Component
/// Replaces all duplicate button implementations
class SaboButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final SaboButtonVariant variant;
  final SaboButtonSize size;
  final Widget? icon;
  final bool isLoading;
  final bool isFullWidth;

  const SaboButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = SaboButtonVariant.primary,
    this.size = SaboButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  });

  const SaboButton.primary({
    super.key,
    required this.text,
    this.onPressed,
    this.size = SaboButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  }) : variant = SaboButtonVariant.primary;

  const SaboButton.secondary({
    super.key,
    required this.text,
    this.onPressed,
    this.size = SaboButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  }) : variant = SaboButtonVariant.secondary;

  const SaboButton.outline({
    super.key,
    required this.text,
    this.onPressed,
    this.size = SaboButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  }) : variant = SaboButtonVariant.outline;

  const SaboButton.ghost({
    super.key,
    required this.text,
    this.onPressed,
    this.size = SaboButtonSize.medium,
    this.icon,
    this.isLoading = false,
    this.isFullWidth = false,
  }) : variant = SaboButtonVariant.ghost;

  @override
  Widget build(BuildContext context) {
    final buttonStyle = _getButtonStyle();
    final buttonSize = _getButtonSize();
    final textStyle = _getTextStyle();

    Widget buttonChild = isLoading
        ? SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation<Color>(
                _getLoadingColor(),
              ),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                icon!,
                SizedBox(width: SaboSpacing.xs),
              ],
              Text(text, style: textStyle),
            ],
          );

    Widget button;
    
    switch (variant) {
      case SaboButtonVariant.primary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
      case SaboButtonVariant.secondary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
      case SaboButtonVariant.outline:
        button = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
      case SaboButtonVariant.ghost:
        button = TextButton(
          onPressed: isLoading ? null : onPressed,
          style: buttonStyle,
          child: buttonChild,
        );
        break;
    }

    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: buttonSize.height,
      child: button,
    );
  }

  ButtonStyle _getButtonStyle() {
    switch (variant) {
      case SaboButtonVariant.primary:
        return ElevatedButton.styleFrom(
          backgroundColor: SaboColors.primary,
          foregroundColor: Colors.white,
          elevation: SaboElevation.level1,
          shadowColor: SaboColors.primary.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: _getButtonSize().padding,
        );
      case SaboButtonVariant.secondary:
        return ElevatedButton.styleFrom(
          backgroundColor: SaboColors.surfaceContainer,
          foregroundColor: SaboColors.onSurface,
          elevation: SaboElevation.level1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: _getButtonSize().padding,
        );
      case SaboButtonVariant.outline:
        return OutlinedButton.styleFrom(
          foregroundColor: SaboColors.primary,
          side: BorderSide(color: SaboColors.primary),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: _getButtonSize().padding,
        );
      case SaboButtonVariant.ghost:
        return TextButton.styleFrom(
          foregroundColor: SaboColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: _getButtonSize().padding,
        );
    }
  }

  _ButtonSize _getButtonSize() {
    switch (size) {
      case SaboButtonSize.small:
        return _ButtonSize(
          height: 36,
          padding: EdgeInsets.symmetric(
            horizontal: SaboSpacing.md,
            vertical: SaboSpacing.xs,
          ),
        );
      case SaboButtonSize.medium:
        return _ButtonSize(
          height: 44,
          padding: EdgeInsets.symmetric(
            horizontal: SaboSpacing.lg,
            vertical: SaboSpacing.sm,
          ),
        );
      case SaboButtonSize.large:
        return _ButtonSize(
          height: 52,
          padding: EdgeInsets.symmetric(
            horizontal: SaboSpacing.xl,
            vertical: SaboSpacing.md,
          ),
        );
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case SaboButtonSize.small:
        return SaboTextStyles.labelMedium;
      case SaboButtonSize.medium:
        return SaboTextStyles.labelLarge;
      case SaboButtonSize.large:
        return SaboTextStyles.titleSmall;
    }
  }

  Color _getLoadingColor() {
    switch (variant) {
      case SaboButtonVariant.primary:
        return Colors.white;
      case SaboButtonVariant.secondary:
        return SaboColors.onSurface;
      case SaboButtonVariant.outline:
      case SaboButtonVariant.ghost:
        return SaboColors.primary;
    }
  }
}

enum SaboButtonVariant {
  primary,
  secondary,
  outline,
  ghost,
}

enum SaboButtonSize {
  small,
  medium,
  large,
}

class _ButtonSize {
  final double height;
  final EdgeInsets padding;

  _ButtonSize({required this.height, required this.padding});
}
