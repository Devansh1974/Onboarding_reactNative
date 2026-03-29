import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import { useOnboarding } from '../context/OnboardingContext';
import { api } from '../utils/api';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function WelcomePhoneScreen() {
  const { data, updateData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    try {
      setLoading(true);
      const result = await api.sendOTP(phoneNumber, '+91');
      
      if (result.success) {
        updateData({ phoneNumber, countryCode: '+91' });
        router.push('/otp');
      } else {
        setError('Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.white} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>👫</Text>
            </View>
          </View>

          <Text style={styles.title}>Ready to stop{' \n'}swiping and start{' \n'}dating with intent?</Text>
          <Text style={styles.subtitle}>Join WingMann and find meaningful connections</Text>

          <View style={styles.phoneInputContainer}>
            <InputField
              placeholder="Phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setError('');
              }}
              error={error}
              leftIcon={
                <TouchableOpacity style={styles.countryCodeButton}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton 
            title="Sign Up" 
            onPress={handleSignUp} 
            disabled={!phoneNumber}
            loading={loading}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or connect with</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="Continue with Google"
            onPress={() => {}}
            variant="secondary"
          />

          <Text style={styles.terms}>
            By continuing, you agree to our{' \n'}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  illustrationContainer: {
    marginBottom: SPACING.xl,
  },
  illustration: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    fontSize: 60,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  phoneInputContainer: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  countryCodeButton: {
    paddingRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  countryCodeText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  terms: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});