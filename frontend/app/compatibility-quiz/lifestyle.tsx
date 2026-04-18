import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../../src/components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Answers {
  q1?: string;
  q2?: string;
  q3?: number; // 1-5 scale
  q4?: number; // 1-5 scale
  q5?: string;
}

export default function LifestyleQuiz() {
  const { data } = useOnboarding();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);

  // Submit Final Answers
  const handleSubmit = async () => {
    if (!answers.q5) return;
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          data: {
            compatibilityQuiz: {
              lifestyleAndValues: answers
            }
          }
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.replace('/compatibility-quiz/emotional' as any);
      } else {
        Alert.alert('Error', result.message || 'Something went wrong');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save quiz responses');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  // Generic Button to go to next step
  const renderNextArrow = (disabled = false) => (
    <View style={styles.arrowContainer}>
      <TouchableOpacity 
        style={[styles.roundArrowBtn, disabled && { opacity: 0.5 }]} 
        onPress={nextStep}
        disabled={disabled || loading}
      >
        <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  // Renders the options for Question 1 & 2 (2x2 Grid)
  const renderGridOptions = (options: {id: string, text: string, icon: keyof typeof Ionicons.glyphMap}[], currentVal: string | undefined, field: keyof Answers) => (
    <View style={styles.gridContainer}>
      {options.map((opt) => {
        const isSelected = currentVal === opt.id;
        return (
          <TouchableOpacity 
            key={opt.id} 
            style={[styles.gridCard, isSelected && styles.gridCardSelected]}
            onPress={() => setAnswers(prev => ({...prev, [field]: opt.id}))}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.gridCardText}>{opt.text}</Text>
            </View>
            <View style={[styles.gridIconWrap, isSelected && { backgroundColor: COLORS.primary }]}>
              <Ionicons name={opt.icon} size={38} color={isSelected ? COLORS.white : COLORS.primary} />
            </View>
            {isSelected && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Renders the options for Question 3 & 4 (Scale 1 to 5 emoji list)
  const renderScaleOptions = (currentVal: number | undefined, field: keyof Answers) => {
    const scales = [
      { id: 5, text: 'Strongly agree', icon: 'happy' },
      { id: 4, text: 'Somewhat agree', icon: 'happy-outline' },
      { id: 3, text: 'Neutral', icon: 'remove-circle-outline' },
      { id: 2, text: 'Okay-okay', icon: 'sad-outline' },
      { id: 1, text: 'Strongly disagree', icon: 'sad' },
    ] as const;

    return (
      <View style={styles.scaleContainer}>
        {scales.map((s) => {
          const isSelected = currentVal === s.id;
          return (
            <TouchableOpacity 
              key={s.id} 
              style={styles.scaleRow}
              onPress={() => setAnswers(prev => ({...prev, [field]: s.id}))}
            >
              <Ionicons 
                name={s.icon} 
                size={34} 
                color={isSelected ? COLORS.primary : COLORS.gray} 
              />
              <Text style={[styles.scaleText, isSelected && styles.scaleTextSelected]}>{s.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lifestyle and Value</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <View style={styles.pillWrap}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>QUESTION {step} OF 5</Text>
            </View>
          </View>

          {/* QUESTION 1 */}
          {step === 1 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>How do you usually like to spend your weekends?</Text>
              {renderGridOptions([
                { id: 'home', text: 'Relaxing at home', icon: 'cafe' },
                { id: 'explore', text: 'Going out, exploring places.', icon: 'map' },
                { id: 'productive', text: 'Doing something productive.', icon: 'laptop' },
                { id: 'mood', text: 'Mixing it up depends on mood.', icon: 'color-palette' },
              ], answers.q1, 'q1')}
              {renderNextArrow(!answers.q1)}
            </View>
          )}

          {/* QUESTION 2 */}
          {step === 2 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>When it comes to managing money as a couple, I prefer:</Text>
              {renderGridOptions([
                { id: 'together', text: 'Putting it all together.', icon: 'wallet' },
                { id: 'open', text: 'Keeping our own accounts but being open about stuff.', icon: 'pie-chart' },
                { id: 'split', text: 'Splitting things in a way that feels fair for both.', icon: 'git-compare' },
                { id: 'separate', text: 'Keeping finances totally separate.', icon: 'lock-closed' },
              ], answers.q2, 'q2')}
              {renderNextArrow(!answers.q2)}
            </View>
          )}

          {/* QUESTION 3 */}
          {step === 3 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>I feel most balanced when my partner and I have similar daily habits and energy levels.</Text>
              {renderScaleOptions(answers.q3, 'q3')}
              {renderNextArrow(!answers.q3)}
            </View>
          )}

          {/* QUESTION 4 */}
          {step === 4 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>If I had to choose between spending time on my goals or my relationship, I'd usually choose my goals.</Text>
              {renderScaleOptions(answers.q4, 'q4')}
              {renderNextArrow(!answers.q4)}
            </View>
          )}

          {/* QUESTION 5 */}
          {step === 5 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>What's one thing that really matters to you in a relationship?</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="Write your answer"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                maxLength={200}
                value={answers.q5 || ''}
                onChangeText={(txt) => setAnswers(prev => ({...prev, q5: txt}))}
              />
              {renderNextArrow(!answers.q5)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryDark,
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 100, // Space for scrolling past keyboard
    flexGrow: 1,
  },
  pillWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  pill: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 10,
  },
  stepBlock: {
    flex: 1,
  },
  questionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    color: COLORS.black,
    marginBottom: SPACING.xl,
    lineHeight: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm as any,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight + '40',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minHeight: 180,
    marginBottom: SPACING.md,
    justifyContent: 'space-between',
    position: 'relative',
  },
  gridCardSelected: {
    borderColor: COLORS.primary,
  },
  gridCardText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
  },
  gridIconWrap: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  scaleContainer: {
    marginTop: SPACING.md,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  scaleText: {
    ...TYPOGRAPHY.body,
    marginLeft: SPACING.md,
    color: COLORS.text,
  },
  scaleTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '60',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 120,
    ...TYPOGRAPHY.body,
    textAlignVertical: 'top',
    color: COLORS.text,
  },
  arrowContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  roundArrowBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
