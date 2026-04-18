import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';

export default function MatchesPlaceholder() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meet Your Matches</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name="heart" size={80} color={COLORS.lightGray} />
        <Text style={styles.title}>Algorithm Active ✨</Text>
        <Text style={styles.subtitle}>
          We are currently analyzing your inputs natively across the platform. Soon, this area will unlock your personalized curated profiles.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>UNDER DEVELOPMENT</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.lg, 
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '40'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, fontSize: 18, marginLeft: SPACING.sm },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#472B52',
    fontSize: 24,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 24
  },
  footer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center'
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.lightGray
  }
});
