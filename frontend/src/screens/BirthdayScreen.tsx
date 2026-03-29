import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { DatePicker } from '../components/DatePicker';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function BirthdayScreen() {
  const { updateData } = useOnboarding();
  const [birthday, setBirthday] = useState('');

  const handleContinue = () => {
    if (!birthday) return;
    updateData({ birthday });
    router.push('/height');
  };

  // Check if date is complete (format: YYYY-MM-DD)
  const isDateComplete = birthday.length >= 8 && birthday.includes('-');

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>🎂</Text>
          </View>
          <Text style={styles.title}>When's your birthday?</Text>
          <Text style={styles.subtitle}>It like acknowledging the day that mother nature gave you life</Text>
          
          <View style={styles.inputContainer}>
            <DatePicker value={birthday} onChange={setBirthday} />
          </View>
        </View>

        <CustomButton 
          title="Continue" 
          onPress={handleContinue} 
          disabled={!isDateComplete} 
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  icon: { width: 100, height: 100, backgroundColor: COLORS.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  iconText: { fontSize: 48 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  inputContainer: { marginTop: SPACING.lg },
});