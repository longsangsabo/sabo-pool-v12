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
