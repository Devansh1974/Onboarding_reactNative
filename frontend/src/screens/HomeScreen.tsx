import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';

export default function HomeScreen() {
  const { data } = useOnboarding();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to WingMann!</Text>
      <Text style={styles.subtitle}>Hello, {data.name}! 👋</Text>
      
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Your Profile:</Text>
        <Text style={styles.dataText}>Phone: {data.countryCode} {data.phoneNumber}</Text>
        <Text style={styles.dataText}>Gender: {data.gender}</Text>
        <Text style={styles.dataText}>Preference: {data.preference}</Text>
      </View>

      <Text style={styles.note}>
        This is a placeholder home screen.{' \n'}
        The main app features will be built here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  dataContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 16,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  dataTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dataText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  note: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
