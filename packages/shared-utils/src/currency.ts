/**
 * Currency and Number Formatting Utilities
 * Consolidated from SABO Arena codebase (apps/sabo-user/src/utils/prizeUtils.ts + existing)
 */

/**
 * Format currency for display (Vietnamese VND) - Full format
 */
/**
 * Format currency value with VND symbol
 * Handles both number and string inputs
 */
export const formatCurrency = (amount: number | string): string => {
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return '0 ₫';
    amount = parsed;
  }
  
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format price with VND symbol (alias for formatCurrency)
 */
export const formatPrice = (amount: number | string): string => {
  return formatCurrency(amount);
};

/**
 * Format currency with abbreviation (K, M) - Short format
 * Merged from prizeUtils.ts - popular in tournament displays
 */
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M VND`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K VND`;
  }
  return `${amount.toLocaleString()} VND`;
};

/**
 * Format prize amount (alias for formatCurrencyShort - commonly used in tournaments)
 */
export const formatPrizeAmount = formatCurrencyShort;

/**
 * Format bytes for file size display
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and parse
  const cleaned = currencyString.replace(/[^\d,.-]/g, '');
  return parseFloat(cleaned.replace(/,/g, '')) || 0;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Round to decimal places
 */
export const roundToDecimal = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
