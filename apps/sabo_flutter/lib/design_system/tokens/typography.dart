import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// SABO Pool Design System - Typography Scale
/// Based on Material Design 3 type scale
class SaboTextStyles {
  // Display Styles
  static TextStyle displayLarge = GoogleFonts.inter(
    fontSize: 57, fontWeight: FontWeight.w400, height: 1.12,
  );

  static TextStyle displayMedium = GoogleFonts.inter(
    fontSize: 45, fontWeight: FontWeight.w400, height: 1.16,
  );

  static TextStyle displaySmall = GoogleFonts.inter(
    fontSize: 36, fontWeight: FontWeight.w400, height: 1.22,
  );

  // Headline Styles
  static TextStyle headlineLarge = GoogleFonts.inter(
    fontSize: 32, fontWeight: FontWeight.w700, height: 1.25,
  );

  static TextStyle headlineMedium = GoogleFonts.inter(
    fontSize: 28, fontWeight: FontWeight.w600, height: 1.29,
  );

  static TextStyle headlineSmall = GoogleFonts.inter(
    fontSize: 24, fontWeight: FontWeight.w600, height: 1.33,
  );

  // Title Styles
  static TextStyle titleLarge = GoogleFonts.inter(
    fontSize: 22, fontWeight: FontWeight.w600, height: 1.27,
  );

  static TextStyle titleMedium = GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w600, height: 1.50,
  );

  static TextStyle titleSmall = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w600, height: 1.43,
  );

  // Label Styles
  static TextStyle labelLarge = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w500, height: 1.43,
  );

  static TextStyle labelMedium = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w500, height: 1.33,
  );

  static TextStyle labelSmall = GoogleFonts.inter(
    fontSize: 11, fontWeight: FontWeight.w500, height: 1.45,
  );

  // Body Styles
  static TextStyle bodyLarge = GoogleFonts.inter(
    fontSize: 16, fontWeight: FontWeight.w400, height: 1.50,
  );

  static TextStyle bodyMedium = GoogleFonts.inter(
    fontSize: 14, fontWeight: FontWeight.w400, height: 1.43,
  );

  static TextStyle bodySmall = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w400, height: 1.33,
  );

  // Custom SABO Styles
  static TextStyle tournamentTitle = GoogleFonts.inter(
    fontSize: 20, fontWeight: FontWeight.w700, height: 1.2,
  );

  static TextStyle prizeAmount = GoogleFonts.inter(
    fontSize: 18, fontWeight: FontWeight.w600, height: 1.22,
  );

  static TextStyle statsValue = GoogleFonts.inter(
    fontSize: 24, fontWeight: FontWeight.w700, height: 1.0,
  );

  static TextStyle statsLabel = GoogleFonts.inter(
    fontSize: 12, fontWeight: FontWeight.w500, height: 1.0,
  );
}
