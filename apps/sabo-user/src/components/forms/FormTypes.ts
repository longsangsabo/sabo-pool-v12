import { ReactNode } from 'react';
import { FieldError, UseFormReturn } from 'react-hook-form';
import { LucideIcon } from 'lucide-react';

// Core form types
export interface FormProps {
  children: ReactNode;
  onSubmit: (data: any) => void | Promise<void>;
  className?: string;
  loading?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  form?: UseFormReturn<any>;
}

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  type?: FormFieldType;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  form?: UseFormReturn<any>;
  error?: FieldError;
}

export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'rank-selector'
  | 'skill-level'
  | 'tournament-type'
  | 'game-mode';

export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: LucideIcon;
  description?: string;
}

export interface FormFieldValidation {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  custom?: (value: any) => boolean | string;
}

// Specialized form types
export interface TournamentFormData {
  name: string;
  description?: string;
  maxPlayers: number;
  entryFee?: number;
  tournamentType: 'single-elimination' | 'double-elimination' | 'round-robin' | 'sabo-32';
  startDate: string;
  registrationDeadline: string;
  venue?: string;
  rules?: string;
  prizes?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  gameMode?: string;
}

export interface ProfileFormData {
  displayName: string;
  bio?: string;
  location?: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredGameModes: string[];
  avatar?: File;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface ChallengeFormData {
  opponentId: string;
  gameMode: string;
  stakes?: number;
  description?: string;
  venue?: string;
  scheduledDate?: string;
  isRanked: boolean;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, FieldError>;
  values: Record<string, any>;
}
