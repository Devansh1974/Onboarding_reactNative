import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Answers {
  q1?: number;  // Q11: Worry partner loses interest (NEW)
  q2?: number;  // Q12: Closeness vs space
  q3?: number;  // Q13: Hold back feelings
  q4?: string;  // Q14: When overwhelmed (MCQ)
  q5?: string;  // Q15: Delayed texting (MCQ)
  q6?: number;  // Q16: Feel safe sharing
}

export default function AttachmentQuiz() {
  const { data } = useOnboarding();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          data: { compatibilityQuiz: { attachmentAndComfort: answers } }
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.replace('/compatibility-quiz/conflict' as any);
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

  const nextStep = () => { if (step < 6) setStep(step + 1); else handleSubmit(); };
  const prevStep = () => { if (step > 1) setStep(step - 1); else router.back(); };

  const renderNextArrow = (disabled = false) => (
    <View style={styles.arrowContainer}>
      <TouchableOpacity style={[styles.roundArrowBtn, disabled && { opacity: 0.5 }]} onPress={nextStep} disabled={disabled || loading}>
        <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderGridOptions = (options: {id: string, text: string, icon: keyof typeof Ionicons.glyphMap}[], currentVal: string | undefined, field: keyof Answers) => (
    <View style={styles.gridContainer}>
      {options.map((opt) => {
        const isSelected = currentVal === opt.id;
        return (
          <TouchableOpacity key={opt.id} style={[styles.gridCard, isSelected && styles.gridCardSelected]}
            onPress={() => setAnswers(prev => ({...prev, [field]: opt.id}))} activeOpacity={0.8}>
            <View style={{ flex: 1 }}><Text style={styles.gridCardText}>{opt.text}</Text></View>
            <View style={[styles.gridIconWrap, isSelected && { backgroundColor: COLORS.primary }]}>
              <Ionicons name={opt.icon} size={38} color={isSelected ? COLORS.white : COLORS.primary} />
            </View>
            {isSelected && (<View style={styles.checkBadge}><Ionicons name="checkmark-circle" size={24} color={COLORS.primary} /></View>)}
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
            <TouchableOpacity key={s.id} style={styles.scaleRow} onPress={() => setAnswers(prev => ({...prev, [field]: s.id}))}>
              <Ionicons name={s.icon as any} size={34} color={isSelected ? COLORS.primary : COLORS.gray} />
              <Text style={[styles.scaleText, isSelected && styles.scaleTextSelected]}>{s.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attachment & Comfort</Text>
      </View>
      <View style={{ width: '100%', height: 4, backgroundColor: '#E2E8F0' }}>
        <View style={{ width: `${Math.round(((10 + step) / 25) * 100)}%`, height: '100%', backgroundColor: COLORS.primary }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <View style={styles.pillWrap}>
            <View style={styles.pill}><Text style={styles.pillText}>QUESTION {step} OF 6</Text></View>
          </View>

          {/* Q11: Worry partner may lose interest (NEW) */}
          {step === 1 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>I sometimes worry that my partner might lose interest or drift away.</Text>
              {renderScaleOptions(answers.q1, 'q1')}
              {renderNextArrow(!answers.q1)}
            </View>
          )}

          {/* Q12: Closeness vs space */}
          {step === 2 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>I love emotional closeness, but too much of it can make me want space.</Text>
              {renderScaleOptions(answers.q2, 'q2')}
              {renderNextArrow(!answers.q2)}
            </View>
          )}

          {/* Q13: Hold back feelings */}
          {step === 3 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>Even with someone I trust, I sometimes hold back my true feelings.</Text>
              {renderScaleOptions(answers.q3, 'q3')}
              {renderNextArrow(!answers.q3)}
            </View>
          )}

          {/* Q14: When overwhelmed (MCQ) */}
          {step === 4 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>When I feel overwhelmed, I usually:</Text>
              {renderGridOptions([
                { id: 'alone', text: 'Take some time alone to recharge and think.', icon: 'sunny-outline' },
                { id: 'talk', text: 'Talk it out with someone I trust.', icon: 'people-outline' },
                { id: 'distract', text: 'Distract myself with music, shows, or hobbies.', icon: 'musical-notes-outline' },
                { id: 'busy', text: 'Try to stay busy and push through.', icon: 'briefcase-outline' },
              ], answers.q4, 'q4')}
              {renderNextArrow(!answers.q4)}
            </View>
          )}

          {/* Q15: Delayed texting (MCQ) */}
          {step === 5 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>If someone you're dating doesn't text back for hours, what's your first reaction?</Text>
              {renderGridOptions([
                { id: 'calm', text: "Calm – they're probably busy", icon: 'cafe-outline' },
                { id: 'anxious', text: 'Anxious – did I say something wrong?', icon: 'help-circle-outline' },
                { id: 'unbothered', text: "Unbothered – I'll reply later too", icon: 'phone-portrait-outline' },
                { id: 'irritated', text: 'Irritated – communication should be consistent', icon: 'warning-outline' },
              ], answers.q5, 'q5')}
              {renderNextArrow(!answers.q5)}
            </View>
          )}

          {/* Q16: Feel safe sharing */}
          {step === 6 && (
            <View style={styles.stepBlock}>
              <Text style={styles.questionTitle}>I feel safe sharing my feelings when I know I won't be judged.</Text>
              {renderScaleOptions(answers.q6, 'q6')}
              {renderNextArrow(!answers.q6)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, fontSize: 18, marginLeft: SPACING.sm },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: 100, flexGrow: 1 },
  pillWrap: { alignItems: 'center', marginBottom: SPACING.xl },
  pill: { backgroundColor: COLORS.primaryLight + '20', paddingHorizontal: 16, paddingVertical: 6, borderRadius: BORDER_RADIUS.round },
  pillText: { ...TYPOGRAPHY.caption, color: COLORS.primaryDark, fontWeight: '700', letterSpacing: 1, fontSize: 10 },
  stepBlock: { flex: 1 },
  questionTitle: { ...TYPOGRAPHY.h2, fontSize: 24, color: COLORS.black, marginBottom: SPACING.xl, lineHeight: 32 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.sm as any },
  gridCard: { width: '48%', backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primaryLight + '40', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, minHeight: 180, marginBottom: SPACING.md, justifyContent: 'space-between', position: 'relative' },
  gridCardSelected: { borderColor: COLORS.primary },
  gridCardText: { ...TYPOGRAPHY.body, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  gridIconWrap: { alignSelf: 'center', marginTop: SPACING.md, backgroundColor: COLORS.cardBackground, padding: SPACING.md, borderRadius: BORDER_RADIUS.round },
  checkBadge: { position: 'absolute', bottom: -10, right: -10, backgroundColor: COLORS.white, borderRadius: 12 },
  scaleContainer: { marginTop: SPACING.md },
  scaleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  scaleText: { ...TYPOGRAPHY.body, marginLeft: SPACING.md, color: COLORS.text },
  scaleTextSelected: { color: COLORS.primary, fontWeight: '600' },
  arrowContainer: { alignItems: 'center', marginTop: SPACING.xxl },
  roundArrowBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
