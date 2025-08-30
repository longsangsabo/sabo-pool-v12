import React from 'react';

interface AuthProgressProps {
  step: number;
  totalSteps: number;
  currentStep: string;
  className?: string;
}

export const AuthProgress: React.FC<AuthProgressProps> = ({
  step,
  totalSteps,
  currentStep,
  className = '',
}) => {
  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className={`w-full max-w-md mx-auto mb-6 ${className}`}>
      {/* Step indicator */}
      <div className='flex items-center justify-between mb-2'>
        <span className='text-body-small-neutral font-medium'>
          Bước {step}/{totalSteps}
        </span>
        <span className='text-body-small font-semibold text-indigo-600'>
          {currentStep}
        </span>
      </div>

      {/* Progress bar */}
      <div className='w-full bg-neutral-200 rounded-full h-2 overflow-hidden'>
        <div
          className='bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out'
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step labels */}
      <div className='flex justify-between mt-2 text-caption-neutral'>
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={`
              ${index + 1 <= step ? 'text-indigo-600 font-medium' : 'text-gray-400'}
              transition-colors duration-300
            `}
          >
            {index + 1}
          </span>
        ))}
      </div>
    </div>
  );
};

// Stepper with labels
interface AuthStepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const AuthStepper: React.FC<AuthStepperProps> = ({
  steps,
  currentStep,
  className = '',
}) => {
  return (
    <div className={`w-full max-w-2xl mx-auto mb-8 ${className}`}>
      <div className='flex items-center justify-between'>
        {steps.map((stepLabel, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className='flex flex-col items-center flex-1'>
              {/* Step circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-body-small font-semibold transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-success-500 text-white'
                      : isActive
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                        : 'bg-neutral-200 text-neutral-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>

              {/* Step label */}
              <span
                className={`
                  mt-2 text-caption text-center font-medium transition-colors duration-300
                  ${isActive ? 'text-indigo-600' : isCompleted ? 'text-success-600' : 'text-neutral-500'}
                `}
              >
                {stepLabel}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute h-0.5 w-full mt-4 transition-colors duration-300
                    ${isCompleted ? 'bg-success-500' : 'bg-neutral-200'}
                  `}
                  style={{
                    left: '50%',
                    transform: 'translateX(50%)',
                    zIndex: -1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Circular progress for single-step processes
interface AuthCircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export const AuthCircularProgress: React.FC<AuthCircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  className = '',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          className='text-gray-200'
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className='text-indigo-600 transition-all duration-500 ease-out'
          strokeLinecap='round'
        />
      </svg>
      {/* Content inside circle */}
      {children && (
        <div className='absolute inset-0 flex items-center justify-center'>
          {children}
        </div>
      )}
    </div>
  );
};

// Usage examples for different auth flows
export const EmailVerificationProgress: React.FC = () => (
  <AuthStepper
    steps={['Nhập thông tin', 'Xác thực email', 'Hoàn tất']}
    currentStep={2}
  />
);

export const PhoneVerificationProgress: React.FC = () => (
  <AuthStepper
    steps={['Nhập số điện thoại', 'Nhập mã OTP', 'Hoàn tất']}
    currentStep={2}
  />
);

export const OAuthProgress: React.FC = () => (
  <AuthProgress step={2} totalSteps={3} currentStep='Xử lý đăng nhập' />
);
