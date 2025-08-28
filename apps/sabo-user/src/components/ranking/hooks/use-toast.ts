import { logger } from '@/services/loggerService';
import { toastService } from '@/services/toastService';

/**
 * Toast Hook
 * Custom hook for toast notifications
 */
import { toast } from 'sonner';

export const useToast = () => {
  return {
    toast: (message: string, options?: any) => {
      toast(message, options);
    },
    success: (message: string) => {
      toast.success(message);
    },
    error: (message: string) => {
      toast.error(message);
    },
    warning: (message: string) => {
      toast.warning(message);
    },
    info: (message: string) => {
      toast(message);
    }
  };
};
