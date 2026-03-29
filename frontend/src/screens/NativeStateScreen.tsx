import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { Dropdown } from '../components/Dropdown';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

const states = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana',
  'Maharashtra', 'Gujarat', 'Delhi', 'Punjab', 'Haryana',
];

export default function NativeStateScreen() {
  const { updateData } = useOnboarding();
  const [nativeState, setNativeState] = useState('');

  const handleContinue = () => {
    if (!nativeState) return;
    updateData({ nativeState });
    router.push('/story');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What state do you call home?</Text>
          <Text style={styles.subtitle}>It's good to know where's someone story began</Text>
          
          <View style={styles.dropdownContainer}>
            <Dropdown 
              placeholder="Select State" 
              value={nativeState} 
              options={states} 
              onChange={setNativeState} 
            />
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!nativeState} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  dropdownContainer: { marginTop: SPACING.lg },
});