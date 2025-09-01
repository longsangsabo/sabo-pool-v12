// lib/core/design_system/component_variants.dart
import 'package:flutter/material.dart';

/// SABO Arena Component Variants - Copy từ web component system
enum SaboVariant {
  primary,
  secondary,
  outline,
  ghost,
  destructive,
  success,
  warning,
  info,
}

enum SaboSize {
  xs,   // 28px height
  sm,   // 32px height  
  md,   // 40px height
  lg,   // 44px height
  xl,   // 48px height
}

enum SaboCardVariant {
  default_,
  elevated,
  outlined,
  glass,
  gradient,
}

enum SaboBadgeVariant {
  default_,
  secondary,
  success,
  warning,
  destructive,
  info,
  outline,
}

/// Component size configurations
class SaboComponentSizes {
  // Button sizes
  static const Map<SaboSize, Map<String, double>> buttonSizes = {
    SaboSize.xs: {'height': 28, 'paddingX': 12, 'paddingY': 4, 'fontSize': 12},
    SaboSize.sm: {'height': 32, 'paddingX': 16, 'paddingY': 6, 'fontSize': 13},
    SaboSize.md: {'height': 40, 'paddingX': 20, 'paddingY': 10, 'fontSize': 14},
    SaboSize.lg: {'height': 44, 'paddingX': 24, 'paddingY': 12, 'fontSize': 16},
    SaboSize.xl: {'height': 48, 'paddingX': 28, 'paddingY': 14, 'fontSize': 16},
  };

  // Icon sizes
  static const Map<SaboSize, double> iconSizes = {
    SaboSize.xs: 14,
    SaboSize.sm: 16,
    SaboSize.md: 18,
    SaboSize.lg: 20,
    SaboSize.xl: 22,
  };

  // Avatar sizes
  static const Map<SaboSize, double> avatarSizes = {
    SaboSize.xs: 24,
    SaboSize.sm: 32,
    SaboSize.md: 40,
    SaboSize.lg: 48,
    SaboSize.xl: 56,
  };

  // Badge sizes
  static const Map<SaboSize, Map<String, double>> badgeSizes = {
    SaboSize.xs: {'height': 16, 'paddingX': 6, 'fontSize': 10},
    SaboSize.sm: {'height': 20, 'paddingX': 8, 'fontSize': 11},
    SaboSize.md: {'height': 24, 'paddingX': 10, 'fontSize': 12},
    SaboSize.lg: {'height': 28, 'paddingX': 12, 'fontSize': 13},
    SaboSize.xl: {'height': 32, 'paddingX': 14, 'fontSize': 14},
  };
}

/// Component style getters
class SaboComponentStyles {
  // Get button style based on variant
  static Map<String, dynamic> getButtonStyle(SaboVariant variant) {
    switch (variant) {
      case SaboVariant.primary:
        return {
          'backgroundColor': const Color(0xFF3B82F6),
          'foregroundColor': Colors.white,
          'borderColor': const Color(0xFF3B82F6),
        };
      case SaboVariant.secondary:
        return {
          'backgroundColor': const Color(0xFF1E293B),
          'foregroundColor': const Color(0xFFF8FAFC),
          'borderColor': const Color(0xFF334155),
        };
      case SaboVariant.outline:
        return {
          'backgroundColor': Colors.transparent,
          'foregroundColor': const Color(0xFF3B82F6),
          'borderColor': const Color(0xFF3B82F6),
        };
      case SaboVariant.ghost:
        return {
          'backgroundColor': Colors.transparent,
          'foregroundColor': const Color(0xFF3B82F6),
          'borderColor': Colors.transparent,
        };
      case SaboVariant.destructive:
        return {
          'backgroundColor': const Color(0xFFEF4444),
          'foregroundColor': Colors.white,
          'borderColor': const Color(0xFFEF4444),
        };
      case SaboVariant.success:
        return {
          'backgroundColor': const Color(0xFF22C55E),
          'foregroundColor': Colors.white,
          'borderColor': const Color(0xFF22C55E),
        };
      case SaboVariant.warning:
        return {
          'backgroundColor': const Color(0xFFF59E0B),
          'foregroundColor': Colors.white,
          'borderColor': const Color(0xFFF59E0B),
        };
      case SaboVariant.info:
        return {
          'backgroundColor': const Color(0xFF06B6D4),
          'foregroundColor': Colors.white,
          'borderColor': const Color(0xFF06B6D4),
        };
    }
  }

  // Get card style based on variant
  static Map<String, dynamic> getCardStyle(SaboCardVariant variant) {
    switch (variant) {
      case SaboCardVariant.default_:
        return {
          'backgroundColor': const Color(0xFF1E293B),
          'borderColor': const Color(0xFF334155),
          'elevation': 0.0,
        };
      case SaboCardVariant.elevated:
        return {
          'backgroundColor': const Color(0xFF1E293B),
          'borderColor': const Color(0xFF334155),
          'elevation': 4.0,
        };
      case SaboCardVariant.outlined:
        return {
          'backgroundColor': Colors.transparent,
          'borderColor': const Color(0xFF334155),
          'elevation': 0.0,
        };
      case SaboCardVariant.glass:
        return {
          'backgroundColor': const Color(0x1A1E293B), // 10% opacity
          'borderColor': const Color(0x33334155),     // 20% opacity
          'elevation': 0.0,
          'blur': true,
        };
      case SaboCardVariant.gradient:
        return {
          'gradient': const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
          ),
          'borderColor': const Color(0xFF334155),
          'elevation': 0.0,
        };
    }
  }

  // Get badge style based on variant
  static Map<String, dynamic> getBadgeStyle(SaboBadgeVariant variant) {
    switch (variant) {
      case SaboBadgeVariant.default_:
        return {
          'backgroundColor': const Color(0xFF3B82F6),
          'foregroundColor': Colors.white,
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.secondary:
        return {
          'backgroundColor': const Color(0xFF94A3B8),
          'foregroundColor': const Color(0xFF0F172A),
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.success:
        return {
          'backgroundColor': const Color(0xFF22C55E),
          'foregroundColor': Colors.white,
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.warning:
        return {
          'backgroundColor': const Color(0xFFF59E0B),
          'foregroundColor': Colors.white,
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.destructive:
        return {
          'backgroundColor': const Color(0xFFEF4444),
          'foregroundColor': Colors.white,
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.info:
        return {
          'backgroundColor': const Color(0xFF06B6D4),
          'foregroundColor': Colors.white,
          'borderColor': Colors.transparent,
        };
      case SaboBadgeVariant.outline:
        return {
          'backgroundColor': Colors.transparent,
          'foregroundColor': const Color(0xFF3B82F6),
          'borderColor': const Color(0xFF3B82F6),
        };
    }
  }
}
