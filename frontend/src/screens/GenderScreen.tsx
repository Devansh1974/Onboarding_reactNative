import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { SelectionCard } from '../components/SelectionCard';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function GenderScreen() {
  const { updateData } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | ''>('');

  const handleContinue = () => {
    if (!selectedGender) return;
    
    updateData({ gender: selectedGender });
    router.push('/name');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <OnboardingLayout onBack={handleBack}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Let's start by{' \n'}choosing your gender!</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>

          <View style={styles.cardsContainer}>
            <SelectionCard
              title="Male"
              icon="man"
              selected={selectedGender === 'male'}
              onPress={() => setSelectedGender('male')}
            />
            <SelectionCard
              title="Female"
              icon="woman"
              selected={selectedGender === 'female'}
              onPress={() => setSelectedGender('female')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedGender}
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
