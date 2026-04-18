import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const PRESET_REASONS = [
  'Schedule conflict',
  'Not feeling well',
  'Need more time to prepare',
  'Timezone issue',
  'Other',
];

export default function RescheduleReasonScreen() {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selectedPreset === 'Other' ? customReason.trim() : selectedPreset;
  const canContinue = !!finalReason;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: '/schedule-pick-time',
      params: { mode: 'reschedule', reason: finalReason },
    });
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Reschedule Session</Text>
          <Text style={styles.subtitle}>
            Help us improve — tell us why you'd like to reschedule
          </Text>

          <View style={styles.presetsWrap}>
            {PRESET_REASONS.map((reason) => {
              const isSelected = selectedPreset === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[styles.preset, isSelected && styles.presetSelected]}
                  onPress={() => setSelectedPreset(reason)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedPreset === 'Other' && (
            <View style={styles.customWrap}>
              <Text style={styles.customLabel}>Tell us more</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Type your reason..."
                placeholderTextColor={COLORS.textSecondary}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{customReason.length}/200</Text>
            </View>
          )}

          <View style={styles.note}>
            <Text style={styles.noteText}>
              ℹ️ You can reschedule up to 3 times. After that, please contact support.
            </Text>
          </View>
        </View>

        <CustomButton
          title="Choose New Time"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },

  presetsWrap: { marginBottom: SPACING.md },
  preset: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  presetSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  presetText: { ...TYPOGRAPHY.body, color: COLORS.text },
  presetTextSelected: { color: COLORS.primary, fontWeight: '600' },

  customWrap: { marginTop: SPACING.md },
  customLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: SPACING.sm },
  textarea: {
    minHeight: 100,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  charCount: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'right', marginTop: SPACING.xs },

  note: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
  },
  noteText: { ...TYPOGRAPHY.caption, color: COLORS.primary, lineHeight: 18 },
});
