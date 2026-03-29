import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function HeightScreen() {
  const { data, updateData } = useOnboarding();
  const [height, setHeight] = useState<number>(170);
  const isMale = data.gender === 'male';

  const heights = Array.from({ length: 100 }, (_, i) => 120 + i);

  const handleContinue = () => {
    updateData({ height });
    router.push('/location');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Now tell me, how tall are you?</Text>
          <Text style={styles.subtitle}>Just getting the full picture of you!</Text>
          
          <View style={styles.heightDisplay}>
            <Text style={styles.heightText}>{height} cm</Text>
          </View>

          <View style={styles.illustration}>
            <Text style={styles.illustrationText}>{isMale ? '🚹' : '🚺'}</Text>
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  heightDisplay: { alignItems: 'center', marginVertical: SPACING.xl },
  heightText: { ...TYPOGRAPHY.h1, fontSize: 48, color: COLORS.primary },
  illustration: { width: '100%', height: 300, backgroundColor: COLORS.primaryLight + '20', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  illustrationText: { fontSize: 120 },
});