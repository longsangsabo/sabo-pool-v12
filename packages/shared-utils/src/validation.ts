/**
 * Validation Utility Functions
 * Form validation and data validation utilities
 */

// Local type definitions for validation
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

/**
 * Validate required field
 */
export const validateRequired = (value: any, fieldName: string): FormError | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return {
      field: fieldName,
      message: `${fieldName} là bắt buộc`,
    };
  }
  return null;
};

/**
 * Validate email
 */
export const validateEmail = (email: string): FormError | null => {
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      message: 'Email không hợp lệ',
    };
  }
  return null;
};

/**
 * Validate Vietnamese phone number
 */
export const validatePhone = (phone: string): FormError | null => {
  if (!phone) return null;
  
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return {
      field: 'phone',
      message: 'Số điện thoại không hợp lệ',
    };
  }
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): FormError | null => {
  if (!password) return null;
  
  if (password.length < 8) {
    return {
      field: 'password',
      message: 'Mật khẩu phải có ít nhất 8 ký tự',
    };
  }
  
  // Check for at least one number and one letter
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    return {
      field: 'password',
      message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số',
    };
  }
  
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): FormError | null => {
  if (password !== confirmPassword) {
    return {
      field: 'confirmPassword',
      message: 'Mật khẩu xác nhận không khớp',
    };
  }
  return null;
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): FormError | null => {
  if (value < min || value > max) {
    return {
      field: fieldName,
      message: `${fieldName} phải từ ${min} đến ${max}`,
    };
  }
  return null;
};

/**
 * Validate string length
 */
export const validateStringLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): FormError | null => {
  if (value.length < min || value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} phải từ ${min} đến ${max} ký tự`,
    };
  }
  return null;
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): FormError | null => {
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return {
      field: 'url',
      message: 'URL không hợp lệ',
    };
  }
};

/**
 * Validate date range
 */
export const validateDateRange = (
  startDate: string,
  endDate: string
): FormError | null => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return {
      field: 'dateRange',
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
    };
  }
  return null;
};

/**
 * Validate future date
 */
export const validateFutureDate = (date: string, fieldName: string): FormError | null => {
  const inputDate = new Date(date);
  const now = new Date();
  
  if (inputDate <= now) {
    return {
      field: fieldName,
      message: `${fieldName} phải là thời gian trong tương lai`,
    };
  }
  return null;
};

/**
 * Validate form data
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ((value: any) => FormError | null)[]>
): ValidationResult => {
  const errors: FormError[] = [];
  
  Object.entries(rules).forEach(([field, validators]) => {
    const value = data[field];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors.push(error);
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize HTML input
 */
export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

/**
 * Validate file type
 */
export const validateFileType = (
  file: { type: string; name: string },
  allowedTypes: string[]
): FormError | null => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const isValidType = allowedTypes.some(type => 
    file.type.includes(type) || (fileExtension && type.includes(fileExtension))
  );
  
  if (!isValidType) {
    return {
      field: 'file',
      message: `Loại file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`,
    };
  }
  return null;
};

/**
 * Validate file size
 */
export const validateFileSize = (
  file: { size: number },
  maxSizeInMB: number
): FormError | null => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  
  if (file.size > maxSizeInBytes) {
    return {
      field: 'file',
      message: `Kích thước file vượt quá ${maxSizeInMB}MB`,
    };
  }
  return null;
};
