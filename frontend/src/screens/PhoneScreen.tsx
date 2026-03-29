import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function PhoneScreen() {
  const { data, updateData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber);
  const [callingCode, setCallingCode] = useState('+91');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    updateData({
      phoneNumber,
      countryCode: callingCode,
    });

    router.push('/otp');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Enter your{' \n'}phone number</Text>
          <Text style={styles.subtitle}>
            We'll send you a verification code
          </Text>

          <View style={styles.inputContainer}>
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
                  <Text style={styles.countryCodeText}>{callingCode}</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!phoneNumber}
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
  inputContainer: {
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
});
