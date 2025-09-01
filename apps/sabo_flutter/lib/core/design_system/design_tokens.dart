import 'package:flutter/material.dart';

/// SABO Design Tokens - Copy chính xác từ web DesignSystemConfig.ts
class SaboDesignTokens {
  // ================================
  // TYPOGRAPHY TOKENS
  // ================================
  
  // Font Family
  static const String fontFamilyPrimary = 'Inter';
  
  // Font Sizes (responsive, mobile tối ưu)
  static const double fontSizeXs = 12.0;
  static const double fontSizeSm = 14.0;
  static const double fontSizeBase = 16.0;
  static const double fontSizeLg = 18.0;
  static const double fontSizeXl = 20.0;
  static const double fontSize2xl = 24.0;
  static const double fontSize3xl = 30.0;
  static const double fontSize4xl = 36.0;
  static const double fontSize5xl = 48.0;

  // Brand Typography
  static const double fontSizeBrandLogo = 32.0;
  static const double fontSizeBrandTitle = 24.0;
  static const double lineHeightBrandLogo = 1.2;
  static const double lineHeightBrandTitle = 1.3;

  // Heading Typography
  static const double fontSizeH1 = 48.0;
  static const double fontSizeH2 = 36.0;
  static const double fontSizeH3 = 30.0;
  static const double fontSizeH4 = 24.0;
  static const double fontSizeH5 = 20.0;
  static const double fontSizeH6 = 18.0;
  static const double lineHeightH1 = 1.2;
  static const double lineHeightH2 = 1.25;
  static const double lineHeightH3 = 1.3;
  static const double lineHeightH4 = 1.35;
  static const double lineHeightH5 = 1.4;
  static const double lineHeightH6 = 1.45;

  // Body Typography
  static const double fontSizeBodyLg = 18.0;
  static const double fontSizeBodyMd = 16.0;
  static const double fontSizeBodySm = 14.0;
  static const double fontSizeBodyXs = 12.0;
  static const double lineHeightBodyLg = 1.7;
  static const double lineHeightBodyMd = 1.6;
  static const double lineHeightBodySm = 1.55;
  static const double lineHeightBodyXs = 1.5;

  // Interface Typography
  static const double fontSizeButtonLg = 16.0;
  static const double fontSizeButtonMd = 14.0;
  static const double fontSizeButtonSm = 12.0;
  static const double fontSizeLabel = 12.0;
  static const double fontSizeCaption = 11.0;
  static const double lineHeightButtonLg = 1.5;
  static const double lineHeightButtonMd = 1.45;
  static const double lineHeightButtonSm = 1.4;
  static const double lineHeightLabel = 1.35;
  static const double lineHeightCaption = 1.3;

  // Numeric Typography
  static const double fontSizeNumericLg = 28.0;
  static const double fontSizeNumericMd = 20.0;
  static const double fontSizeNumericSm = 16.0;
  static const double lineHeightNumericLg = 1.2;
  static const double lineHeightNumericMd = 1.25;
  static const double lineHeightNumericSm = 1.3;

  // Font Weights
  static const FontWeight fontWeightLight = FontWeight.w300;
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium = FontWeight.w500;
  static const FontWeight fontWeightSemiBold = FontWeight.w600;
  static const FontWeight fontWeightBold = FontWeight.w700;
  static const FontWeight fontWeightExtraBold = FontWeight.w800;

  // ================================
  // COLOR SYSTEM
  // ================================
  
  // Primary Colors (Blue/Purple gradient system)
  static const Color colorPrimary50 = Color(0xFFF0F4FF);
  static const Color colorPrimary100 = Color(0xFFE0E9FF);
  static const Color colorPrimary200 = Color(0xFFC7D6FE);
  static const Color colorPrimary300 = Color(0xFFA5B8FC);
  static const Color colorPrimary400 = Color(0xFF8B93F8);
  static const Color colorPrimary500 = Color(0xFF7C6CF2);
  static const Color colorPrimary600 = Color(0xFF6D48E8);
  static const Color colorPrimary700 = Color(0xFF5E35CD);
  static const Color colorPrimary800 = Color(0xFF4C2BA5);
  static const Color colorPrimary900 = Color(0xFF41247E);
  static const Color colorPrimary950 = Color(0xFF291549);

