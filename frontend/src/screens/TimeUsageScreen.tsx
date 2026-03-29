import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { SelectionCard } from '../components/SelectionCard';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function TimeUsageScreen() {
  const { updateData } = useOnboarding();
  const [timeUsage, setTimeUsage] = useState('');

  const options = [
    { value: 'Working', icon: 'briefcase' as const },
    { value: 'Studying', icon: 'school' as const },
    { value: 'Figuring It Out', icon: 'help-circle' as const },
  ];

  const handleContinue = () => {
    if (!timeUsage) return;
    updateData({ timeUsage });
    
    if (timeUsage === 'Working') {
      router.push('/work-details');
    } else if (timeUsage === 'Studying') {
      router.push('/study-details');
    } else {
      router.push('/education');
    }
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What taking up most of your time right now?</Text>
          <Text style={styles.subtitle}>Career, Education or something creative</Text>
          
          <View style={styles.options}>
            {options.map((option) => (
              <SelectionCard
                key={option.value}
                title={option.value}
                icon={option.icon}
                selected={timeUsage === option.value}
                onPress={() => setTimeUsage(option.value)}
              />
            ))}
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!timeUsage} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  options: { marginTop: SPACING.lg },
});