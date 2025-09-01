import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sabo_flutter/core/design_system/design_tokens.dart';

class SaboTypographySystem {
  // Base text theme using Google Fonts
  static final TextTheme materialTextTheme = GoogleFonts.interTextTheme();

  // Brand Typography
  static TextStyle get brandLogo => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBrandLogo,
    fontWeight: SaboDesignTokens.fontWeightBold,
    height: SaboDesignTokens.lineHeightBrandLogo,
    letterSpacing: -0.02,
  );

  static TextStyle get brandTitle => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBrandTitle,
    fontWeight: SaboDesignTokens.fontWeightSemiBold,
    height: SaboDesignTokens.lineHeightBrandTitle,
    letterSpacing: -0.01,
  );

  // Heading Typography
  static TextStyle get h1 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH1,
    fontWeight: SaboDesignTokens.fontWeightBold,
    height: SaboDesignTokens.lineHeightH1,
    letterSpacing: -0.02,
  );

  static TextStyle get h2 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH2,
    fontWeight: SaboDesignTokens.fontWeightBold,
    height: SaboDesignTokens.lineHeightH2,
    letterSpacing: -0.01,
  );

  static TextStyle get h3 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH3,
    fontWeight: SaboDesignTokens.fontWeightSemiBold,
    height: SaboDesignTokens.lineHeightH3,
    letterSpacing: -0.01,
  );

  static TextStyle get h4 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH4,
    fontWeight: SaboDesignTokens.fontWeightSemiBold,
    height: SaboDesignTokens.lineHeightH4,
  );

  static TextStyle get h5 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH5,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightH5,
  );

  static TextStyle get h6 => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeH6,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightH6,
  );

  // Body Typography
  static TextStyle get bodyLg => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBodyLg,
    fontWeight: SaboDesignTokens.fontWeightRegular,
    height: SaboDesignTokens.lineHeightBodyLg,
  );

  static TextStyle get bodyMd => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBodyMd,
    fontWeight: SaboDesignTokens.fontWeightRegular,
    height: SaboDesignTokens.lineHeightBodyMd,
  );

  static TextStyle get bodySm => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBodySm,
    fontWeight: SaboDesignTokens.fontWeightRegular,
    height: SaboDesignTokens.lineHeightBodySm,
  );

  static TextStyle get bodyXs => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeBodyXs,
    fontWeight: SaboDesignTokens.fontWeightRegular,
    height: SaboDesignTokens.lineHeightBodyXs,
  );

  // Interface Typography
  static TextStyle get buttonLg => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeButtonLg,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightButtonLg,
  );

  static TextStyle get buttonMd => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeButtonMd,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightButtonMd,
  );

  static TextStyle get buttonSm => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeButtonSm,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightButtonSm,
  );

  static TextStyle get label => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeLabel,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightLabel,
    letterSpacing: 0.5,
  );

  static TextStyle get caption => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeCaption,
    fontWeight: SaboDesignTokens.fontWeightRegular,
    height: SaboDesignTokens.lineHeightCaption,
  );

  // Numeric Typography
  static TextStyle get numericLg => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeNumericLg,
    fontWeight: SaboDesignTokens.fontWeightBold,
    height: SaboDesignTokens.lineHeightNumericLg,
    fontFeatures: const [FontFeature.tabularFigures()],
  );

  static TextStyle get numericMd => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeNumericMd,
    fontWeight: SaboDesignTokens.fontWeightSemiBold,
    height: SaboDesignTokens.lineHeightNumericMd,
    fontFeatures: const [FontFeature.tabularFigures()],
  );

  static TextStyle get numericSm => GoogleFonts.inter(
    fontSize: SaboDesignTokens.fontSizeNumericSm,
    fontWeight: SaboDesignTokens.fontWeightMedium,
    height: SaboDesignTokens.lineHeightNumericSm,
    fontFeatures: const [FontFeature.tabularFigures()],
  );

  // Semantic Variants
  static TextStyle get success => bodyMd.copyWith(
    color: SaboDesignTokens.colorSuccess600,
    fontWeight: SaboDesignTokens.fontWeightMedium,
  );

  static TextStyle get warning => bodyMd.copyWith(
    color: SaboDesignTokens.colorWarning600,
    fontWeight: SaboDesignTokens.fontWeightMedium,
  );

  static TextStyle get error => bodyMd.copyWith(
    color: SaboDesignTokens.colorError600,
    fontWeight: SaboDesignTokens.fontWeightMedium,
  );

  static TextStyle get info => bodyMd.copyWith(
    color: SaboDesignTokens.colorInfo600,
    fontWeight: SaboDesignTokens.fontWeightMedium,
  );

  // Gradient Text (using foreground paint)
  static TextStyle get gradientText => h1.copyWith(
    foreground: Paint()
      ..shader = const LinearGradient(
        colors: [
          SaboDesignTokens.colorPrimary600,
          SaboDesignTokens.colorSecondary600,
        ],
      ).createShader(const Rect.fromLTWH(0.0, 0.0, 200.0, 70.0)),
  );

  // Utility methods
  static TextStyle withColor(TextStyle style, Color color) {
    return style.copyWith(color: color);
  }

  static TextStyle withWeight(TextStyle style, FontWeight weight) {
    return style.copyWith(fontWeight: weight);
  }

  static TextStyle withSize(TextStyle style, double size) {
    return style.copyWith(fontSize: size);
  }

  static TextStyle responsive(BuildContext context, TextStyle style) {
    final screenWidth = MediaQuery.of(context).size.width;
    if (screenWidth < 768) {
      return style.copyWith(fontSize: style.fontSize! * 0.9);
    }
    return style;
  }
}
