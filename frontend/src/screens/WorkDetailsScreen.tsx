import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function WorkDetailsScreen() {
  const { updateData } = useOnboarding();
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const handleContinue = () => {
    updateData({ workDetails: { company, position, jobTitle } });
    router.push('/education');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Where do you work?</Text>
          <Text style={styles.subtitle}>Tell us about your job! Where are you working and in what position?</Text>
          
          <View style={styles.form}>
            <InputField
              label="🏢 Where Do You Work?"
              placeholder="Company Name"
              value={company}
              onChangeText={setCompany}
            />
            <View style={{ height: SPACING.md }} />
            <InputField
              label="💼 Your Position"
              placeholder="Your Position"
              value={position}
              onChangeText={setPosition}
            />
            <View style={{ height: SPACING.md }} />
            <InputField
              placeholder="Your Job Title"
              value={jobTitle}
              onChangeText={setJobTitle}
            />
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!company} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  form: { marginTop: SPACING.lg },
});