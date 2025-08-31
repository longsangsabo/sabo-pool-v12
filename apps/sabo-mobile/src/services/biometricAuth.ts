/**
 * Biometric authentication service
 * Provides fingerprint and face ID authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export class BiometricAuthService {
  private static BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
  private static BIOMETRIC_SETUP_KEY = 'biometric_auth_setup';

  // Check if biometric authentication is available
  static async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      return compatible && enrolled;
    } catch (error) {
      console.warn('[BiometricAuth] Error checking availability:', error);
      return false;
    }
  }

  // Get available biometric types
  static async getAvailableBiometrics(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return types.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'face_id';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'iris';
          default:
            return 'unknown';
        }
      });
    } catch (error) {
      console.warn('[BiometricAuth] Error getting biometric types:', error);
      return [];
    }
  }

  // Check if biometric auth is enabled for the app
  static async isEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      return false;
    }
  }

  // Enable biometric authentication
  static async enable(): Promise<BiometricAuthResult> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Test biometric authentication
      const result = await this.authenticate('Enable biometric authentication for quick access');
      
      if (result.success) {
        await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
        await AsyncStorage.setItem(this.BIOMETRIC_SETUP_KEY, new Date().toISOString());
        
        return {
          success: true,
          biometricType: (await this.getAvailableBiometrics())[0]
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable biometric authentication'
      };
    }
  }

  // Disable biometric authentication
  static async disable(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
      await AsyncStorage.removeItem(this.BIOMETRIC_SETUP_KEY);
    } catch (error) {
      console.warn('[BiometricAuth] Error disabling biometric auth:', error);
    }
  }

  // Authenticate with biometrics
  static async authenticate(reason: string = 'Authenticate to access your account'): Promise<BiometricAuthResult> {
    try {
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use password instead',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
          biometricType: (await this.getAvailableBiometrics())[0]
        };
      } else {
        let errorMessage = 'Authentication failed';
        
        // Handle different error types based on the result object
        if ('error' in result && result.error) {
          const errorString = String(result.error);
          switch (errorString) {
            case 'user_cancel':
              errorMessage = 'Authentication was cancelled';
              break;
            case 'user_fallback':
              errorMessage = 'User chose fallback authentication';
              break;
            case 'biometric_unavailable':
              errorMessage = 'Biometric authentication is unavailable';
              break;
            case 'authentication_failed':
              errorMessage = 'Authentication failed. Please try again.';
              break;
            default:
              errorMessage = 'Authentication failed';
          }
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication error occurred'
      };
    }
  }

  // Prompt user to set up biometric authentication
  static async promptSetup(): Promise<void> {
    const available = await this.isAvailable();
    const enabled = await this.isEnabled();
    
    if (available && !enabled) {
      Alert.alert(
        'Enable Biometric Authentication',
        'Would you like to enable fingerprint or face ID for quick and secure access to your account?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
          },
          {
            text: 'Enable',
            onPress: async () => {
              const result = await this.enable();
              if (result.success) {
                Alert.alert(
                  'Success',
                  `Biometric authentication has been enabled using ${result.biometricType}.`
                );
              } else {
                Alert.alert('Error', result.error || 'Failed to enable biometric authentication');
              }
            },
          },
        ]
      );
    }
  }

  // Quick authentication for sensitive actions
  static async authenticateForAction(action: string): Promise<boolean> {
    const enabled = await this.isEnabled();
    
    if (!enabled) {
      return true; // Skip if not enabled
    }

    const result = await this.authenticate(`Authenticate to ${action}`);
    return result.success;
  }

  // Get biometric setup information
  static async getSetupInfo() {
    try {
      const enabled = await this.isEnabled();
      const setupDate = await AsyncStorage.getItem(this.BIOMETRIC_SETUP_KEY);
      const available = await this.isAvailable();
      const biometricTypes = await this.getAvailableBiometrics();
      
      return {
        enabled,
        available,
        setupDate: setupDate ? new Date(setupDate) : null,
        biometricTypes,
      };
    } catch (error) {
      console.warn('[BiometricAuth] Error getting setup info:', error);
      return {
        enabled: false,
        available: false,
        setupDate: null,
        biometricTypes: [],
      };
    }
  }
}

// React hook for biometric authentication
export const useBiometricAuth = () => {
  const authenticate = async (reason?: string) => {
    return BiometricAuthService.authenticate(reason);
  };

  const enable = async () => {
    return BiometricAuthService.enable();
  };

  const disable = async () => {
    return BiometricAuthService.disable();
  };

  const isEnabled = async () => {
    return BiometricAuthService.isEnabled();
  };

  const isAvailable = async () => {
    return BiometricAuthService.isAvailable();
  };

  const authenticateForAction = async (action: string) => {
    return BiometricAuthService.authenticateForAction(action);
  };

  return {
    authenticate,
    enable,
    disable,
    isEnabled,
    isAvailable,
    authenticateForAction,
    promptSetup: BiometricAuthService.promptSetup,
    getSetupInfo: BiometricAuthService.getSetupInfo,
  };
};
