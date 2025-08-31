import { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error: Error | null;
 errorInfo: ErrorInfo | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
  super(props);
  this.state = {
   hasError: false,
   error: null,
   errorInfo: null,
  };
 }

 static getDerivedStateFromError(error: Error): State {
  return {
   hasError: true,
   error,
   errorInfo: null,
  };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('Auth Error Boundary caught an error:', error, errorInfo);

  this.setState({
   error,
   errorInfo,
  });

  // Log to monitoring service
  this.logAuthError(error, errorInfo);

  // Call optional error handler
  this.props.onError?.(error, errorInfo);

  // Show toast notification
  toast.error('Có lỗi xảy ra trong hệ thống xác thực');
 }

 private logAuthError = (error: Error, errorInfo: ErrorInfo) => {
  // Log to external monitoring service (e.g., Sentry, LogRocket)
  try {
   // Example for Sentry
   if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
     tags: {
      component: 'AuthErrorBoundary',
      auth_error: true,
     },
     extra: {
      errorInfo,
      user_agent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
     },
    });
   }

   // Local storage for debugging
   const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
     name: error.name,
     message: error.message,
     stack: error.stack,
    },
    errorInfo,
    userAgent: navigator.userAgent,
    url: window.location.href,
   };

   const existingLogs = JSON.parse(
    localStorage.getItem('auth_error_logs') || '[]'
   );
   existingLogs.push(errorLog);

   // Keep only last 10 errors
   const limitedLogs = existingLogs.slice(-10);
   localStorage.setItem('auth_error_logs', JSON.stringify(limitedLogs));
  } catch (loggingError) {
   console.error('Failed to log auth error:', loggingError);
  }
 };

 private handleRetry = () => {
  this.setState({
   hasError: false,
   error: null,
   errorInfo: null,
  });
 };

 private handleReload = () => {
  window.location.reload();
 };

 private handleGoHome = () => {
  window.location.href = '/';
 };

 render() {
  if (this.state.hasError) {
   // Custom fallback UI
   if (this.props.fallback) {
    return this.props.fallback;
   }

   // Default error UI
   return (
    <AuthErrorFallback
     error={this.state.error}
     errorInfo={this.state.errorInfo}
     onRetry={this.handleRetry}
     onReload={this.handleReload}
     onGoHome={this.handleGoHome}
    />
   );
  }

  return this.props.children;
 }
}

// Default error fallback component
interface AuthErrorFallbackProps {
 error: Error | null;
 errorInfo: ErrorInfo | null;
 onRetry: () => void;
 onReload: () => void;
 onGoHome: () => void;
}

const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({
 error,
 errorInfo,
 onRetry,
 onReload,
 onGoHome,
}) => {
 const isDevelopment = process.env.NODE_ENV === 'development';

 return (
  <div className='min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8'>
   <div className='max-w-md w-full space-y-8'>
    <div className='text-center'>
     <div className='mx-auto h-12 w-12 text-error-600'>
      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
       <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
       />
      </svg>
     </div>
     <h2 className='mt-6 text-3xl font-extrabold text-neutral-900'>
      Lỗi Hệ Thống Xác Thực
     </h2>
     <p className='mt-2 text-body-small-neutral'>
      Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.
     </p>
    </div>

    {/* Error details for development */}
    {isDevelopment && error && (
     <div className='mt-4 p-4 bg-error-50 border border-error-200 rounded-md'>
      <h3 className='text-body-small-medium text-error-800 mb-2'>
       Chi tiết lỗi (Development):
      </h3>
      <p className='text-caption text-error-700 font-mono break-words'>
       {error.message}
      </p>
      {error.stack && (
       <details className='mt-2'>
        <summary className='text-caption text-error-600 cursor-pointer'>
         Stack trace
        </summary>
        <pre className='text-caption text-error-600 mt-1 whitespace-pre-wrap'>
         {error.stack}
        </pre>
       </details>
      )}
     </div>
    )}

    {/* Action buttons */}
    <div className='mt-8 space-y-3'>
     <button
      onClick={onRetry}
      className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-body-small-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
     >
      Thử lại
     </button>

     <button
      onClick={onReload}
      className='w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-body-small-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
     >
      Tải lại trang
     </button>

     <button
      onClick={onGoHome}
      className='w-full flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm text-body-small-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
     >
      Về trang chủ
     </button>
    </div>

    {/* Support info */}
    <div className='mt-6 text-center text-caption-neutral'>
     <p>Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ support.</p>
     <p className='mt-1'>Error ID: {new Date().getTime().toString(36)}</p>
    </div>
   </div>
  </div>
 );
};
