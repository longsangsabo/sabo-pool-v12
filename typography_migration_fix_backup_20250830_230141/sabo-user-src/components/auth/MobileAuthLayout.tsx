import React from 'react';
import { AuthProgress } from './AuthProgress';

interface MobileAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepLabel?: string;
  onBack?: () => void;
  className?: string;
}

export const MobileAuthLayout: React.FC<MobileAuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showProgress = false,
  currentStep = 1,
  totalSteps = 3,
  stepLabel,
  onBack,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 ${className}`}>
      {/* Mobile-optimized header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Back button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                aria-label="Quay lại"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Title */}
            <h1 className="text-body-large-semibold text-neutral-900 flex-1 text-center">
              {title}
            </h1>

            {/* Spacer for centering */}
            {onBack && <div className="w-10" />}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-body-small-neutral text-center mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        {showProgress && (
          <div className="px-4 pb-4">
            <AuthProgress
              step={currentStep}
              totalSteps={totalSteps}
              currentStep={stepLabel || `Bước ${currentStep}`}
            />
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-sm mx-auto">
          {children}
        </div>
      </div>

      {/* Bottom safe area for mobile */}
      <div className="pb-safe-bottom" />
    </div>
  );
};

// Specialized layouts for different auth flows
interface MobileLoginLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
}

export const MobileLoginLayout: React.FC<MobileLoginLayoutProps> = ({ children, onBack }) => (
  <MobileAuthLayout
    title="Đăng nhập"
    subtitle="Chào mừng bạn quay trở lại"
    onBack={onBack}
  >
    {children}
  </MobileAuthLayout>
);

interface MobileRegisterLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  onBack?: () => void;
}

export const MobileRegisterLayout: React.FC<MobileRegisterLayoutProps> = ({ 
  children, 
  currentStep = 1, 
  onBack 
}) => (
  <MobileAuthLayout
    title="Đăng ký tài khoản"
    subtitle="Tạo tài khoản để bắt đầu"
    showProgress
    currentStep={currentStep}
    totalSteps={3}
    stepLabel={currentStep === 1 ? 'Thông tin' : currentStep === 2 ? 'Xác thực' : 'Hoàn tất'}
    onBack={onBack}
  >
    {children}
  </MobileAuthLayout>
);

interface MobileOtpLayoutProps {
  children: React.ReactNode;
  phone?: string;
  email?: string;
  onBack?: () => void;
}

export const MobileOtpLayout: React.FC<MobileOtpLayoutProps> = ({ 
  children, 
  phone, 
  email, 
  onBack 
}) => (
  <MobileAuthLayout
    title="Xác thực OTP"
    subtitle={
      phone 
        ? `Mã xác thực đã được gửi đến ${phone}`
        : email 
          ? `Mã xác thực đã được gửi đến ${email}`
          : 'Nhập mã xác thực'
    }
    showProgress
    currentStep={2}
    totalSteps={3}
    stepLabel="Xác thực"
    onBack={onBack}
  >
    {children}
  </MobileAuthLayout>
);

// Auth form wrapper with mobile optimizations
interface MobileAuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  className?: string;
}

export const MobileAuthForm: React.FC<MobileAuthFormProps> = ({
  children,
  onSubmit,
  isLoading = false,
  className = ''
}) => (
  <form 
    onSubmit={onSubmit}
    className={`space-y-4 ${className}`}
  >
    {/* Form fields */}
    <div className="form-spacing">
      {children}
    </div>

    {/* Submit area - sticky on mobile for better UX */}
    <div className="sticky bottom-0 bg-white pt-4 pb-safe-bottom">
      <div className="space-y-3">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-body-small-neutral">Đang xử lý...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </form>
);

// Mobile-optimized input field
interface MobileAuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  maxLength?: number;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
}

export const MobileAuthInput: React.FC<MobileAuthInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  autoFocus = false,
  required = false,
  maxLength,
  inputMode
}) => (
  <div className="space-y-2">
    <label className="block text-body-small-medium text-neutral-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      required={required}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`
        w-full px-4 py-3 text-body border rounded-lg transition-all duration-200
        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none
        ${error 
          ? 'border-red-300 bg-error-50' 
          : 'border-neutral-300 bg-white hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        touch-manipulation
      `}
    />
    
    {error && (
      <p className="text-body-small text-error-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

// Mobile-optimized button
interface MobileAuthButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const MobileAuthButton: React.FC<MobileAuthButtonProps> = ({
  children,
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseStyles = "w-full py-3 px-4 text-body-medium rounded-lg transition-all duration-200 touch-manipulation";
  
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-gray-300",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100"
  };

  const disabledStyles = disabled || loading 
    ? "opacity-50 cursor-not-allowed" 
    : "transform active:scale-95";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Đang xử lý...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
