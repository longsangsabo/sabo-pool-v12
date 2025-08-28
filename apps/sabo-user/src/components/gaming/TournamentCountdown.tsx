import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Clock, Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

interface TournamentCountdownProps {
  targetDate: Date | string;
  title?: string;
  description?: string;
  onComplete?: () => void;
  showMilliseconds?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'tournament' | 'match' | 'urgent';
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  total: number;
}

export const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  targetDate,
  title = 'Tournament Starts In',
  description,
  onComplete,
  showMilliseconds = false,
  size = 'md',
  variant = 'default',
  className
}) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    total: 0
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const total = target - now;

      if (total <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          total: 0
        });
        
        if (!isComplete) {
          setIsComplete(true);
          onComplete?.();
        }
        return;
      }

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);
      const milliseconds = total % 1000;

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
        total
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, showMilliseconds ? 100 : 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete, isComplete, showMilliseconds]);

  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-lg font-semibold',
      description: 'text-sm',
      timeNumber: 'text-2xl',
      timeLabel: 'text-xs'
    },
    md: {
      container: 'p-6',
      title: 'text-xl font-bold',
      description: 'text-base',
      timeNumber: 'text-3xl',
      timeLabel: 'text-sm'
    },
    lg: {
      container: 'p-8',
      title: 'text-2xl font-bold',
      description: 'text-lg',
      timeNumber: 'text-4xl',
      timeLabel: 'text-base'
    }
  };

  const variantClasses = {
    default: 'bg-white border-gray-200',
    tournament: 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200',
    match: 'bg-gradient-to-br from-green-50 to-blue-50 border-green-200',
    urgent: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
  };

  const getUrgencyColor = () => {
    if (timeRemaining.total <= 0) return 'text-gray-500';
    if (timeRemaining.days === 0 && timeRemaining.hours < 1) return 'text-red-600';
    if (timeRemaining.days === 0 && timeRemaining.hours < 6) return 'text-orange-600';
    if (timeRemaining.days === 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isComplete) {
    return (
      <div className={clsx(
        'border rounded-lg text-center',
        sizeClasses[size].container,
        'bg-green-50 border-green-200',
        className
      )}>
        <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
          <Play className="w-6 h-6" />
          <span className={sizeClasses[size].title}>Tournament Started!</span>
        </div>
        {description && (
          <p className={clsx(sizeClasses[size].description, 'text-green-700')}>
            {description}
          </p>
        )}
      </div>
    );
  }

  const timeUnits = [
    { value: timeRemaining.days, label: 'Days', show: timeRemaining.days > 0 },
    { value: timeRemaining.hours, label: 'Hours', show: timeRemaining.days > 0 || timeRemaining.hours > 0 },
    { value: timeRemaining.minutes, label: 'Minutes', show: true },
    { value: timeRemaining.seconds, label: 'Seconds', show: true }
  ];

  if (showMilliseconds && timeRemaining.days === 0 && timeRemaining.hours === 0) {
    timeUnits.push({
      value: Math.floor(timeRemaining.milliseconds / 100),
      label: 'Ms',
      show: timeRemaining.minutes < 5
    });
  }

  return (
    <div className={clsx(
      'border rounded-lg text-center',
      sizeClasses[size].container,
      variantClasses[variant],
      className
    )}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className={clsx(sizeClasses[size].title, 'text-gray-900')}>
            {title}
          </h3>
        </div>
        {description && (
          <p className={clsx(sizeClasses[size].description, 'text-gray-600')}>
            {description}
          </p>
        )}
      </div>

      {/* Countdown Display */}
      <div className="flex justify-center space-x-2 md:space-x-4">
        {timeUnits
          .filter(unit => unit.show)
          .map((unit, index) => (
            <div key={unit.label} className="text-center">
              <div className={clsx(
                'font-mono font-bold',
                sizeClasses[size].timeNumber,
                getUrgencyColor()
              )}>
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className={clsx(
                'font-medium text-gray-600',
                sizeClasses[size].timeLabel
              )}>
                {unit.label}
              </div>
            </div>
          ))
        }
      </div>

      {/* Urgency Indicator */}
      {timeRemaining.days === 0 && timeRemaining.hours < 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Starting Soon!</span>
        </div>
      )}
    </div>
  );
};

// Multiple countdown component for managing several tournaments
interface MultiCountdownProps {
  tournaments: Array<{
    id: string;
    name: string;
    startDate: Date | string;
    type?: string;
  }>;
  className?: string;
}

export const MultiTournamentCountdown: React.FC<MultiCountdownProps> = ({
  tournaments,
  className
}) => {
  const sortedTournaments = tournaments
    .filter(t => new Date(t.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3); // Show only next 3 tournaments

  if (sortedTournaments.length === 0) {
    return (
      <div className={clsx('text-center p-6 text-gray-500', className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>No upcoming tournaments</p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {sortedTournaments.map((tournament, index) => (
        <TournamentCountdown
          key={tournament.id}
          targetDate={tournament.startDate}
          title={tournament.name}
          description={tournament.type}
          size={index === 0 ? 'md' : 'sm'}
          variant={index === 0 ? 'tournament' : 'default'}
        />
      ))}
    </div>
  );
};
