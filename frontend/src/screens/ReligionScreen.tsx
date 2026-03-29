import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { Dropdown } from '../components/Dropdown';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const religions = [
  "What's It", 'Hinduism', 'Christianity', 'Islam', 'Sikhism', 
  'Jainism', 'Not Believe', 'Buddhism', 'Other'
];

export default function ReligionScreen() {
  const { updateData } = useOnboarding();
  const [religion, setReligion] = useState('');

  const handleContinue = () => {
    updateData({ religionImportance: religion });
    router.push('/food-habits');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Does religion play a role in your life?</Text>
          <Text style={styles.subtitle}>You can totally skip if you'd like</Text>
          
          <View style={styles.dropdown}>
            <Dropdown 
              placeholder="What's It" 
              value={religion} 
              options={religions} 
              onChange={setReligion} 
            />
          </View>
        </View>

        <View>
          <CustomButton title="Skip" onPress={() => handleContinue()} variant="outline" />
          <View style={{ height: SPACING.sm }} />
          <CustomButton title="Continue" onPress={handleContinue} disabled={!religion} />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  dropdown: { marginTop: SPACING.lg },
});