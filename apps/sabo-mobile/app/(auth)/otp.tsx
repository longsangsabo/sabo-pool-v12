import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function OTPScreen() {
  const params = useLocalSearchParams();
  const { phoneNumber, type, fullName, email } = params as {
    phoneNumber: string;
    type: 'login' | 'register';
    fullName?: string;
    email?: string;
  };

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with shared-auth service
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (type === 'register') {
        // Complete registration process
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        // Complete login process
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setCanResend(false);
    setCountdown(60);

    try {
      // TODO: Integrate with shared-auth service
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'OTP has been resent to your phone');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to {phoneNumber}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Enter OTP Code</Text>
        <TextInput
          style={styles.input}
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="sms-otp"
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.countdownText}>
              Resend OTP in {countdown}s
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  countdownText: {
    color: '#6b7280',
    fontSize: 14,
  },
});
