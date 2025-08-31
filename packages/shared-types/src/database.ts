// SABO Pool V12 - Shared Database Types
// Note: For full Database type, import directly from supabase types file
// import { Database } from '@/integrations/supabase/types';

// Common utility types
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface DatabaseStats {
  totalTables: number;
  tablesWithData: number;
  tablesInferred: number;
  lastGenerated: string;
}

// Re-export enums
export * from './enums';
