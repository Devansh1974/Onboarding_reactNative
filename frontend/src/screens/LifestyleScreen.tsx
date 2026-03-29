import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const questions = [
  { key: 'drink', question: 'Do You Drink?', options: ['Regularly', 'Occasionally', 'Never'] },
  { key: 'smoke', question: 'Do You Smoke?', options: ['Regularly', 'Occasionally', 'Never'] },
  { key: 'exercise', question: 'Do You Excercise?', options: ['Regularly', 'Occasionally', 'Never'] },
];

export default function LifestyleScreen() {
  const { updateData } = useOnboarding();
  const [answers, setAnswers] = useState<{[key: string]: string}>({});

  const setAnswer = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    updateData({ lifestyle: answers });
    router.push('/appreciate');
  };

  const allAnswered = questions.every(q => answers[q.key]);

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Let's talk lifestyle</Text>
          <Text style={styles.subtitle}>let's gets to know your lifestyle for living or wrong answer - just you</Text>
          
          {questions.map((q) => (
            <View key={q.key} style={styles.questionContainer}>
              <Text style={styles.question}>{q.question}</Text>
              <View style={styles.options}>
                {q.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.option,
                      answers[q.key] === option && styles.optionSelected,
                    ]}
                    onPress={() => setAnswer(q.key, option)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[q.key] === option && styles.optionTextSelected,
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!allAnswered} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  questionContainer: { marginTop: SPACING.lg },
  question: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: SPACING.sm },
  options: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { flex: 1, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, marginHorizontal: 2, alignItems: 'center' },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { ...TYPOGRAPHY.caption, color: COLORS.text },
  optionTextSelected: { color: COLORS.white },
});