import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function StoryScreen() {
  const { updateData } = useOnboarding();
  const [story, setStory] = useState('');
  const maxWords = 100;

  const wordCount = story.trim().split(/\s+/).filter(Boolean).length;

  const handleContinue = () => {
    if (!story) return;
    updateData({ story });
    router.push('/non-negotiables');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What's your story?</Text>
          <Text style={styles.subtitle}>Write about your journey in 100 words</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="E.g. Product Designer @ Goi Whatslar Offer Rights I'm a WhatsApp Cricket Army. Peter Corrilons in Bangalore..."
              multiline
              maxLength={500}
              value={story}
              onChangeText={setStory}
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.wordCount}>{wordCount}/{maxWords} words</Text>
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!story || wordCount > maxWords} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  inputContainer: { marginTop: SPACING.lg },
  input: { ...TYPOGRAPHY.body, color: COLORS.text, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, height: 200, textAlignVertical: 'top' },
  wordCount: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'right' },
});