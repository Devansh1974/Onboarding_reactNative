import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { OtpInput } from '../components/OtpInput';
import { useOnboarding } from '../context/OnboardingContext';
import { api } from '../utils/api';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function OtpScreen() {
  const { data, updateData } = useOnboarding();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    // SKIP OTP VERIFICATION - Accept any 6-digit code
    setLoading(true);
    
    setTimeout(() => {
      updateData({ otp, otpVerified: true });
      router.push('/gender');
      setLoading(false);
    }, 500);
  };

  const handleResend = async () => {
    try {
      await api.sendOTP(data.phoneNumber, data.countryCode);
      console.log('OTP resent to:', data.phoneNumber);
    } catch (err) {
      console.error('Failed to resend OTP');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Please enter the code sent to{'\n'}
            {data.countryCode} {data.phoneNumber}
          </Text>

          <View style={styles.otpContainer}>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError('');
              }}
              onComplete={(value) => {
                console.log('OTP Complete:', value);
              }}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity onPress={handleResend} style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Verify"
            onPress={handleVerify}
            disabled={otp.length !== 6}
            loading={loading}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    marginVertical: SPACING.xl,
  },
  error: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  resendContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resendText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
});
