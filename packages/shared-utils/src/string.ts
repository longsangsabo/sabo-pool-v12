/**
 * String Utility Functions
 * Consolidated from SABO Arena codebase including sanitization from validation.ts
 */

/**
 * Truncate string with ellipsis
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert to title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate slug from string
 */
export const generateSlug = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Sanitize input to prevent XSS
 * Consolidated from apps/sabo-user/src/utils/validation.ts
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

/**
 * Advanced HTML sanitization
 */
export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Remove diacritics (Vietnamese accents)
 */
export const removeDiacritics = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Extract initials from name
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidVietnamesePhone = (phone: string): boolean => {
  // Vietnamese phone number patterns
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Format Vietnamese phone numbers (0xxx xxx xxx)
  if (phone.length === 10 && phone.startsWith('0')) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`;
  }
  return phone;
};

/**
 * Mask sensitive information
 */
export const maskString = (str: string, visibleStart: number = 3, visibleEnd: number = 3): string => {
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.substring(0, visibleStart);
  const end = str.substring(str.length - visibleEnd);
  const masked = '*'.repeat(str.length - visibleStart - visibleEnd);
  return `${start}${masked}${end}`;
};

/**
 * Extract display name from profile
 */
export const getDisplayName = (profile: any): string => {
  if (profile?.display_name) return profile.display_name;
  if (profile?.full_name) return profile.full_name;
  if (profile?.nickname) return profile.nickname;
  if (profile?.email) return profile.email.split('@')[0];
  return 'Người dùng';
};

/**
 * Search highlight utility
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Clean and normalize search query
 */
export const normalizeSearchQuery = (query: string): string => {
  return removeDiacritics(query.toLowerCase().trim());
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Parse URL parameters
 */
export const parseUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

/**
 * Build URL with parameters
 */
export const buildUrlWithParams = (baseUrl: string, params: Record<string, any>): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};
