// lib/shared/widgets/sabo_button.dart
import 'package:flutter/material.dart';
import 'package:sabo_flutter/core/design_system/design_tokens.dart';
import 'package:sabo_flutter/core/design_system/component_variants.dart';
import 'package:sabo_flutter/core/design_system/typography_system.dart';

/// SABO Arena Button - Copy exact từ web component system
class SaboButton extends StatelessWidget {
  const SaboButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = SaboVariant.primary,
    this.size = SaboSize.md,
    this.isLoading = false,
    this.icon,
    this.iconPosition = SaboIconPosition.leading,
    this.fullWidth = true,
    this.disabled = false,
  });

  final String text;
  final VoidCallback? onPressed;
  final SaboVariant variant;
  final SaboSize size;
  final bool isLoading;
  final IconData? icon;
  final SaboIconPosition iconPosition;
  final bool fullWidth;
  final bool disabled;

  @override
  Widget build(BuildContext context) {
    final style = SaboComponentStyles.getButtonStyle(variant);
    final sizeConfig = SaboComponentSizes.buttonSizes[size]!;
    
    final isDisabled = disabled || isLoading || onPressed == null;
    
    if (variant == SaboVariant.outline) {
      return _buildOutlinedButton(style, sizeConfig, isDisabled);
    } else if (variant == SaboVariant.ghost) {
      return _buildTextButton(style, sizeConfig, isDisabled);
    } else {
      return _buildElevatedButton(style, sizeConfig, isDisabled);
    }
  }

  Widget _buildElevatedButton(Map<String, dynamic> style, Map<String, double> sizeConfig, bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: style['backgroundColor'],
        foregroundColor: style['foregroundColor'],
        disabledBackgroundColor: SaboDesignTokens.grayColors[600],
        disabledForegroundColor: SaboDesignTokens.grayColors[400],
        minimumSize: Size(
          fullWidth ? double.infinity : 0,
          sizeConfig['height']!,
        ),
        padding: EdgeInsets.symmetric(
          horizontal: sizeConfig['paddingX']!,
          vertical: sizeConfig['paddingY']!,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadius['lg']!),
        ),
        elevation: 0,
        shadowColor: Colors.transparent,
      ),
      child: _buildButtonContent(sizeConfig),
    );
  }

  Widget _buildOutlinedButton(Map<String, dynamic> style, Map<String, double> sizeConfig, bool isDisabled) {
    return OutlinedButton(
      onPressed: isDisabled ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: style['foregroundColor'],
        disabledForegroundColor: SaboDesignTokens.grayColors[400],
        minimumSize: Size(
          fullWidth ? double.infinity : 0,
          sizeConfig['height']!,
        ),
        padding: EdgeInsets.symmetric(
          horizontal: sizeConfig['paddingX']!,
          vertical: sizeConfig['paddingY']!,
        ),
        side: BorderSide(
          color: isDisabled ? SaboDesignTokens.grayColors[600]! : style['borderColor'],
          width: 1,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadius['lg']!),
        ),
      ),
      child: _buildButtonContent(sizeConfig),
    );
  }

  Widget _buildTextButton(Map<String, dynamic> style, Map<String, double> sizeConfig, bool isDisabled) {
    return TextButton(
      onPressed: isDisabled ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: style['foregroundColor'],
        disabledForegroundColor: SaboDesignTokens.grayColors[400],
        minimumSize: Size(
          fullWidth ? double.infinity : 0,
          sizeConfig['height']!,
        ),
        padding: EdgeInsets.symmetric(
          horizontal: sizeConfig['paddingX']!,
          vertical: sizeConfig['paddingY']!,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadius['lg']!),
        ),
      ),
      child: _buildButtonContent(sizeConfig),
    );
  }

  Widget _buildButtonContent(Map<String, double> sizeConfig) {
    if (isLoading) {
      return SizedBox(
        height: SaboComponentSizes.iconSizes[size]!,
        width: SaboComponentSizes.iconSizes[size]!,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            variant == SaboVariant.outline || variant == SaboVariant.ghost
                ? SaboDesignTokens.primary
                : Colors.white,
          ),
        ),
      );
    }

    final textWidget = Text(
      text,
      style: SaboTypography.custom(
        fontSizeKey: _getFontSizeKey(),
        fontWeightKey: 'medium',
        lineHeightKey: 'normal',
      ).copyWith(fontSize: sizeConfig['fontSize']),
    );

    if (icon == null) {
      return textWidget;
    }

    final iconWidget = Icon(
      icon,
      size: SaboComponentSizes.iconSizes[size],
    );

    if (iconPosition == SaboIconPosition.leading) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          iconWidget,
          SizedBox(width: SaboDesignTokens.spacing['xs']!),
          textWidget,
        ],
      );
    } else {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          textWidget,
          SizedBox(width: SaboDesignTokens.spacing['xs']!),
          iconWidget,
        ],
      );
    }
  }

  String _getFontSizeKey() {
    switch (size) {
      case SaboSize.xs:
        return 'xs';
      case SaboSize.sm:
        return 'sm';
      case SaboSize.md:
        return 'sm';
      case SaboSize.lg:
        return 'base';
      case SaboSize.xl:
        return 'base';
    }
  }
}

enum SaboIconPosition { leading, trailing }

// Convenient factory constructors
extension SaboButtonExtensions on SaboButton {
  static SaboButton primary({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    SaboSize size = SaboSize.md,
    bool isLoading = false,
    IconData? icon,
    bool fullWidth = true,
  }) =>
      SaboButton(
        key: key,
        text: text,
        onPressed: onPressed,
        variant: SaboVariant.primary,
        size: size,
        isLoading: isLoading,
        icon: icon,
        fullWidth: fullWidth,
      );

  static SaboButton secondary({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    SaboSize size = SaboSize.md,
    bool isLoading = false,
    IconData? icon,
    bool fullWidth = true,
  }) =>
      SaboButton(
        key: key,
        text: text,
        onPressed: onPressed,
        variant: SaboVariant.secondary,
        size: size,
        isLoading: isLoading,
        icon: icon,
        fullWidth: fullWidth,
      );

  static SaboButton outline({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    SaboSize size = SaboSize.md,
    bool isLoading = false,
    IconData? icon,
    bool fullWidth = true,
  }) =>
      SaboButton(
        key: key,
        text: text,
        onPressed: onPressed,
        variant: SaboVariant.outline,
        size: size,
        isLoading: isLoading,
        icon: icon,
        fullWidth: fullWidth,
      );

  static SaboButton ghost({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    SaboSize size = SaboSize.md,
    bool isLoading = false,
    IconData? icon,
    bool fullWidth = true,
  }) =>
      SaboButton(
        key: key,
        text: text,
        onPressed: onPressed,
        variant: SaboVariant.ghost,
        size: size,
        isLoading: isLoading,
        icon: icon,
        fullWidth: fullWidth,
      );

  static SaboButton destructive({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    SaboSize size = SaboSize.md,
    bool isLoading = false,
    IconData? icon,
    bool fullWidth = true,
  }) =>
      SaboButton(
        key: key,
        text: text,
        onPressed: onPressed,
        variant: SaboVariant.destructive,
        size: size,
        isLoading: isLoading,
        icon: icon,
        fullWidth: fullWidth,
      );
}
