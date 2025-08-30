/**
 * Date and Time Utility Functions
 * Extracted from SABO Arena codebase
 */

// Vietnam timezone constant
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Convert datetime-local input (Vietnam time) to UTC for database storage
 */
export const convertVietnamToUTC = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  
  // Add Vietnam timezone offset to make it explicit
  const vietnamDateTime = new Date(datetimeLocal + '+07:00');
  return vietnamDateTime.toISOString();
};

/**
 * Convert UTC datetime from database to Vietnam local time for display
 */
export const formatVietnamTime = (utcDateTime: string): string => {
  if (!utcDateTime) return 'Không xác định';
  
  try {
    const date = new Date(utcDateTime);
    return date.toLocaleString('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Không xác định';
  }
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Chưa xác định';
  
  try {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'Chưa xác định';
  }
};

/**
 * Safely formats a date string with fallback options
 * @param primaryDate - The primary date field to use
 * @param fallbackDate - The fallback date field if primary is null/undefined
 * @param options - Formatting options for toLocaleDateString
 * @returns Formatted date string or 'Chưa xác định' if no valid date
 */
export const formatSafeDate = (
  primaryDate: string | undefined | null,
  fallbackDate?: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateToUse = primaryDate || fallbackDate;

  if (!dateToUse) {
    return 'Chưa xác định';
  }

  try {
    const date = new Date(dateToUse);
    if (isNaN(date.getTime())) {
      return 'Chưa xác định';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };

    return date.toLocaleDateString('vi-VN', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Chưa xác định';
  }
};

/**
 * Safely formats a date string with time
 * @param primaryDate - The primary date field to use
 * @param fallbackDate - The fallback date field if primary is null/undefined
 * @returns Formatted date and time string or 'Chưa xác định' if no valid date
 */
export const formatSafeDateWithTime = (
  primaryDate: string | undefined | null,
  fallbackDate?: string | undefined | null
): string => {
  return formatSafeDate(primaryDate, fallbackDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get datetime-local value from UTC datetime for form inputs
 * @param utcDateTime - UTC ISO string from database
 * @returns datetime-local format string (YYYY-MM-DDTHH:mm)
 */
export const getDatetimeLocalValue = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const date = new Date(utcDateTime);
    // Convert to Vietnam time and format for datetime-local input
    const vietnamTime = new Date(date.toLocaleString('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(', ', 'T'));
    
    return vietnamTime.toISOString().slice(0, 16);
  } catch {
    return '';
  }
};

/**
 * Format time for display in cards and lists
 * @param utcDateTime - UTC ISO string from database
 * @returns Short time format (HH:mm DD/MM/YYYY)
 */
export const formatShortTime = (utcDateTime: string): string => {
  if (!utcDateTime) return '';
  
  try {
    const date = new Date(utcDateTime);
    return date.toLocaleString('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * Check if a datetime is in the future (Vietnam time)
 * @param utcDateTime - UTC ISO string
 * @returns boolean
 */
export const isFutureTime = (utcDateTime: string): boolean => {
  if (!utcDateTime) return false;
  
  try {
    const utcDate = new Date(utcDateTime);
    const now = new Date();
    return utcDate > now;
  } catch {
    return false;
  }
};

/**
 * Check if a datetime is in the past (Vietnam time)
 * @param utcDateTime - UTC ISO string
 * @returns boolean
 */
export const isPastTime = (utcDateTime: string): boolean => {
  if (!utcDateTime) return false;
  
  try {
    const utcDate = new Date(utcDateTime);
    const now = new Date();
    return utcDate < now;
  } catch {
    return false;
  }
};

/**
 * Format time for display
 */
export const formatTime = (dateString: string): string => {
  if (!dateString) return 'Chưa xác định';
  
  try {
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Chưa xác định';
  }
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'Chưa xác định';
  
  try {
    return new Date(dateString).toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Chưa xác định';
  }
};

/**
 * Format short time for cards and lists
 */
// Duplicate function commented out
// export const formatShortTime = (utcDateTime: string): string => {
//   if (!utcDateTime) return '';
//   
//   try {
//     const date = new Date(utcDateTime);
//     return date.toLocaleString('vi-VN', {
//       timeZone: VIETNAM_TIMEZONE,
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   } catch {
//     return '';
//   }
// };

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  const diffInMinutes = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} tháng trước`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};
