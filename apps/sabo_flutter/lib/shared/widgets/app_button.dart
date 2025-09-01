// lib/shared/widgets/app_button.dart
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Modern Button Component - Copy từ web design system
enum ButtonVariant { primary, secondary, outline, ghost, destructive }
enum ButtonSize { small, medium, large }

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.medium,
    this.isLoading = false,
    this.icon,
    this.fullWidth = true,
  });

  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final bool isLoading;
  final IconData? icon;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    if (variant == ButtonVariant.outline) {
      return _buildOutlinedButton();
    } else if (variant == ButtonVariant.ghost) {
      return _buildTextButton();
    } else {
      return _buildElevatedButton();
    }
  }

  Widget _buildElevatedButton() {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: _getBackgroundColor(),
        foregroundColor: _getForegroundColor(),
        disabledBackgroundColor: AppColors.gray600,
        disabledForegroundColor: AppColors.gray400,
        minimumSize: Size(fullWidth ? double.infinity : 0, _getHeight()),
        padding: _getPadding(),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_getBorderRadius()),
        ),
        elevation: 0,
        shadowColor: Colors.transparent,
        textStyle: _getTextStyle(),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildOutlinedButton() {
    return OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: _getOutlineForegroundColor(),
        disabledForegroundColor: AppColors.gray400,
        minimumSize: Size(fullWidth ? double.infinity : 0, _getHeight()),
        padding: _getPadding(),
        side: BorderSide(
          color: _getOutlineBorderColor(),
          width: 1,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_getBorderRadius()),
        ),
        textStyle: _getTextStyle(),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildTextButton() {
    return TextButton(
      onPressed: isLoading ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: _getGhostForegroundColor(),
        disabledForegroundColor: AppColors.gray400,
        minimumSize: Size(fullWidth ? double.infinity : 0, _getHeight()),
        padding: _getPadding(),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(_getBorderRadius()),
        ),
        textStyle: _getTextStyle(),
      ),
      child: _buildButtonContent(),
    );
  }

  Widget _buildButtonContent() {
    if (isLoading) {
      return SizedBox(
        height: _getIconSize(),
        width: _getIconSize(),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(_getForegroundColor()),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: _getIconSize()),
          const SizedBox(width: 8),
          Text(text),
        ],
      );
    }

    return Text(text);
  }

  Color _getBackgroundColor() {
    switch (variant) {
      case ButtonVariant.primary:
        return AppColors.primary500;
      case ButtonVariant.secondary:
        return AppColors.muted;
      case ButtonVariant.destructive:
        return AppColors.error;
      default:
        return AppColors.primary500;
    }
  }

  Color _getForegroundColor() {
    switch (variant) {
      case ButtonVariant.primary:
        return Colors.white;
      case ButtonVariant.secondary:
        return AppColors.foreground;
      case ButtonVariant.destructive:
        return Colors.white;
      default:
        return Colors.white;
    }
  }

  Color _getOutlineForegroundColor() {
    switch (variant) {
      case ButtonVariant.outline:
        return AppColors.primary500;
      case ButtonVariant.destructive:
        return AppColors.error;
      default:
        return AppColors.primary500;
    }
  }

  Color _getOutlineBorderColor() {
    switch (variant) {
      case ButtonVariant.outline:
        return AppColors.primary500;
      case ButtonVariant.destructive:
        return AppColors.error;
      default:
        return AppColors.border;
    }
  }

  Color _getGhostForegroundColor() {
    switch (variant) {
      case ButtonVariant.ghost:
        return AppColors.primary500;
      case ButtonVariant.destructive:
        return AppColors.error;
      default:
        return AppColors.foreground;
    }
  }

  double _getHeight() {
    switch (size) {
      case ButtonSize.small:
        return 36;
      case ButtonSize.medium:
        return 44;
      case ButtonSize.large:
        return 52;
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case ButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 8);
      case ButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 20, vertical: 12);
      case ButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 16);
    }
  }

  double _getBorderRadius() {
    switch (size) {
      case ButtonSize.small:
        return 8;
      case ButtonSize.medium:
        return 10;
      case ButtonSize.large:
        return 12;
    }
  }

  double _getIconSize() {
    switch (size) {
      case ButtonSize.small:
        return 16;
      case ButtonSize.medium:
        return 18;
      case ButtonSize.large:
        return 20;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case ButtonSize.small:
        return AppTypography.labelMedium;
      case ButtonSize.medium:
        return AppTypography.labelLarge;
      case ButtonSize.large:
        return AppTypography.titleMedium;
    }
  }
}
