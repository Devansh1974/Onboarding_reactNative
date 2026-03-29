import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function WingMannIntroScreen() {
  const { data } = useOnboarding();
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withDelay(300, withSpring(1));
  }, []);

  const handleContinue = () => {
    router.push('/birthday');
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.primary} scrollable={false}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationText}>🤝</Text>
          </View>
          <Text style={styles.greeting}>Hey {data.name},</Text>
          <Text style={styles.title}>I'm your WingMann</Text>
          <Text style={styles.subtitle}>Let's help you make{' \n'}better connections</Text>
        </Animated.View>

        <CustomButton title="Continue" onPress={handleContinue} variant="secondary" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: SPACING.lg, paddingTop: SPACING.xxl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  illustration: { width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.white + '20', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  illustrationText: { fontSize: 80 },
  greeting: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: SPACING.xs },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.md },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.white, opacity: 0.8, textAlign: 'center' },
});