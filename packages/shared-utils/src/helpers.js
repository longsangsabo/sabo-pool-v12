/**
 * Array and Object Utility Functions
 * Common data manipulation utilities
 */
/**
 * Group array by key
 */
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = String(item[key]);
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};
/**
 * Sort array by multiple criteria
 */
export const sortBy = (array, ...criteria) => {
    return [...array].sort((a, b) => {
        for (const criterion of criteria) {
            const aVal = criterion(a);
            const bVal = criterion(b);
            if (aVal < bVal)
                return -1;
            if (aVal > bVal)
                return 1;
        }
        return 0;
    });
};
/**
 * Remove duplicates from array
 */
export const unique = (array, key) => {
    if (!key) {
        return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};
/**
 * Chunk array into smaller arrays
 */
export const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
/**
 * Flatten nested arrays
 */
export const flatten = (array) => {
    return array.reduce((acc, item) => {
        return acc.concat(Array.isArray(item) ? flatten(item) : item);
    }, []);
};
/**
 * Pick specific properties from object
 */
export const pick = (obj, keys) => {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
};
/**
 * Omit specific properties from object
 */
export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
};
/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    return cloned;
};
/**
 * Deep merge objects
 */
export const deepMerge = (target, ...sources) => {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return deepMerge(target, ...sources);
};
/**
 * Check if value is object
 */
export const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};
/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
    if (obj == null)
        return true;
    if (Array.isArray(obj))
        return obj.length === 0;
    if (typeof obj === 'object')
        return Object.keys(obj).length === 0;
    if (typeof obj === 'string')
        return obj.trim().length === 0;
    return false;
};
/**
 * Get nested property value safely
 */
export const get = (obj, path, defaultValue) => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }
    return result !== undefined ? result : defaultValue;
};
/**
 * Set nested property value
 */
export const set = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let current = obj;
    for (const key of keys) {
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[lastKey] = value;
};
/**
 * Create lookup map from array
 */
export const createLookup = (array, keyFn) => {
    return array.reduce((lookup, item) => {
        lookup[keyFn(item)] = item;
        return lookup;
    }, {});
};
/**
 * Debounce function calls
 */
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
/**
 * Throttle function calls
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
