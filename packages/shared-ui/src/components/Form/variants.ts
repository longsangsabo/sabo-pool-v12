/**
 * Form Components - Standardized form patterns
 * Consistent form layouts and field patterns
 */

// Form field layouts - cleaned up từ audit
export const FormField = {
  // Standard vertical field
  vertical: {
    container: 'flex flex-col gap-2',
    label: {
      position: 'relative',
      typography: 'text-sm font-medium text-neutral-900',
      spacing: 'mb-1'
    },
    input: {
      size: 'h-10 px-3',
      border: 'border border-neutral-200 rounded-md',
      background: 'bg-white',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
      disabled: 'disabled:bg-neutral-50 disabled:text-neutral-500'
    },
    error: {
      typography: 'text-xs text-error-600',
      spacing: 'mt-1'
    },
    help: {
      typography: 'text-xs text-neutral-500',
      spacing: 'mt-1'
    }
  },
  
  // Horizontal field layout
  horizontal: {
    container: 'flex items-center gap-4',
    label: {
      position: 'flex-shrink-0',
      typography: 'text-sm font-medium text-neutral-900',
      width: 'w-32'
    },
    input: {
      size: 'h-10 px-3 flex-1',
      border: 'border border-neutral-200 rounded-md',
      background: 'bg-white',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500'
    }
  },
  
  // Inline field (label + input same line)
  inline: {
    container: 'flex items-center gap-3',
    label: {
      typography: 'text-sm font-medium text-neutral-900',
      spacing: 'whitespace-nowrap'
    },
    input: {
      size: 'h-8 px-2',
      border: 'border border-neutral-200 rounded',
      background: 'bg-white',
      width: 'w-auto'
    }
  }
} as const;

// Form actions - button groups and actions
export const FormActions = {
  // Standard submit/cancel layout
  standard: {
    container: 'flex items-center justify-end gap-3 pt-6 border-t border-neutral-200',
    primary: {
      variant: 'default',
      size: 'default'
    },
    secondary: {
      variant: 'outline', 
      size: 'default'
    }
  },
  
  // Full width single action
  single: {
    container: 'pt-6',
    primary: {
      variant: 'default',
      size: 'lg',
      width: 'w-full'
    }
  },
  
  // Stacked actions (mobile-friendly)
  stacked: {
    container: 'flex flex-col gap-3 pt-6',
    primary: {
      variant: 'default',
      size: 'default',
      width: 'w-full'
    },
    secondary: {
      variant: 'outline',
      size: 'default', 
      width: 'w-full'
    }
  },
  
  // Inline actions (small forms)
  inline: {
    container: 'flex items-center gap-2',
    primary: {
      variant: 'default',
      size: 'sm'
    },
    secondary: {
      variant: 'ghost',
      size: 'sm'
    }
  }
} as const;

// Input variants - different input types
export const InputVariants = {
  // Standard text input
  text: {
    base: 'w-full h-10 px-3 py-2 text-sm border rounded-md transition-colors',
    default: 'border-neutral-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50',
    error: 'border-error-300 bg-error-50 focus:border-error-500 focus:ring-2 focus:ring-error-500/50',
    disabled: 'border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed'
  },
  
  // Textarea
  textarea: {
    base: 'w-full min-h-20 px-3 py-2 text-sm border rounded-md transition-colors resize-y',
    default: 'border-neutral-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50'
  },
  
  // Select dropdown
  select: {
    base: 'w-full h-10 px-3 py-2 text-sm border rounded-md transition-colors appearance-none bg-no-repeat bg-right',
    default: 'border-neutral-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50',
    icon: 'bg-[url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")] bg-[length:20px_20px] bg-[right_8px_center]'
  },
  
  // Checkbox
  checkbox: {
    base: 'h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500/50',
    container: 'flex items-center gap-2'
  },
  
  // Radio
  radio: {
    base: 'h-4 w-4 border-neutral-300 text-primary-600 focus:ring-primary-500/50',
    container: 'flex items-center gap-2'
  }
} as const;

// Form sections - grouping related fields
export const FormSection = {
  // Standard section with title
  standard: {
    container: 'space-y-6',
    header: {
      container: 'pb-4 border-b border-neutral-200',
      title: 'text-lg font-semibold text-neutral-900',
      description: 'text-sm text-neutral-600 mt-1'
    },
    content: 'space-y-4'
  },
  
  // Compact section
  compact: {
    container: 'space-y-4',
    header: {
      title: 'text-base font-medium text-neutral-900',
      description: 'text-sm text-neutral-600'
    },
    content: 'space-y-3'
  },
  
  // Card section
  card: {
    container: 'bg-white border border-neutral-200 rounded-lg p-6 space-y-4',
    header: {
      title: 'text-lg font-semibold text-neutral-900',
      description: 'text-sm text-neutral-600 mt-1'
    },
    content: 'space-y-4'
  }
} as const;

export type FormFieldVariant = keyof typeof FormField;
export type FormActionVariant = keyof typeof FormActions;
export type InputVariant = keyof typeof InputVariants;
export type FormSectionVariant = keyof typeof FormSection;
