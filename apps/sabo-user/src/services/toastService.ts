import { logger } from '@/services/loggerService';
import { toastService } from '@/services/toastService';

/**
 * Toast Notification Service
 * Professional user feedback system
 */
import { toast } from 'sonner';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  icon?: React.ReactNode;
}

class ToastService {
  success(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  error(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.error(message, {
      duration: options?.duration || 6000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  warning(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.warning(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  info(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false,
      action: options?.action,
      icon: options?.icon
    });
  }

  loading(message: string, options?: Omit<ToastOptions, 'type'>) {
    return toast.loading(message, {
      duration: options?.duration || Infinity,
      position: options?.position || 'top-right',
      dismissible: options?.dismissible !== false
    });
  }

  // Tournament-specific toasts
  tournamentCreated(name: string) {
    this.success(`🏆 Tournament "${name}" created successfully!`, {
      action: {
        label: 'View',
        onClick: () => window.location.href = '/tournaments'
      }
    });
  }

  matchResult(winner: string, score: string) {
    this.success(`🎯 Match completed! ${winner} wins ${score}`, {
      duration: 6000
    });
  }

  challengeReceived(challenger: string) {
    this.info(`⚔️ Challenge received from ${challenger}`, {
      action: {
        label: 'View',
        onClick: () => window.location.href = '/challenges'
      },
      duration: 8000
    });
  }

  rankingUpdate(newRank: number, change: number) {
    const emoji = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    const message = change > 0 
      ? `${emoji} Rank increased to #${newRank} (+${change})`
      : change < 0 
      ? `${emoji} Rank changed to #${newRank} (${change})`
      : `${emoji} Rank maintained at #${newRank}`;
    
    this.info(message, { duration: 6000 });
  }

  // Batch operations
  promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error
    });
  }

  // Dismiss specific toast
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  dismissAll() {
    toast.dismiss();
  }
}

export const toastService = new ToastService();
