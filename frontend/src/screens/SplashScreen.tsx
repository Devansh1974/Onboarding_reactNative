import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function SplashScreen() {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    // Animate logo
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withSpring(1);

    // Navigate to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.logo}>WingMann</Text>
        <Text style={styles.tagline}>Find Your Match</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.8,
  },
});
