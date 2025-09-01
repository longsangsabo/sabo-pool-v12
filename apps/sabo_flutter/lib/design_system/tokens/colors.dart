import 'package:flutter/material.dart';

/// SABO Pool Design System - Color Tokens
/// Generated from UI/UX Audit - Sept 1, 2025
class SaboColors {
  // Primary Brand Colors
  static const primary = Color(0xFF2196F3);
  static const primaryVariant = Color(0xFF1976D2);
  static const secondary = Color(0xFF21CBF3);
  static const accent = Color(0xFF9C27B0);

  // Surface Colors (Dark Theme)
  static const surface = Color(0xFF121212);
  static const surfaceVariant = Color(0xFF1a1a1a);
  static const surfaceContainer = Color(0xFF1e1e1e);
  static const surfaceContainerHigh = Color(0xFF2a2a2a);
  static const surfaceContainerHighest = Color(0xFF2D3748);

  // Semantic Colors
  static const success = Color(0xFF4CAF50);
  static const warning = Color(0xFFFF9800);
  static const error = Color(0xFFFF5722);
  static const info = Color(0xFF2196F3);

  // Text Colors
  static const onSurface = Colors.white;
  static const onSurfaceVariant = Color(0xFFE0E0E0);
  static const onSurfaceSecondary = Color(0xFFBDBDBD);
  static const onSurfaceDisabled = Color(0xFF757575);

  // Gradient Presets
  static const primaryGradient = LinearGradient(
    colors: [primary, secondary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const surfaceGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [surface, surfaceContainerHigh],
  );

  // Tournament Status Colors
  static const statusActive = success;
  static const statusPending = warning;
  static const statusCompleted = Color(0xFF757575);
  static const statusCancelled = error;
}
