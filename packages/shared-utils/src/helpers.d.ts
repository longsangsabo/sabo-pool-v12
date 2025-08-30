/**
 * Array and Object Utility Functions
 * Common data manipulation utilities
 */
/**
 * Group array by key
 */
export declare const groupBy: <T>(array: T[], key: keyof T) => Record<string, T[]>;
/**
 * Sort array by multiple criteria
 */
export declare const sortBy: <T>(array: T[], ...criteria: Array<(item: T) => any>) => T[];
/**
 * Remove duplicates from array
 */
export declare const unique: <T>(array: T[], key?: keyof T) => T[];
/**
 * Chunk array into smaller arrays
 */
export declare const chunk: <T>(array: T[], size: number) => T[][];
/**
 * Flatten nested arrays
 */
export declare const flatten: <T>(array: (T | T[])[]) => T[];
/**
 * Pick specific properties from object
 */
export declare const pick: <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
/**
 * Omit specific properties from object
 */
export declare const omit: <T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>;
/**
 * Deep clone object
 */
export declare const deepClone: <T>(obj: T) => T;
/**
 * Deep merge objects
 */
export declare const deepMerge: <T>(target: T, ...sources: any[]) => T;
/**
 * Check if value is object
 */
export declare const isObject: (item: any) => boolean;
/**
 * Check if object is empty
 */
export declare const isEmpty: (obj: any) => boolean;
/**
 * Get nested property value safely
 */
export declare const get: (obj: any, path: string, defaultValue?: any) => any;
/**
 * Set nested property value
 */
export declare const set: (obj: any, path: string, value: any) => void;
/**
 * Create lookup map from array
 */
export declare const createLookup: <T>(array: T[], keyFn: (item: T) => string | number) => Record<string | number, T>;
/**
 * Debounce function calls
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void;
/**
 * Throttle function calls
 */
export declare const throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => (...args: Parameters<T>) => void;
