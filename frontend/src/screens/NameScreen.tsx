import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function NameScreen() {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!name || name.trim().length < 2) {
      setError('Please enter your name');
      return;
    }

    updateData({ name: name.trim() });
    router.push('/intro1');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Cool, what's{' \n'}your name?</Text>
          <Text style={styles.subtitle}>
            Let us know what to call you
          </Text>

          <View style={styles.inputContainer}>
            <InputField
              placeholder="Enter your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError('');
              }}
              error={error}
              autoFocus
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!name}
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
  footer: {
    paddingBottom: SPACING.lg,
  },
});
