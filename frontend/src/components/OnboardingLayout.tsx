import React, { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './Header';
import { COLORS, SPACING } from '../constants/theme';

interface OnboardingLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  onBack?: () => void;
  backgroundColor?: string;
  scrollable?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  showHeader = true,
  onBack,
  backgroundColor = COLORS.background,
  scrollable = true,
}) => {
  const content = (
    <View style={[styles.container, { backgroundColor }]}>
      {showHeader && <Header onBack={onBack} showBack={!!onBack} />}
      <View style={styles.content}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
});