  // Secondary Colors (Cyan/Teal system)
  static const Color colorSecondary50 = Color(0xFFECFDF5);
  static const Color colorSecondary100 = Color(0xFFD1FAE5);
  static const Color colorSecondary200 = Color(0xFFA7F3D0);
  static const Color colorSecondary300 = Color(0xFF6EE7B7);
  static const Color colorSecondary400 = Color(0xFF34D399);
  static const Color colorSecondary500 = Color(0xFF10B981);
  static const Color colorSecondary600 = Color(0xFF059669);
  static const Color colorSecondary700 = Color(0xFF047857);
  static const Color colorSecondary800 = Color(0xFF065F46);
  static const Color colorSecondary900 = Color(0xFF064E3B);
  static const Color colorSecondary950 = Color(0xFF022C22);

  // Neutral Colors (Gray system)
  static const Color colorNeutral50 = Color(0xFFFAFAFA);
  static const Color colorNeutral100 = Color(0xFFF4F4F5);
  static const Color colorNeutral200 = Color(0xFFE4E4E7);
  static const Color colorNeutral300 = Color(0xFFD4D4D8);
  static const Color colorNeutral400 = Color(0xFFA1A1AA);
  static const Color colorNeutral500 = Color(0xFF71717A);
  static const Color colorNeutral600 = Color(0xFF52525B);
  static const Color colorNeutral700 = Color(0xFF3F3F46);
  static const Color colorNeutral800 = Color(0xFF27272A);
  static const Color colorNeutral900 = Color(0xFF18181B);
  static const Color colorNeutral950 = Color(0xFF09090B);

  // Success Colors
  static const Color colorSuccess50 = Color(0xFFF0FDF4);
  static const Color colorSuccess100 = Color(0xFFDCFCE7);
  static const Color colorSuccess200 = Color(0xFFBBF7D0);
  static const Color colorSuccess300 = Color(0xFF86EFAC);
  static const Color colorSuccess400 = Color(0xFF4ADE80);
  static const Color colorSuccess500 = Color(0xFF22C55E);
  static const Color colorSuccess600 = Color(0xFF16A34A);
  static const Color colorSuccess700 = Color(0xFF15803D);
  static const Color colorSuccess800 = Color(0xFF166534);
  static const Color colorSuccess900 = Color(0xFF14532D);
  static const Color colorSuccess950 = Color(0xFF052E16);

  // Warning Colors
  static const Color colorWarning50 = Color(0xFFFFFBEB);
  static const Color colorWarning100 = Color(0xFFFEF3C7);
  static const Color colorWarning200 = Color(0xFFFDE68A);
  static const Color colorWarning300 = Color(0xFFFCD34D);
  static const Color colorWarning400 = Color(0xFFFBBF24);
  static const Color colorWarning500 = Color(0xFFF59E0B);
  static const Color colorWarning600 = Color(0xFFD97706);
  static const Color colorWarning700 = Color(0xFFB45309);
  static const Color colorWarning800 = Color(0xFF92400E);
  static const Color colorWarning900 = Color(0xFF78350F);
  static const Color colorWarning950 = Color(0xFF451A03);

  // Error Colors
  static const Color colorError50 = Color(0xFFFEF2F2);
  static const Color colorError100 = Color(0xFFFEE2E2);
  static const Color colorError200 = Color(0xFFFECACA);
  static const Color colorError300 = Color(0xFFFCA5A5);
  static const Color colorError400 = Color(0xFFF87171);
  static const Color colorError500 = Color(0xFFEF4444);
  static const Color colorError600 = Color(0xFFDC2626);
  static const Color colorError700 = Color(0xFFB91C1C);
  static const Color colorError800 = Color(0xFF991B1B);
  static const Color colorError900 = Color(0xFF7F1D1D);
  static const Color colorError950 = Color(0xFF450A0A);

