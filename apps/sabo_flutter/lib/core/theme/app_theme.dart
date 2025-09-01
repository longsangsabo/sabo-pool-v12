import 'package:flutter/material.dart';
import '../design_system/design_tokens.dart';
import '../design_system/typography_system.dart';

class SaboTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: SaboDesignTokens.colorPrimary600,
        onPrimary: Colors.white,
        secondary: SaboDesignTokens.colorSecondary600,
        onSecondary: Colors.white,
        surface: SaboDesignTokens.colorNeutral50,
        onSurface: SaboDesignTokens.colorNeutral900,
        error: SaboDesignTokens.colorError600,
        onError: Colors.white,
      ),
      textTheme: SaboTypographySystem.materialTextTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: SaboDesignTokens.colorPrimary950,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.all(SaboDesignTokens.colorPrimary600),
          foregroundColor: WidgetStateProperty.all(Colors.white),
          padding: WidgetStateProperty.all(
            EdgeInsets.symmetric(
              vertical: SaboDesignTokens.spacingMd,
              horizontal: SaboDesignTokens.spacingLg,
            ),
          ),
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
            ),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorNeutral300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorNeutral300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorPrimary600, width: 2),
        ),
        contentPadding: EdgeInsets.symmetric(
          vertical: SaboDesignTokens.spacingMd,
          horizontal: SaboDesignTokens.spacingSm,
        ),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusLg),
        ),
      ),
      scaffoldBackgroundColor: SaboDesignTokens.colorNeutral50,
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: SaboDesignTokens.colorPrimary400,
        onPrimary: SaboDesignTokens.colorPrimary950,
        secondary: SaboDesignTokens.colorSecondary400,
        onSecondary: SaboDesignTokens.colorSecondary950,
        surface: SaboDesignTokens.colorNeutral900,
        onSurface: SaboDesignTokens.colorNeutral100,
        error: SaboDesignTokens.colorError400,
        onError: SaboDesignTokens.colorError950,
      ),
      textTheme: SaboTypographySystem.materialTextTheme.apply(
        bodyColor: SaboDesignTokens.colorNeutral100,
        displayColor: SaboDesignTokens.colorNeutral100,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: SaboDesignTokens.colorNeutral900,
        foregroundColor: SaboDesignTokens.colorNeutral100,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.all(SaboDesignTokens.colorPrimary600),
          foregroundColor: WidgetStateProperty.all(Colors.white),
          padding: WidgetStateProperty.all(
            EdgeInsets.symmetric(
              vertical: SaboDesignTokens.spacingMd,
              horizontal: SaboDesignTokens.spacingLg,
            ),
          ),
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
            ),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorNeutral700),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorNeutral700),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusBase),
          borderSide: BorderSide(color: SaboDesignTokens.colorPrimary400, width: 2),
        ),
        contentPadding: EdgeInsets.symmetric(
          vertical: SaboDesignTokens.spacingMd,
          horizontal: SaboDesignTokens.spacingSm,
        ),
      ),
      cardTheme: CardTheme(
        color: SaboDesignTokens.colorNeutral800,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SaboDesignTokens.borderRadiusLg),
        ),
      ),
      scaffoldBackgroundColor: SaboDesignTokens.colorNeutral950,
    );
  }
}
