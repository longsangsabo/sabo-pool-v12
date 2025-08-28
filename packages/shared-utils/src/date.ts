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
 * Format tournament date time
 */
export const formatTournamentDateTime = (dateString: string): string => {
  if (!dateString) return 'Chưa xác định';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Chưa xác định';
  }
};

/**
 * Format tournament date range
 */
export const formatTournamentDateRange = (
  startDate: string | null,
  endDate: string | null
): string => {
  if (!startDate && !endDate) return 'Chưa xác định';

  if (startDate && endDate) {
    const start = formatTournamentDateTime(startDate);
    const end = formatTournamentDateTime(endDate);

    if (start === 'Chưa xác định' || end === 'Chưa xác định') {
      return 'Chưa xác định';
    }

    // If same date, just show time range
    const startDateOnly = startDate.split('T')[0];
    const endDateOnly = endDate.split('T')[0];

    if (startDateOnly === endDateOnly) {
      const startTime = new Date(startDate).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const endTime = new Date(endDate).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dateStr = new Date(startDate).toLocaleDateString('vi-VN');
      return `${dateStr} (${startTime} - ${endTime})`;
    }

    return `${start} - ${end}`;
  }

  if (startDate) return `Từ ${formatTournamentDateTime(startDate)}`;
  if (endDate) return `Đến ${formatTournamentDateTime(endDate)}`;

  return 'Chưa xác định';
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

/**
 * Get datetime-local value from UTC datetime for form inputs
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
 * Get current Vietnam time in datetime-local format
 */
export const getCurrentVietnamDatetimeLocal = (): string => {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-CA', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(', ', 'T'));
  
  return vietnamTime.toISOString().slice(0, 16);
};

/**
 * Check if a datetime is in the future (Vietnam time)
 */
export const isFutureTime = (utcDateTime: string): boolean => {
  if (!utcDateTime) return false;
  
  try {
    const date = new Date(utcDateTime);
    const now = new Date();
    return date > now;
  } catch {
    return false;
  }
};

/**
 * Safely format date with fallback options
 */
export const formatSafeDate = (
  primaryDate: string | null | undefined,
  fallbackDate?: string | null | undefined,
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
 * Safely format date with time
 */
export const formatSafeDateWithTime = (
  primaryDate: string | null | undefined,
  fallbackDate?: string | null | undefined
): string => {
  return formatSafeDate(primaryDate, fallbackDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
