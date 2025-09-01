// lib/core/theme/app_typography.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// SABO Arena Typography - Adapted cho mobile từ web design
class AppTypography {
  AppTypography._();

  static const String fontFamily = 'Inter';

  // Mobile-optimized font sizes
  static const double displayLarge = 36.0;   // Tương đương h1 web
  static const double displayMedium = 32.0;  // Heading lớn
  static const double displaySmall = 28.0;   // Heading trung bình
  static const double headlineLarge = 24.0;  // h2 web
  static const double headlineMedium = 20.0; // h3 web  
  static const double headlineSmall = 18.0;  // h4 web
  static const double titleLarge = 16.0;     // Title lớn
  static const double titleMedium = 14.0;    // Title trung bình
  static const double titleSmall = 12.0;     // Title nhỏ
  static const double bodyLarge = 16.0;      // Body text chính
  static const double bodyMedium = 14.0;     // Body text thường
  static const double bodySmall = 12.0;      // Caption, helper text
  static const double labelLarge = 14.0;     // Button text
  static const double labelMedium = 12.0;    // Chip text
  static const double labelSmall = 10.0;     // Badge text

  // Text Styles with SABO Arena theming
  static TextStyle get displayLarge => GoogleFonts.inter(
        fontSize: AppTypography.displayLarge,
        fontWeight: FontWeight.w700,
        color: AppColors.foreground,
        height: 1.2,
        letterSpacing: -0.5,
      );

  static TextStyle get displayMedium => GoogleFonts.inter(
        fontSize: AppTypography.displayMedium,
        fontWeight: FontWeight.w600,
        color: AppColors.foreground,
        height: 1.25,
        letterSpacing: -0.25,
      );

  static TextStyle get displaySmall => GoogleFonts.inter(
        fontSize: AppTypography.displaySmall,
        fontWeight: FontWeight.w600,
        color: AppColors.foreground,
        height: 1.3,
      );

  static TextStyle get headlineLarge => GoogleFonts.inter(
        fontSize: AppTypography.headlineLarge,
        fontWeight: FontWeight.w600,
        color: AppColors.foreground,
        height: 1.3,
      );

  static TextStyle get headlineMedium => GoogleFonts.inter(
        fontSize: AppTypography.headlineMedium,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.4,
      );

  static TextStyle get headlineSmall => GoogleFonts.inter(
        fontSize: AppTypography.headlineSmall,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.4,
      );

  static TextStyle get titleLarge => GoogleFonts.inter(
        fontSize: AppTypography.titleLarge,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.5,
      );

  static TextStyle get titleMedium => GoogleFonts.inter(
        fontSize: AppTypography.titleMedium,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.5,
      );

  static TextStyle get titleSmall => GoogleFonts.inter(
        fontSize: AppTypography.titleSmall,
        fontWeight: FontWeight.w500,
        color: AppColors.foregroundMuted,
        height: 1.5,
      );

  static TextStyle get bodyLarge => GoogleFonts.inter(
        fontSize: AppTypography.bodyLarge,
        fontWeight: FontWeight.w400,
        color: AppColors.foreground,
        height: 1.5,
      );

  static TextStyle get bodyMedium => GoogleFonts.inter(
        fontSize: AppTypography.bodyMedium,
        fontWeight: FontWeight.w400,
        color: AppColors.foreground,
        height: 1.5,
      );

  static TextStyle get bodySmall => GoogleFonts.inter(
        fontSize: AppTypography.bodySmall,
        fontWeight: FontWeight.w400,
        color: AppColors.foregroundMuted,
        height: 1.5,
      );

  static TextStyle get labelLarge => GoogleFonts.inter(
        fontSize: AppTypography.labelLarge,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.4,
        letterSpacing: 0.1,
      );

  static TextStyle get labelMedium => GoogleFonts.inter(
        fontSize: AppTypography.labelMedium,
        fontWeight: FontWeight.w500,
        color: AppColors.foreground,
        height: 1.4,
        letterSpacing: 0.2,
      );

  static TextStyle get labelSmall => GoogleFonts.inter(
        fontSize: AppTypography.labelSmall,
        fontWeight: FontWeight.w500,
        color: AppColors.foregroundMuted,
        height: 1.4,
        letterSpacing: 0.3,
      );

  // Semantic text styles
  static TextStyle get error => bodyMedium.copyWith(color: AppColors.error);
  static TextStyle get success => bodyMedium.copyWith(color: AppColors.success);
  static TextStyle get warning => bodyMedium.copyWith(color: AppColors.warning);
  static TextStyle get info => bodyMedium.copyWith(color: AppColors.info);

  // Button text styles
  static TextStyle get buttonPrimary => labelLarge.copyWith(
        color: Colors.white,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get buttonSecondary => labelLarge.copyWith(
        color: AppColors.primary500,
        fontWeight: FontWeight.w600,
      );
}
