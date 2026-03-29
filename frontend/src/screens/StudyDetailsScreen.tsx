import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { InputField } from '../components/InputField';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function StudyDetailsScreen() {
  const { updateData } = useOnboarding();
  const [school, setSchool] = useState('');
  const [course, setCourse] = useState('');
  const [degree, setDegree] = useState('');

  const handleContinue = () => {
    updateData({ studyDetails: { school, course, degree } });
    router.push('/education');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What do you study?</Text>
          <Text style={styles.subtitle}>Tell us about your studies! Where are you studying and in which course or degree?</Text>
          
          <View style={styles.form}>
            <InputField
              label="🏫 Where Do You Study?"
              placeholder="School/University Name"
              value={school}
              onChangeText={setSchool}
            />
            <View style={{ height: SPACING.md }} />
            <InputField
              label="📚 Your Course"
              placeholder="Your Course"
              value={course}
              onChangeText={setCourse}
            />
            <View style={{ height: SPACING.md }} />
            <InputField
              placeholder="Course Or Degree"
              value={degree}
              onChangeText={setDegree}
            />
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!school} />
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