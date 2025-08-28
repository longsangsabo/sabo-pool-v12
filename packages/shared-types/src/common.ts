/**
 * Common utility types and interfaces
 * Shared across all SABO Arena applications
 */

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface DatabaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

// ===== FILTER AND SEARCH TYPES =====
export interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  offset?: number;
}

// ===== FORM AND VALIDATION TYPES =====
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_label?: string;
}

export type NotificationType = 
  | 'challenge_received'
  | 'challenge_accepted'
  | 'challenge_declined'
  | 'tournament_registration'
  | 'match_scheduled'
  | 'match_result'
  | 'rank_updated'
  | 'system_announcement'
  | 'admin_message';

// ===== THEME AND UI TYPES =====
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'vi' | 'en';

export interface UIPreferences {
  theme: Theme;
  language: Language;
  sidebarCollapsed?: boolean;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
}

// ===== ERROR TYPES =====
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  context?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// ===== LOADING AND ASYNC STATES =====
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// ===== GENERIC UTILITY TYPES =====
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ===== TIME AND DATE TYPES =====
export interface TimeRange {
  start: string;
  end: string;
}

export interface Schedule {
  day: string;
  timeRanges: TimeRange[];
}

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

// ===== MEDIA AND FILE TYPES =====
export interface MediaFile {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio?: number;
}

export interface UploadProgress {
  file: {
    name: string;
    size: number;
    type: string;
  };
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
