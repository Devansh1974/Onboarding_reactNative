import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function Intro2Screen() {
  const { data, updateData } = useOnboarding();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    opacity.value = withDelay(300, withSpring(1));
    translateY.value = withDelay(300, withSpring(0));
  }, []);

  const handleComplete = async () => {
    // Mark onboarding as completed
    updateData({ onboardingCompleted: true });
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }

    // Navigate to home (main app)
    router.replace('/home');
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.primary} scrollable={false}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <View style={styles.illustrationContainer}>
            {/* Placeholder for illustration */}
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>💬</Text>
            </View>
          </View>

          <Text style={styles.title}>Let's find your{' \n'}perfect match</Text>
          <Text style={styles.subtitle}>
            Start meaningful conversations{' \n'}and build real connections
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <CustomButton
            title="Get Started"
            onPress={handleComplete}
            variant="secondary"
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: SPACING.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: SPACING.xl,
  },
  illustration: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    fontSize: 80,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
});
