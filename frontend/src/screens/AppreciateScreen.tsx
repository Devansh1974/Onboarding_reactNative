import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function AppreciateScreen() {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withDelay(300, withSpring(1));
  }, []);

  const handleContinue = () => {
    router.push('/preferences');
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.primary} scrollable={false}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <Text style={styles.emoji}>🤝</Text>
          <Text style={styles.title}>Appreciate your{' \n'}honesty</Text>
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
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, textAlign: 'center' },
});