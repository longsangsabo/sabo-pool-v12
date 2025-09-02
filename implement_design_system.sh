#!/bin/bash

# 🎨 SABO Pool Mobile - Design System Implementation Script
# Generated from UI/UX Audit Report - September 1, 2025

echo "🚀 Starting SABO Pool Design System Implementation..."

# Create design system directory structure
echo "📁 Creating design system directory structure..."
mkdir -p apps/sabo_flutter/lib/design_system/{tokens,components,themes,utils}
mkdir -p apps/sabo_flutter/lib/design_system/components/{buttons,cards,forms,navigation}

# Create color tokens file
echo "🎨 Creating color tokens..."
cat > apps/sabo_flutter/lib/design_system/tokens/colors.dart << 'EOF'
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
EOF

# Create typography tokens
echo "📝 Creating typography tokens..."
cat > apps/sabo_flutter/lib/design_system/tokens/typography.dart << 'EOF'
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
EOF

# Create spacing tokens
echo "📏 Creating spacing tokens..."
cat > apps/sabo_flutter/lib/design_system/tokens/spacing.dart << 'EOF'
/// SABO Pool Design System - Spacing Scale
/// Based on 4px base unit with semantic naming
class SaboSpacing {
  // Base unit: 4px
  static const base = 4.0;

  // Spacing Scale
  static const none = 0.0;
  static const xxs = base * 1;      // 4px - Tight spacing
  static const xs = base * 2;       // 8px - Small gaps
  static const sm = base * 3;       // 12px - Default spacing
  static const md = base * 4;       // 16px - Card padding
  static const lg = base * 5;       // 20px - Section spacing
  static const xl = base * 6;       // 24px - Major spacing
  static const xxl = base * 8;      // 32px - Hero spacing
  static const xxxl = base * 10;    // 40px - Screen padding

  // Semantic Spacing
  static const buttonPadding = md;
  static const cardPadding = lg;
  static const screenPadding = lg;
  static const sectionSpacing = xl;
  static const heroSpacing = xxxl;

  // Component Specific
  static const listItemSpacing = sm;
  static const iconTextSpacing = xs;
  static const formFieldSpacing = md;
  static const modalPadding = xl;
}
EOF

# Create elevation tokens
echo "🌟 Creating elevation tokens..."
cat > apps/sabo_flutter/lib/design_system/tokens/elevation.dart << 'EOF'
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
EOF

# Create main design system index
echo "📦 Creating design system index..."
cat > apps/sabo_flutter/lib/design_system/sabo_design_system.dart << 'EOF'
/// SABO Pool Design System
/// Main entry point for design tokens and components
/// 
/// Usage:
/// import 'package:sabo_flutter/design_system/sabo_design_system.dart';

// Tokens
export 'tokens/colors.dart';
export 'tokens/typography.dart';
export 'tokens/spacing.dart';
export 'tokens/elevation.dart';

// Components (to be implemented)
// export 'components/buttons/sabo_button.dart';
// export 'components/cards/sabo_card.dart';
// export 'components/forms/sabo_text_field.dart';
// export 'components/navigation/sabo_app_bar.dart';

// Themes
// export 'themes/sabo_theme.dart';
EOF

echo "✅ Design system foundation created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Import design system in your screens:"
echo "   import 'package:sabo_flutter/design_system/sabo_design_system.dart';"
echo ""
echo "2. Replace hardcoded values with design tokens:"
echo "   Color(0xFF2196F3) → SaboColors.primary"
echo "   fontSize: 18 → SaboTextStyles.titleMedium"
echo "   padding: EdgeInsets.all(16) → EdgeInsets.all(SaboSpacing.md)"
echo ""
echo "3. Run the app and verify no breaking changes:"
echo "   flutter run"
echo ""
echo "🎨 Design System Implementation Phase 1 Complete!"
