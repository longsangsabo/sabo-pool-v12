import React from 'react';

interface AuthLoadingOverlayProps {
  message?: string;
  isFullScreen?: boolean;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({
  message = 'Đang xác thực...',
  isFullScreen = true,
}) => {
  const containerClasses = isFullScreen
    ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className='bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center space-y-4 max-w-sm mx-4'>
        {/* Spinner */}
        <div className='relative'>
          <div className='w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
          <div className='absolute inset-0 w-12 h-12 border-4 border-transparent border-t-yellow-400 rounded-full animate-spin animation-delay-150'></div>
        </div>

        {/* Message */}
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            {message}
          </h3>
          <p className='text-sm text-gray-600'>Vui lòng đợi trong giây lát</p>
        </div>

        {/* Progress dots */}
        <div className='flex space-x-1'>
          <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce'></div>
          <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200'></div>
          <div className='w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-400'></div>
        </div>
      </div>
    </div>
  );
};

// Compact version for inline loading
export const AuthLoadingInline: React.FC<{ message?: string }> = ({
  message = 'Đang tải...',
}) => (
  <div className='flex items-center justify-center space-x-3 p-4'>
    <div className='w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
    <span className='text-sm text-gray-600'>{message}</span>
  </div>
);

// Button loading state
export const AuthButtonLoading: React.FC<{ message?: string }> = ({
  message = 'Đang xử lý...',
}) => (
  <div className='flex items-center justify-center space-x-2'>
    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
    <span>{message}</span>
  </div>
);
