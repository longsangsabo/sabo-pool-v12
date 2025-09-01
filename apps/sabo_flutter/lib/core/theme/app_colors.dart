// lib/core/theme/app_colors.dart
import 'package:flutter/material.dart';

/// SABO Arena Colors - Copy từ web design system
class AppColors {
  AppColors._();

  // Primary colors (exact từ SABO Arena web)
  static const Color primary50 = Color(0xFFEFF6FF);
  static const Color primary100 = Color(0xFFDBEAFE);
  static const Color primary200 = Color(0xFFBFDBFE);
  static const Color primary300 = Color(0xFF93C5FD);
  static const Color primary400 = Color(0xFF60A5FA);
  static const Color primary500 = Color(0xFF3B82F6);
  static const Color primary600 = Color(0xFF2563EB);
  static const Color primary700 = Color(0xFF1D4ED8);
  static const Color primary800 = Color(0xFF1E40AF);
  static const Color primary900 = Color(0xFF1E3A8A);

  // Dark theme (primary theme của SABO)
  static const Color background = Color(0xFF0F172A);
  static const Color backgroundSecondary = Color(0xFF1E293B);
  static const Color foreground = Color(0xFFF8FAFC);
  static const Color foregroundMuted = Color(0xFF94A3B8);
  static const Color muted = Color(0xFF1E293B);
  static const Color accent = Color(0xFF1E40AF);
  static const Color border = Color(0xFF334155);
  static const Color card = Color(0xFF1E293B);

  // Semantic colors
  static const Color success = Color(0xFF10B981);
  static const Color successBackground = Color(0xFF064E3B);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBackground = Color(0xFF92400E);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBackground = Color(0xFF991B1B);
  static const Color info = Color(0xFF06B6D4);
  static const Color infoBackground = Color(0xFF0E7490);

  // Gray scale
  static const Color gray50 = Color(0xFFF8FAFC);
  static const Color gray100 = Color(0xFFF1F5F9);
  static const Color gray200 = Color(0xFFE2E8F0);
  static const Color gray300 = Color(0xFFCBD5E1);
  static const Color gray400 = Color(0xFF94A3B8);
  static const Color gray500 = Color(0xFF64748B);
  static const Color gray600 = Color(0xFF475569);
  static const Color gray700 = Color(0xFF334155);
  static const Color gray800 = Color(0xFF1E293B);
  static const Color gray900 = Color(0xFF0F172A);

  // Gradient colors
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary500, primary700],
  );

  static const LinearGradient darkGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [background, backgroundSecondary],
  );
}
