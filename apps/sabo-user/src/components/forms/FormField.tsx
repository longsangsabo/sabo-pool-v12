import React from 'react';
import { useController } from 'react-hook-form';
import { clsx } from 'clsx';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { FormFieldProps } from './FormTypes';

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  className = '',
  type = 'text',
  options = [],
  validation = {},
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  form,
  error
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  const {
    field,
    fieldState: { error: fieldError }
  } = useController({
    name,
    control: form?.control,
    rules: validation,
    defaultValue: type === 'checkbox' || type === 'switch' ? false : 
                 type === 'multiselect' ? [] : ''
  });

  const currentError = error || fieldError;
  const hasError = !!currentError;

  const baseInputClasses = clsx(
    'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
    {
      // Size and spacing
      'px-4 py-3': type !== 'checkbox' && type !== 'switch' && type !== 'radio',
      'px-4 py-2': type === 'textarea',
      
      // States
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500': !hasError && !disabled,
      'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
      'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
      
      // Icon spacing
      'pl-10': LeftIcon,
      'pr-10': RightIcon || type === 'password',
    }
  );

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            rows={4}
            className={baseInputClasses}
          />
        );
      
      case 'select':
        return (
          <select
            {...field}
            disabled={disabled}
            className={baseInputClasses}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = field.value || [];
                    if (e.target.checked) {
                      field.onChange([...currentValues, option.value]);
                    } else {
                      field.onChange(currentValues.filter((v: any) => v !== option.value));
                    }
                  }}
                  disabled={disabled || option.disabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={clsx('text-sm', {
                  'text-gray-500': disabled || option.disabled,
                  'text-gray-900': !disabled && !option.disabled
                })}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...field}
                  value={option.value}
                  checked={field.value === option.value}
                  disabled={disabled || option.disabled}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={clsx('text-sm', {
                  'text-gray-500': disabled || option.disabled,
                  'text-gray-900': !disabled && !option.disabled
                })}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-xs text-gray-500">{option.description}</span>
                )}
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...field}
              checked={field.value || false}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={clsx('text-sm', {
              'text-gray-500': disabled,
              'text-gray-900': !disabled
            })}>
              {label}
            </span>
          </label>
        );
      
      case 'switch':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                {...field}
                checked={field.value || false}
                disabled={disabled}
                className="sr-only"
              />
              <div className={clsx(
                'block w-12 h-6 rounded-full transition-colors duration-200',
                {
                  'bg-blue-600': field.value,
                  'bg-gray-300': !field.value,
                  'opacity-50 cursor-not-allowed': disabled
                }
              )}>
                <div className={clsx(
                  'absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
                  {
                    'transform translate-x-6': field.value,
                    'transform translate-x-0': !field.value
                  }
                )} />
              </div>
            </div>
            <span className={clsx('text-sm', {
              'text-gray-500': disabled,
              'text-gray-900': !disabled
            })}>
              {label}
            </span>
          </label>
        );
      
      case 'password':
        return (
          <div className="relative">
            <input
              {...field}
              type={showPassword ? 'text' : 'password'}
              placeholder={placeholder}
              disabled={disabled}
              className={baseInputClasses}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        );
      
      default:
        return (
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  if (type === 'checkbox' || type === 'switch') {
    return (
      <div className={clsx('space-y-2', className)}>
        {renderInput()}
        {helperText && (
          <p className="text-sm text-gray-600">{helperText}</p>
        )}
        {currentError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {currentError.message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        {renderInput()}
        
        {RightIcon && type !== 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <RightIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      
      {helperText && !currentError && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}
      
      {currentError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {currentError.message}
        </p>
      )}
    </div>
  );
};

export default FormField;
