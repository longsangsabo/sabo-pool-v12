import 'package:flutter/material.dart';

/// SABO Pool Design System - Elevation System
class SaboElevation {
  // Material Design 3 Elevation Levels
  static const level0 = 0.0;   // Surface
  static const level1 = 1.0;   // Cards, buttons
  static const level2 = 3.0;   // FAB, snackbar
  static const level3 = 6.0;   // Modal, drawer
  static const level4 = 8.0;   // Navigation bar
  static const level5 = 12.0;  // App bar, modal

  // Shadow Definitions
  static List<BoxShadow> shadowLevel1 = [
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      blurRadius: 4,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> shadowLevel2 = [
    BoxShadow(
      color: Colors.black.withOpacity(0.15),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> shadowLevel3 = [
    BoxShadow(
      color: Colors.black.withOpacity(0.2),
      blurRadius: 12,
      offset: const Offset(0, 6),
    ),
  ];

  // Glow Effects for Tournament Cards
  static List<BoxShadow> primaryGlow = [
    BoxShadow(
      color: const Color(0xFF2196F3).withOpacity(0.3),
      blurRadius: 15,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> successGlow = [
    BoxShadow(
      color: const Color(0xFF4CAF50).withOpacity(0.3),
      blurRadius: 12,
      offset: const Offset(0, 6),
    ),
  ];
}
