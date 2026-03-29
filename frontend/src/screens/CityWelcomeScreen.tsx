import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function CityWelcomeScreen() {
  const { data } = useOnboarding();
  const opacity = useSharedValue(0);

  const cityInfo = {
    'Bangalore': {
      title: 'Bangalore',
      subtitle: 'Sweet - the city of startups and filter coffee',
      emoji: '☕',
    },
    'Hyderabad': {
      title: 'Hyderabad',
      subtitle: 'Timeless - where old charm meets new dreams',
      emoji: '🕌',
    },
  };

  const info = cityInfo[data.location as keyof typeof cityInfo] || cityInfo['Bangalore'];

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withDelay(300, withSpring(1));
  }, []);

  const handleContinue = () => {
    router.push('/native-state');
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.primary} scrollable={false}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <Text style={styles.emoji}>{info.emoji}</Text>
          <Text style={styles.title}>{info.title}</Text>
          <Text style={styles.subtitle}>{info.subtitle}</Text>
        </Animated.View>

        <CustomButton title="Continue" onPress={handleContinue} variant="secondary" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: SPACING.lg, paddingTop: SPACING.xxl },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 120, marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.md, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.white, opacity: 0.9, textAlign: 'center' },
});