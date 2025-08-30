// Timezone utility functions for Vietnam (UTC+7)
// File: src/utils/timezone.ts

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Convert datetime-local input (Vietnam time) to UTC for database storage
 * @param datetimeLocal - String from datetime-local input (e.g., "2025-08-13T09:00")
 * @returns UTC ISO string for database storage
 */
export const convertVietnamToUTC = (datetimeLocal: string): string => {
  if (!datetimeLocal) return '';
  
  // Add Vietnam timezone offset to make it explicit
  const vietnamDateTime = new Date(datetimeLocal + '+07:00');
  return vietnamDateTime.toISOString();
};

/**
 * Convert UTC datetime from database to Vietnam local time for display
 * @param utcDateTime - UTC ISO string from database
 * @returns Formatted Vietnam time string
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
    const date = new Date(utcDateTime);
    const now = new Date();
    return date > now;
  } catch {
    return false;
  }
};

/**
 * Get current Vietnam time in datetime-local format
 * @returns datetime-local format string for default values
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
