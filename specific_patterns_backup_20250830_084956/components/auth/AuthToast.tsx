import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';

interface AuthToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AuthToastContextType {
  addToast: (toast: Omit<AuthToast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const AuthToastContext = createContext<AuthToastContextType | null>(null);

export const useAuthToast = () => {
  const context = useContext(AuthToastContext);
  if (!context) {
    throw new Error('useAuthToast must be used within AuthToastProvider');
  }
  return context;
};

// Toast component
interface AuthToastItemProps {
  toast: AuthToast;
  onRemove: (id: string) => void;
}

const AuthToastItem: React.FC<AuthToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      'flex items-start p-4 rounded-lg shadow-lg border backdrop-blur-sm';
    const typeStyles = {
      success: 'bg-success-50/90 border-success-200 text-success-800',
      error: 'bg-error-50/90 border-error-200 text-error-800',
      warning: 'bg-warning-50/90 border-yellow-200 text-warning-800',
      info: 'bg-primary-50/90 border-primary-200 text-primary-800',
    };
    return `${baseStyles} ${typeStyles[toast.type]}`;
  };

  const getIconColor = () => {
    const colors = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
    };
    return colors[toast.type];
  };

  const getIcon = () => {
    const iconClass = `w-5 h-5 ${getIconColor()}`;

    switch (toast.type) {
      case 'success':
        return (
          <svg className={iconClass} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClass} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClass} fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out mb-3
        ${
          isVisible && !isLeaving
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={getToastStyles()}>
        {/* Icon */}
        <div className='flex-shrink-0 mr-3 mt-0.5'>{getIcon()}</div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <h4 className='font-semibold text-sm mb-1'>{toast.title}</h4>
          <p className='text-sm opacity-90'>{toast.message}</p>

          {/* Action button */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`
                mt-2 text-sm font-medium underline hover:no-underline
                transition-colors duration-200
                ${getIconColor()}
              `}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className='flex-shrink-0 ml-3 p-1 hover:bg-black/5 rounded-full transition-colors duration-200'
        >
          <svg
            className='w-4 h-4 opacity-60'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast container
interface AuthToastContainerProps {
  toasts: AuthToast[];
  onRemove: (id: string) => void;
}

const AuthToastContainer: React.FC<AuthToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  const containerElement =
    document.getElementById('auth-toast-container') || document.body;

  return createPortal(
    <div className='fixed top-4 right-4 z-50 w-full max-w-sm pointer-events-none'>
      <div className='space-y-3 pointer-events-auto'>
        {toasts.map(toast => (
          <AuthToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </div>
    </div>,
    containerElement
  );
};

// Provider component
interface AuthToastProviderProps {
  children: React.ReactNode;
}

export const AuthToastProvider: React.FC<AuthToastProviderProps> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<AuthToast[]>([]);

  const addToast = useCallback((toastData: Omit<AuthToast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: AuthToast = {
      ...toastData,
      id,
      duration: toastData.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <AuthToastContext.Provider
      value={{ addToast, removeToast, clearAllToasts }}
    >
      {children}
      <AuthToastContainer toasts={toasts} onRemove={removeToast} />
    </AuthToastContext.Provider>
  );
};

// Helper hooks for common auth toasts
export const useAuthToastHelpers = () => {
  const { addToast } = useAuthToast();

  return {
    showLoginSuccess: () =>
      addToast({
        type: 'success',
        title: 'Đăng nhập thành công!',
        message: 'Chào mừng bạn quay trở lại.',
        duration: 3000,
      }),

    showRegistrationSuccess: () =>
      addToast({
        type: 'success',
        title: 'Đăng ký thành công!',
        message: 'Tài khoản của bạn đã được tạo.',
        duration: 4000,
      }),

    showEmailVerificationSent: (email: string) =>
      addToast({
        type: 'info',
        title: 'Email xác thực đã được gửi',
        message: `Vui lòng kiểm tra hộp thư ${email}`,
        duration: 6000,
        action: {
          label: 'Gửi lại',
          onClick: () => {
            // This would trigger resend logic
            console.log('Resending verification email...');
          },
        },
      }),

    showOtpSent: (phone: string) =>
      addToast({
        type: 'info',
        title: 'Mã OTP đã được gửi',
        message: `Mã xác thực đã được gửi đến ${phone}`,
        duration: 5000,
      }),

    showAuthError: (error: string) =>
      addToast({
        type: 'error',
        title: 'Lỗi xác thực',
        message: error,
        duration: 6000,
      }),

    showPasswordResetSent: (email: string) =>
      addToast({
        type: 'success',
        title: 'Email đặt lại mật khẩu đã được gửi',
        message: `Vui lòng kiểm tra hộp thư ${email}`,
        duration: 6000,
      }),

    showLogoutSuccess: () =>
      addToast({
        type: 'info',
        title: 'Đã đăng xuất',
        message: 'Bạn đã đăng xuất khỏi tài khoản.',
        duration: 3000,
      }),

    showAccountLocked: () =>
      addToast({
        type: 'warning',
        title: 'Tài khoản bị khóa',
        message:
          'Tài khoản của bạn đã bị khóa tạm thời do đăng nhập sai nhiều lần.',
        duration: 8000,
        action: {
          label: 'Liên hệ hỗ trợ',
          onClick: () => {
            // Navigate to support
            window.location.href = '/support';
          },
        },
      }),
  };
};
