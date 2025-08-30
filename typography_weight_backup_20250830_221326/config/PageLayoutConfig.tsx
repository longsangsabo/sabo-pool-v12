// Page Layout Standardization System with Theme Support
// Unified layout patterns for all SABO Arena pages

import React from 'react';
import { cn } from '@/lib/utils';
import { SABO_DESIGN_TOKENS } from './DesignSystemConfig';
import { useThemedStyles } from '../contexts/ThemeContext';

// Standard page layout variants
export type PageVariant = 
  | 'dashboard'     // Full width dashboard pages
  | 'content'       // Content-focused pages (profile, settings)
  | 'tournament'    // Tournament listing and detail pages
  | 'challenge'     // Challenge system pages
  | 'admin'         // Admin panel pages
  | 'auth'          // Authentication pages
  | 'marketing';    // Landing and marketing pages

// Standard container widths and constraints with theme support
export const getPageLayouts = (getThemedValue: any) => ({
  dashboard: {
    container: 'w-full',
    maxWidth: 'max-w-none',
    padding: {
      mobile: 'px-4 py-4',
      desktop: 'px-6 py-6'
    },
    background: getThemedValue('bg-neutral-50', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  content: {
    container: 'container mx-auto',
    maxWidth: 'max-w-4xl',
    padding: {
      mobile: 'px-4 py-6',
      desktop: 'px-6 py-8'
    },
    background: getThemedValue('bg-background', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  tournament: {
    container: 'container mx-auto',
    maxWidth: 'max-w-7xl',
    padding: {
      mobile: 'px-4 py-4',
      desktop: 'px-6 py-6'
    },
    background: getThemedValue('bg-neutral-50', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  challenge: {
    container: 'container mx-auto',
    maxWidth: 'max-w-6xl',
    padding: {
      mobile: 'px-4 py-4',
      desktop: 'px-6 py-6'
    },
    background: getThemedValue('bg-background', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  admin: {
    container: 'w-full',
    maxWidth: 'max-w-none',
    padding: {
      mobile: 'px-4 py-4',
      desktop: 'px-6 py-6'
    },
    background: getThemedValue('bg-neutral-50', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  auth: {
    container: 'container mx-auto',
    maxWidth: 'max-w-md',
    padding: {
      mobile: 'px-4 py-8',
      desktop: 'px-6 py-12'
    },
    background: getThemedValue('bg-background', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  },
  
  marketing: {
    container: 'w-full',
    maxWidth: 'max-w-none',
    padding: {
      mobile: 'px-0 py-0',
      desktop: 'px-0 py-0'
    },
    background: getThemedValue('bg-white', 'bg-neutral-900'),
    minHeight: 'min-h-screen'
  }
}) as const;

// Section spacing standardization
export const SECTION_SPACING = {
  // Vertical spacing between major sections
  section: {
    mobile: 'space-y-6',
    desktop: 'space-y-8'
  },
  
  // Spacing within components
  component: {
    mobile: 'space-y-4',
    desktop: 'space-y-6'
  },
  
  // Small element spacing
  element: {
    mobile: 'space-y-2',
    desktop: 'space-y-3'
  }
} as const;

// Card layout standardization
export const CARD_LAYOUTS = {
  // Standard card for content
  standard: {
    wrapper: 'bg-white rounded-lg border border-neutral-200 shadow-sm',
    header: 'p-4 md:p-6 border-b border-neutral-200',
    content: 'p-4 md:p-6',
    footer: 'p-4 md:p-6 border-t border-neutral-200 bg-neutral-50'
  },
  
  // Compact card for listings
  compact: {
    wrapper: 'bg-white rounded-md border border-neutral-200 shadow-sm',
    header: 'p-3 md:p-4 border-b border-neutral-200',
    content: 'p-3 md:p-4',
    footer: 'p-3 md:p-4 border-t border-neutral-200'
  },
  
  // Feature card for highlights
  feature: {
    wrapper: 'bg-white rounded-xl border border-neutral-200 shadow-md hover:shadow-lg transition-shadow',
    header: 'p-6 md:p-8 border-b border-neutral-200',
    content: 'p-6 md:p-8',
    footer: 'p-6 md:p-8 border-t border-neutral-200 bg-neutral-50'
  },
  
  // Tournament specific card
  tournament: {
    wrapper: 'bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-200',
    header: 'relative h-48 md:h-56 rounded-t-lg overflow-hidden',
    content: 'p-4 md:p-6',
    footer: 'p-4 md:p-6 border-t border-neutral-200'
  },
  
  // Challenge card
  challenge: {
    wrapper: 'bg-white rounded-lg border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all',
    header: 'p-4 md:p-6',
    content: 'p-4 md:p-6 pt-0',
    footer: 'p-4 md:p-6 border-t border-neutral-200'
  }
} as const;

// Grid system standardization
export const GRID_LAYOUTS = {
  // Dashboard stats grid
  stats: {
    mobile: 'grid grid-cols-2 gap-3',
    tablet: 'grid grid-cols-2 gap-4',
    desktop: 'grid grid-cols-4 gap-6'
  },
  
  // Tournament listing grid
  tournaments: {
    mobile: 'grid grid-cols-1 gap-4',
    tablet: 'grid grid-cols-2 gap-6',
    desktop: 'grid grid-cols-3 gap-6'
  },
  
  // Challenge grid
  challenges: {
    mobile: 'grid grid-cols-1 gap-3',
    tablet: 'grid grid-cols-1 gap-4',
    desktop: 'grid grid-cols-2 gap-6'
  },
  
  // Admin panel grid
  admin: {
    mobile: 'grid grid-cols-1 gap-4',
    tablet: 'grid grid-cols-2 gap-6',
    desktop: 'grid grid-cols-3 gap-8'
  },
  
  // Profile sections
  profile: {
    mobile: 'grid grid-cols-1 gap-6',
    tablet: 'grid grid-cols-1 gap-8',
    desktop: 'grid grid-cols-3 gap-8'
  }
} as const;

// Typography standardization for pages
export const PAGE_TYPOGRAPHY = {
  // Page title styling
  pageTitle: {
    mobile: 'text-heading md:text-3xl font-bold text-neutral-900 mb-2',
    desktop: 'text-3xl md:text-4xl font-bold text-neutral-900 mb-2'
  },
  
  // Page description
  pageDescription: {
    mobile: 'text-body-small md:text-body text-neutral-600 mb-6',
    desktop: 'text-body md:text-body-large text-neutral-600 mb-8'
  },
  
  // Section titles
  sectionTitle: {
    mobile: 'text-body-large md:text-title font-semibold text-neutral-900 mb-4',
    desktop: 'text-title md:text-heading font-semibold text-neutral-900 mb-6'
  },
  
  // Card titles
  cardTitle: {
    mobile: 'text-body md:text-body-large font-semibold text-neutral-900',
    desktop: 'text-body-large md:text-title font-semibold text-neutral-900'
  },
  
  // Card descriptions
  cardDescription: {
    mobile: 'text-body-small text-neutral-600',
    desktop: 'text-body-small md:text-body text-neutral-600'
  }
} as const;

// Button size standardization
export const BUTTON_SIZES = {
  sm: {
    mobile: 'px-3 py-2 text-body-small min-h-[44px]', // Touch-friendly height
    desktop: 'px-3 py-2 text-body-small min-h-[36px]'
  },
  
  base: {
    mobile: 'px-4 py-2 text-body min-h-[48px]',
    desktop: 'px-4 py-2 text-body min-h-[40px]'
  },
  
  lg: {
    mobile: 'px-6 py-3 text-body-large min-h-[52px]',
    desktop: 'px-6 py-3 text-body-large min-h-[44px]'
  }
} as const;

// Standard page header component
interface StandardPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: PageVariant;
  className?: string;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  title,
  description,
  actions,
  variant = 'content',
  className
}) => {
  const { getThemedValue } = useThemedStyles();
  const pageLayouts = getPageLayouts(getThemedValue);
  const layout = pageLayouts[variant];
  
  return (
    <div className={cn(
      getThemedValue('border-b border-neutral-200 bg-white', 'border-b border-gray-700 bg-neutral-800'),
      layout.padding.mobile,
      `md:${layout.padding.desktop}`,
      className
    )}>
      <div className={cn(layout.container, layout.maxWidth)}>
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className={PAGE_TYPOGRAPHY.pageTitle.mobile}>
              {title}
            </h1>
            {description && (
              <p className={PAGE_TYPOGRAPHY.pageDescription.mobile}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Standard page wrapper component
interface StandardPageWrapperProps {
  children: React.ReactNode;
  variant?: PageVariant;
  header?: React.ReactNode;
  className?: string;
}

export const StandardPageWrapper: React.FC<StandardPageWrapperProps> = ({
  children,
  variant = 'content',
  header,
  className
}) => {
  const { getThemedValue } = useThemedStyles();
  const pageLayouts = getPageLayouts(getThemedValue);
  const layout = pageLayouts[variant];
  
  return (
    <div className={cn(layout.background, layout.minHeight, className)}>
      {header}
      <div className={cn(
        layout.container,
        layout.maxWidth,
        layout.padding.mobile,
        `md:${layout.padding.desktop}`
      )}>
        {children}
      </div>
    </div>
  );
};

// Utility functions for responsive classes
export const getResponsiveGridClass = (
  gridType: keyof typeof GRID_LAYOUTS,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile'
) => {
  return GRID_LAYOUTS[gridType][breakpoint];
};

export const getResponsiveSpacing = (
  spacingType: keyof typeof SECTION_SPACING,
  breakpoint: 'mobile' | 'desktop' = 'mobile'
) => {
  return SECTION_SPACING[spacingType][breakpoint];
};

export const getCardLayoutClass = (cardType: keyof typeof CARD_LAYOUTS) => {
  return CARD_LAYOUTS[cardType];
};

// Export types
// Type exports for theme-aware layouts
export type PageLayoutConfig = ReturnType<typeof getPageLayouts>;
export type CardLayoutConfig = typeof CARD_LAYOUTS;
export type GridLayoutConfig = typeof GRID_LAYOUTS;
