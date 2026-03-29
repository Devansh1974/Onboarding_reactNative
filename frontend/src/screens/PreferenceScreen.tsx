import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { SelectionCard } from '../components/SelectionCard';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function PreferenceScreen() {
  const { updateData } = useOnboarding();
  const [selectedPreference, setSelectedPreference] = useState<'male' | 'female' | ''>('');

  const handleContinue = () => {
    if (!selectedPreference) return;
    
    updateData({ preference: selectedPreference });
    router.push('/name');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Select your{' \n'}gender preference</Text>
          <Text style={styles.subtitle}>
            Who would you like to meet?
          </Text>

          <View style={styles.cardsContainer}>
            <SelectionCard
              title="Male"
              icon="man"
              selected={selectedPreference === 'male'}
              onPress={() => setSelectedPreference('male')}
            />
            <SelectionCard
              title="Female"
              icon="woman"
              selected={selectedPreference === 'female'}
              onPress={() => setSelectedPreference('female')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedPreference}
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
  cardsContainer: {
    marginTop: SPACING.lg,
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
});
