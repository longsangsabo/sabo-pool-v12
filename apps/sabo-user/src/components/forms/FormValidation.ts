import { FormFieldValidation } from './FormTypes';

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required') => ({
    required: message
  }),
  
  email: (message = 'Please enter a valid email address') => ({
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message
    }
  }),
  
  minLength: (min: number, message?: string) => ({
    minLength: {
      value: min,
      message: message || `Must be at least ${min} characters`
    }
  }),
  
  maxLength: (max: number, message?: string) => ({
    maxLength: {
      value: max,
      message: message || `Must be no more than ${max} characters`
    }
  }),
  
  phoneNumber: (message = 'Please enter a valid phone number') => ({
    pattern: {
      value: /^[\+]?[0-9\-\(\)\s]+$/,
      message
    }
  }),
  
  strongPassword: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character') => ({
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message
    }
  }),
  
  url: (message = 'Please enter a valid URL') => ({
    pattern: {
      value: /^https?:\/\/.+\..+/,
      message
    }
  }),
  
  positiveNumber: (message = 'Must be a positive number') => ({
    min: {
      value: 0.01,
      message
    }
  }),
  
  integer: (message = 'Must be a whole number') => ({
    pattern: {
      value: /^\d+$/,
      message
    }
  }),
  
  // Gaming specific validations
  playerName: (message = 'Player name can only contain letters, numbers, and underscores') => ({
    pattern: {
      value: /^[a-zA-Z0-9_]+$/,
      message
    }
  }),
  
  tournamentName: (message = 'Tournament name must be 3-50 characters') => ({
    minLength: { value: 3, message: 'Tournament name must be at least 3 characters' },
    maxLength: { value: 50, message: 'Tournament name must be no more than 50 characters' }
  }),
  
  maxPlayers: (min = 2, max = 64, message?: string) => ({
    min: {
      value: min,
      message: message || `Must have at least ${min} players`
    },
    max: {
      value: max,
      message: message || `Cannot exceed ${max} players`
    }
  }),
  
  entryFee: (min = 0, max = 10000, message?: string) => ({
    min: {
      value: min,
      message: message || `Entry fee cannot be negative`
    },
    max: {
      value: max,
      message: message || `Entry fee cannot exceed $${max}`
    }
  }),
  
  futureDate: (message = 'Date must be in the future') => ({
    custom: (value: string) => {
      const date = new Date(value);
      const now = new Date();
      return date > now || message;
    }
  }),
  
  weekdayOnly: (message = 'Please select a weekday') => ({
    custom: (value: string) => {
      const date = new Date(value);
      const day = date.getDay();
      return (day >= 1 && day <= 5) || message;
    }
  })
};

// Combine multiple validation rules
export const combineValidation = (...rules: FormFieldValidation[]): FormFieldValidation => {
  return rules.reduce((combined, rule) => ({ ...combined, ...rule }), {});
};

// Common validation presets
export const commonValidations = {
  displayName: combineValidation(
    validationRules.required(),
    validationRules.minLength(2),
    validationRules.maxLength(30),
    validationRules.playerName()
  ),
  
  email: combineValidation(
    validationRules.required(),
    validationRules.email()
  ),
  
  password: combineValidation(
    validationRules.required(),
    validationRules.strongPassword()
  ),
  
  tournamentName: combineValidation(
    validationRules.required(),
    validationRules.tournamentName()
  ),
  
  maxPlayers: combineValidation(
    validationRules.required(),
    validationRules.maxPlayers()
  ),
  
  entryFee: validationRules.entryFee(),
  
  phoneNumber: combineValidation(
    validationRules.required(),
    validationRules.phoneNumber()
  ),
  
  websiteUrl: validationRules.url(),
  
  futureDate: combineValidation(
    validationRules.required(),
    validationRules.futureDate()
  )
};
