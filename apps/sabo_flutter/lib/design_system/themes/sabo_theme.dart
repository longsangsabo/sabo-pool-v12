import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../design_system/sabo_design_system.dart';

/// SABO Pool - Unified Theme Configuration
/// Replaces scattered color definitions with design tokens
class SaboTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      
      // Color Scheme using Design Tokens
      colorScheme: ColorScheme.dark(
        primary: SaboColors.primary,
        primaryContainer: SaboColors.primaryVariant,
        secondary: SaboColors.secondary,
        surface: SaboColors.surface,
        surfaceVariant: SaboColors.surfaceVariant,
        surfaceContainer: SaboColors.surfaceContainer,
        onSurface: SaboColors.onSurface,
        onSurfaceVariant: SaboColors.onSurfaceVariant,
        error: SaboColors.error,
      ),
      
      // Scaffold Background
      scaffoldBackgroundColor: SaboColors.surface,
      
      // App Bar Theme
      appBarTheme: AppBarTheme(
        backgroundColor: SaboColors.surfaceVariant,
        elevation: SaboElevation.level1,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: SaboTextStyles.titleLarge.copyWith(
          color: SaboColors.onSurface,
        ),
      ),
      
      // Bottom Navigation Theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: SaboColors.surfaceVariant,
        selectedItemColor: SaboColors.primary,
        unselectedItemColor: SaboColors.onSurfaceSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: SaboElevation.level4,
        selectedLabelStyle: SaboTextStyles.labelSmall,
        unselectedLabelStyle: SaboTextStyles.labelSmall,
      ),
      
      // Card Theme
      cardTheme: CardTheme(
        color: SaboColors.surfaceContainer,
        elevation: SaboElevation.level1,
        shadowColor: Colors.black.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: EdgeInsets.all(SaboSpacing.xs),
      ),
      
      // Text Theme using Typography Tokens
      textTheme: TextTheme(
        displayLarge: SaboTextStyles.displayLarge.copyWith(color: SaboColors.onSurface),
        displayMedium: SaboTextStyles.displayMedium.copyWith(color: SaboColors.onSurface),
        displaySmall: SaboTextStyles.displaySmall.copyWith(color: SaboColors.onSurface),
        headlineLarge: SaboTextStyles.headlineLarge.copyWith(color: SaboColors.onSurface),
        headlineMedium: SaboTextStyles.headlineMedium.copyWith(color: SaboColors.onSurface),
        headlineSmall: SaboTextStyles.headlineSmall.copyWith(color: SaboColors.onSurface),
        titleLarge: SaboTextStyles.titleLarge.copyWith(color: SaboColors.onSurface),
        titleMedium: SaboTextStyles.titleMedium.copyWith(color: SaboColors.onSurface),
        titleSmall: SaboTextStyles.titleSmall.copyWith(color: SaboColors.onSurface),
        bodyLarge: SaboTextStyles.bodyLarge.copyWith(color: SaboColors.onSurfaceVariant),
        bodyMedium: SaboTextStyles.bodyMedium.copyWith(color: SaboColors.onSurfaceVariant),
        bodySmall: SaboTextStyles.bodySmall.copyWith(color: SaboColors.onSurfaceSecondary),
        labelLarge: SaboTextStyles.labelLarge.copyWith(color: SaboColors.onSurface),
        labelMedium: SaboTextStyles.labelMedium.copyWith(color: SaboColors.onSurfaceVariant),
        labelSmall: SaboTextStyles.labelSmall.copyWith(color: SaboColors.onSurfaceSecondary),
      ),
      
      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: SaboColors.primary,
          foregroundColor: Colors.white,
          elevation: SaboElevation.level1,
          padding: EdgeInsets.symmetric(
            horizontal: SaboSpacing.lg,
            vertical: SaboSpacing.md,
          ),
          textStyle: SaboTextStyles.labelLarge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      
      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: SaboColors.surfaceContainer,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: SaboColors.onSurfaceSecondary),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: SaboColors.onSurfaceSecondary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: SaboColors.primary, width: 2),
        ),
        contentPadding: EdgeInsets.all(SaboSpacing.md),
        labelStyle: SaboTextStyles.bodyMedium.copyWith(
          color: SaboColors.onSurfaceVariant,
        ),
      ),
    );
  }
}
