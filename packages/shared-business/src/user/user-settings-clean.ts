// =====================================================
// 👤 USER SETTINGS BUSINESS LOGIC
// =====================================================

/**
 * Centralized user settings business logic extracted from:
 * - UserSettingsModal.tsx
 * - ProfileSettings.tsx
 * - UserProfile components
 * - Settings management hooks
 * 
 * Provides unified settings management for:
 * - User preferences
 * - Theme customization
 * - Notification settings
 * - Privacy controls
 * - Display options
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ===== SETTINGS TYPES =====

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'vi' | 'en';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type Currency = 'VND' | 'USD';

export interface UserSettings {
  user_id: string;
  theme: Theme;
  language: Language;
  date_format: DateFormat;
  time_format: TimeFormat;
  currency: Currency;
  sound_enabled: boolean;
  animations_enabled: boolean;
  auto_save: boolean;
  show_tooltips: boolean;
  compact_mode: boolean;
  high_contrast: boolean;
  created_at: string;
  updated_at?: string;
}

export interface NotificationSettings {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  challenge_notifications: boolean;
  tournament_notifications: boolean;
  club_notifications: boolean;
  marketing_emails: boolean;
  system_alerts: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  notification_frequency: 'instant' | 'hourly' | 'daily';
  created_at: string;
  updated_at?: string;
}

export interface PrivacySettings {
  show_phone: boolean;
  show_stats: boolean;
  show_online_status: boolean;
  allow_direct_messages: boolean;
  profile_visible: boolean;
  stats_visible: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  email_notifications: boolean;
  login_alerts: boolean;
  session_timeout: number;
  password_expiry: number;
  device_management: boolean;
}

// ===== USER SETTINGS SERVICE =====

export class UserSettingsManager {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Get complete user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return defaults
          return this.getDefaultSettings(userId);
        }
        console.error('❌ Error fetching user settings:', error);
        return null;
      }

      return data as UserSettings;
    } catch (error) {
      console.error('❌ Exception fetching user settings:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception updating user settings:', error);
      return false;
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(userId: string): Promise<NotificationSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return this.getDefaultNotificationSettings(userId);
        }
        console.error('❌ Error fetching notification settings:', error);
        return null;
      }

      return data as NotificationSettings;
    } catch (error) {
      console.error('❌ Exception fetching notification settings:', error);
      return null;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    settings: Partial<Omit<NotificationSettings, 'user_id' | 'created_at'>>
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating notification settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception updating notification settings:', error);
      return false;
    }
  }

  /**
   * Update theme setting
   */
  async updateTheme(userId: string, theme: Theme): Promise<boolean> {
    return this.updateUserSettings(userId, { theme });
  }

  /**
   * Update language setting
   */
  async updateLanguage(userId: string, language: Language): Promise<boolean> {
    return this.updateUserSettings(userId, { language });
  }

  /**
   * Update currency setting
   */
  async updateCurrency(userId: string, currency: Currency): Promise<boolean> {
    return this.updateUserSettings(userId, { currency });
  }

  /**
   * Toggle notification type
   */
  async toggleNotification(
    userId: string,
    type: keyof Pick<NotificationSettings, 
      'email_notifications' | 'push_notifications' | 'in_app_notifications' |
      'challenge_notifications' | 'tournament_notifications' | 'club_notifications'
    >,
    enabled: boolean
  ): Promise<boolean> {
    return this.updateNotificationSettings(userId, { [type]: enabled });
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId: string): Promise<boolean> {
    try {
      // Delete existing settings
      await this.supabase.from('user_settings').delete().eq('user_id', userId);
      await this.supabase.from('notification_settings').delete().eq('user_id', userId);

      // Create default settings
      const defaultSettings = this.getDefaultSettings(userId);
      const defaultNotifications = this.getDefaultNotificationSettings(userId);

      const settingsResult = await this.updateUserSettings(userId, defaultSettings);
      const notificationsResult = await this.updateNotificationSettings(userId, defaultNotifications);

      return settingsResult && notificationsResult;
    } catch (error) {
      console.error('❌ Exception resetting settings:', error);
      return false;
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Get default user settings
   */
  private getDefaultSettings(userId: string): UserSettings {
    return {
      user_id: userId,
      theme: 'auto',
      language: 'vi',
      date_format: 'DD/MM/YYYY',
      time_format: '24h',
      currency: 'VND',
      sound_enabled: true,
      animations_enabled: true,
      auto_save: true,
      show_tooltips: true,
      compact_mode: false,
      high_contrast: false,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Get default notification settings
   */
  private getDefaultNotificationSettings(userId: string): NotificationSettings {
    return {
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      in_app_notifications: true,
      challenge_notifications: true,
      tournament_notifications: true,
      club_notifications: true,
      marketing_emails: false,
      system_alerts: true,
      quiet_hours_enabled: false,
      notification_frequency: 'instant',
      created_at: new Date().toISOString()
    };
  }
}

// ===== THEME MANAGEMENT =====

export interface ThemeConfig {
  mode: Theme;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export class ThemeManager {
  /**
   * Apply theme to document
   */
  static applyTheme(theme: ThemeConfig): void {
    // This would be implemented on the client side
    console.log('Applying theme:', theme.mode);
  }

  /**
   * Get system theme preference
   */
  static getSystemTheme(): 'light' | 'dark' {
    // This would be implemented on the client side
    return 'light';
  }

  /**
   * Get theme configuration
   */
  static getThemeConfig(mode: Theme): ThemeConfig {
    const baseTheme = {
      mode,
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    };

    if (mode === 'dark') {
      return {
        ...baseTheme,
        colors: {
          primary: '#3B82F6',
          secondary: '#6B7280',
          accent: '#F59E0B',
          background: '#111827',
          surface: '#1F2937',
          text: '#F9FAFB',
          textSecondary: '#D1D5DB',
          border: '#374151',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        }
      };
    }

    return {
      ...baseTheme,
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#F59E0B',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: '#111827',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6'
      }
    };
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format date according to user preference
 */
export function formatDate(date: Date, format: DateFormat): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Format time according to user preference
 */
export function formatTime(date: Date, format: TimeFormat): string {
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format currency according to user preference
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === 'VND' ? 'vi-VN' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'VND' ? 0 : 2,
    maximumFractionDigits: currency === 'VND' ? 0 : 2
  }).format(amount);
}

/**
 * Get localized text
 */
export function getLocalizedText(key: string, language: Language): string {
  // This would integrate with i18n library
  return key;
}

/**
 * Validate settings data
 */
export function validateUserSettings(settings: Partial<UserSettings>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (settings.theme && !['light', 'dark', 'auto'].includes(settings.theme)) {
    errors.push('Invalid theme value');
  }

  if (settings.language && !['vi', 'en'].includes(settings.language)) {
    errors.push('Invalid language value');
  }

  if (settings.currency && !['VND', 'USD'].includes(settings.currency)) {
    errors.push('Invalid currency value');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create factory function for UserSettingsManager
 */
export function createUserSettingsManager(supabase: SupabaseClient): UserSettingsManager {
  return new UserSettingsManager(supabase);
}

export default UserSettingsManager;
