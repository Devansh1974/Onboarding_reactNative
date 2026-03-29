import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function NonNegotiablesScreen() {
  const { updateData } = useOnboarding();
  const [text, setText] = useState('');

  const handleContinue = () => {
    const items = text.split('\n').filter(Boolean);
    updateData({ nonNegotiables: items });
    router.push('/offerings');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What are your non-negotiables in a relationship?</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E.g. Someone Who Values Open Communication As Much As I Do & 4 Communicare Via Voice Clips-And 2 General Plan Texts-And 3 Just Playing It By Ear-Some Tabs"
              multiline
              value={text}
              onChangeText={setText}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!text} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xl },
  inputContainer: { marginTop: SPACING.lg },
  input: { ...TYPOGRAPHY.body, color: COLORS.text, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, height: 200, textAlignVertical: 'top' },
});