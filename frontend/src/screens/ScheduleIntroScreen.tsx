import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ScheduleIntroScreen() {
  return (
    <OnboardingLayout onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>🎯</Text>
          </View>
          <Text style={styles.title}>What is the Know Yourself Session?</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📹 30-Minute Video Call</Text>
            <Text style={styles.infoText}>A friendly conversation to understand your dating goals</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎤 Share Your Story</Text>
            <Text style={styles.infoText}>Tell us about yourself, your preferences, and what you're looking for</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>✨ Get Personalized Help</Text>
            <Text style={styles.infoText}>Receive guidance on creating an authentic profile</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚀 Get Approved</Text>
            <Text style={styles.infoText}>Your profile will be reviewed and approved within 24-48 hours</Text>
          </View>
        </View>

        <CustomButton 
          title="Schedule My Session" 
          onPress={() => router.push('/schedule-pick-time')} 
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  icon: { width: 100, height: 100, backgroundColor: COLORS.primary + '20', borderRadius: 50, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: SPACING.xl },
  iconText: { fontSize: 48 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.xl, textAlign: 'center' },
  infoCard: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: SPACING.xs },
  infoText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});