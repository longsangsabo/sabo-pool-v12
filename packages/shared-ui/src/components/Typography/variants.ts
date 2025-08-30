/**
 * Typography Components - Standardized từ audit findings
 * 15+ random combinations → 6 systematic scales
 */

// Heading component - H1-H6 standardized
export const Heading = {
  h1: {
    fontSize: 'text-4xl',      // 36px
    lineHeight: 'leading-10',   // 40px
    fontWeight: 'font-bold',    // 700
    letterSpacing: 'tracking-tight'
  },
  h2: {
    fontSize: 'text-3xl',      // 30px
    lineHeight: 'leading-9',    // 36px  
    fontWeight: 'font-bold',    // 700
    letterSpacing: 'tracking-tight'
  },
  h3: {
    fontSize: 'text-2xl',      // 24px
    lineHeight: 'leading-8',    // 32px
    fontWeight: 'font-semibold', // 600
    letterSpacing: 'tracking-normal'
  },
  h4: {
    fontSize: 'text-xl',       // 20px
    lineHeight: 'leading-7',    // 28px
    fontWeight: 'font-semibold', // 600
    letterSpacing: 'tracking-normal'
  },
  h5: {
    fontSize: 'text-lg',       // 18px
    lineHeight: 'leading-7',    // 28px
    fontWeight: 'font-medium',   // 500
    letterSpacing: 'tracking-normal'
  },
  h6: {
    fontSize: 'text-base',     // 16px
    lineHeight: 'leading-6',    // 24px
    fontWeight: 'font-medium',   // 500
    letterSpacing: 'tracking-normal'
  }
} as const;

// Body text variants - cleaned up from audit chaos
export const BodyText = {
  // Main body text
  body: {
    fontSize: 'text-base',     // 16px
    lineHeight: 'leading-6',    // 24px
    fontWeight: 'font-normal',   // 400
    color: 'text-neutral-900'
  },
  // Small body text
  bodySmall: {
    fontSize: 'text-sm',       // 14px
    lineHeight: 'leading-5',    // 20px
    fontWeight: 'font-normal',   // 400
    color: 'text-neutral-900'
  },
  // Large body text
  bodyLarge: {
    fontSize: 'text-lg',       // 18px
    lineHeight: 'leading-7',    // 28px
    fontWeight: 'font-normal',   // 400
    color: 'text-neutral-900'
  },
  // Muted text (secondary info)
  muted: {
    fontSize: 'text-sm',       // 14px
    lineHeight: 'leading-5',    // 20px
    fontWeight: 'font-normal',   // 400
    color: 'text-neutral-600'
  },
  // Caption text (smallest)
  caption: {
    fontSize: 'text-xs',       // 12px
    lineHeight: 'leading-4',    // 16px
    fontWeight: 'font-normal',   // 400
    color: 'text-neutral-500'
  }
} as const;

// UI Element typography - common patterns từ audit
export const UIText = {
  // Form labels
  label: {
    fontSize: 'text-sm',       // 14px
    lineHeight: 'leading-5',    // 20px
    fontWeight: 'font-medium',   // 500
    color: 'text-neutral-900'
  },
  // Button text
  button: {
    fontSize: 'text-sm',       // 14px
    lineHeight: 'leading-5',    // 20px
    fontWeight: 'font-semibold', // 600
    letterSpacing: 'tracking-normal'
  },
  // Badge/Status text
  badge: {
    fontSize: 'text-xs',       // 12px
    lineHeight: 'leading-4',    // 16px
    fontWeight: 'font-medium',   // 500
    letterSpacing: 'tracking-wide'
  },
  // Link text
  link: {
    fontSize: 'text-base',     // 16px
    lineHeight: 'leading-6',    // 24px
    fontWeight: 'font-medium',   // 500
    color: 'text-primary-600',
    decoration: 'underline underline-offset-4'
  }
} as const;

// Typography combinations - frequently used patterns from audit
export const TypographyCombinations = {
  // Card titles (very common pattern)
  cardTitle: {
    ...Heading.h5,
    color: 'text-neutral-900'
  },
  // Modal titles
  modalTitle: {
    ...Heading.h3,
    color: 'text-neutral-900'
  },
  // Section titles
  sectionTitle: {
    ...Heading.h4,
    color: 'text-neutral-900'
  },
  // Form field labels
  fieldLabel: {
    ...UIText.label
  },
  // Error messages
  errorText: {
    ...BodyText.bodySmall,
    color: 'text-error-600'
  },
  // Success messages
  successText: {
    ...BodyText.bodySmall,
    color: 'text-success-600'
  },
  // Status indicators
  statusText: {
    ...UIText.badge,
    textTransform: 'uppercase'
  }
} as const;

export type HeadingLevel = keyof typeof Heading;
export type BodyTextVariant = keyof typeof BodyText;
export type UITextVariant = keyof typeof UIText;
