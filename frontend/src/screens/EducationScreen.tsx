import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const educationLevels = [
  { label: 'High School', value: 'High School' },
  { label: 'Undergraduate', value: 'Undergraduate' },
  { label: 'Doctorate', value: 'Doctorate' },
  { label: 'Postgraduate', value: 'Postgraduate' },
];

export default function EducationScreen() {
  const { updateData } = useOnboarding();
  const [education, setEducation] = useState('');

  const handleContinue = () => {
    if (!education) return;
    updateData({ education });
    router.push('/religion');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>And your education?</Text>
          <Text style={styles.subtitle}>what's the highest degree or field you studied in?</Text>
          
          <View style={styles.options}>
            {educationLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.option,
                  education === level.value && styles.optionSelected,
                ]}
                onPress={() => setEducation(level.value)}
              >
                <Text style={[
                  styles.optionText,
                  education === level.value && styles.optionTextSelected,
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!education} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  options: { marginTop: SPACING.lg, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  option: { width: '48%', height: 100, borderRadius: BORDER_RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  optionTextSelected: { color: COLORS.white },
});