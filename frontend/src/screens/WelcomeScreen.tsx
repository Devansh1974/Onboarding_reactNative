import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/phone');
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.white} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            {/* Placeholder for illustration */}
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>👫</Text>
            </View>
          </View>

          <Text style={styles.title}>Ready to stop{' \n'}swiping and start{' \n'}dating with intent?</Text>
          <Text style={styles.subtitle}>
            Join WingMann and find meaningful connections
          </Text>
        </View>

        <View style={styles.footer}>
          <CustomButton title="Sign Up" onPress={handleGetStarted} />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or connect with</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title="Continue with Google"
            onPress={() => {}}
            variant="secondary"
          />

          <Text style={styles.terms}>
            By continuing, you agree to our{' \n'}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
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
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: {
    fontSize: 80,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  footer: {
    paddingBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
  },
  terms: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