  // Info Colors
  static const Color colorInfo50 = Color(0xFFEFF6FF);
  static const Color colorInfo100 = Color(0xFFDBEAFE);
  static const Color colorInfo200 = Color(0xFFBFDBFE);
  static const Color colorInfo300 = Color(0xFF93C5FD);
  static const Color colorInfo400 = Color(0xFF60A5FA);
  static const Color colorInfo500 = Color(0xFF3B82F6);
  static const Color colorInfo600 = Color(0xFF2563EB);
  static const Color colorInfo700 = Color(0xFF1D4ED8);
  static const Color colorInfo800 = Color(0xFF1E40AF);
  static const Color colorInfo900 = Color(0xFF1E3A8A);
  static const Color colorInfo950 = Color(0xFF172554);

  // ================================
  // SPACING SYSTEM
  // ================================
  
  static const double spacingXs = 4.0;
  static const double spacingSm = 8.0;
  static const double spacingMd = 16.0;
  static const double spacingLg = 24.0;
  static const double spacingXl = 32.0;
  static const double spacing2xl = 40.0;
  static const double spacing3xl = 48.0;
  static const double spacing4xl = 64.0;
  static const double spacing5xl = 80.0;

  // ================================
  // BORDER RADIUS
  // ================================
  
  static const double borderRadiusNone = 0.0;
  static const double borderRadiusSm = 4.0;
  static const double borderRadiusBase = 8.0;
  static const double borderRadiusMd = 12.0;
  static const double borderRadiusLg = 16.0;
  static const double borderRadiusXl = 20.0;
  static const double borderRadius2xl = 24.0;
  static const double borderRadius3xl = 32.0;
  static const double borderRadiusFull = 9999.0;

  // ================================
  // SHADOWS
  // ================================
  
  static const List<BoxShadow> shadowSm = [
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  static const List<BoxShadow> shadowBase = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 1),
      blurRadius: 3,
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 1),
      blurRadius: 2,
      spreadRadius: 0,
    ),
  ];

  static const List<BoxShadow> shadowMd = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 4),
      blurRadius: 6,
      spreadRadius: -1,
    ),
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 2),
      blurRadius: 4,
      spreadRadius: -1,
    ),
  ];

  static const List<BoxShadow> shadowLg = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 10),
      blurRadius: 15,
      spreadRadius: -3,
    ),
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 4),
      blurRadius: 6,
      spreadRadius: -2,
    ),
  ];

  static const List<BoxShadow> shadowXl = [
    BoxShadow(
      color: Color(0x1A000000),
      offset: Offset(0, 20),
      blurRadius: 25,
      spreadRadius: -5,
    ),
    BoxShadow(
      color: Color(0x0F000000),
      offset: Offset(0, 10),
      blurRadius: 10,
      spreadRadius: -5,
    ),
  ];

  // ================================
  // GRADIENTS
  // ================================
  
  static const LinearGradient gradientPrimary = LinearGradient(
    colors: [colorPrimary600, colorSecondary600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientSecondary = LinearGradient(
    colors: [colorSecondary500, colorInfo500],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientSuccess = LinearGradient(
    colors: [colorSuccess500, colorSuccess600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientWarning = LinearGradient(
    colors: [colorWarning400, colorWarning600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientError = LinearGradient(
    colors: [colorError500, colorError600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ================================
  // ANIMATION DURATIONS
  // ================================
  
  static const Duration animationFast = Duration(milliseconds: 150);
  static const Duration animationBase = Duration(milliseconds: 200);
  static const Duration animationSlow = Duration(milliseconds: 300);
  static const Duration animationSlower = Duration(milliseconds: 500);

  // ================================
  // BREAKPOINTS (cho responsive design)
  // ================================
  
  static const double breakpointSm = 640.0;
  static const double breakpointMd = 768.0;
  static const double breakpointLg = 1024.0;
  static const double breakpointXl = 1280.0;
  static const double breakpoint2xl = 1536.0;
}
