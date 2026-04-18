import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ScheduleConfirmScreen() {
  const { data } = useOnboarding();
  const params = useLocalSearchParams<{ date: string; time: string; mode?: string; reason?: string }>();
  const [loading, setLoading] = useState(false);

  const isReschedule = params.mode === 'reschedule';

  const prettyDate = (() => {
    if (!params.date) return '';
    const [y, m, d] = String(params.date).split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  })();

  const handleConfirm = async () => {
    if (!data.phoneNumber) {
      Alert.alert('Error', 'Missing phone number. Please restart the flow.');
      return;
    }
    setLoading(true);
    try {
      const endpoint = isReschedule ? '/api/sessions/reschedule' : '/api/sessions/book';
      const body = isReschedule
        ? {
            phoneNumber: data.phoneNumber,
            newDate: params.date,
            newTime: params.time,
            reason: params.reason || '',
          }
        : {
            phoneNumber: data.phoneNumber,
            userName: data.name,
            userEmail: '',
            scheduledDate: params.date,
            scheduledTime: params.time,
          };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (result.success) {
        router.replace({
          pathname: '/schedule-success',
          params: { date: String(params.date), time: String(params.time) },
        });
      } else {
        Alert.alert('Booking Failed', result.message || 'Please try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Network Error', 'Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>🗓️</Text>
          </View>
          <Text style={styles.title}>
            {isReschedule ? 'Confirm Reschedule' : 'Confirm Your Booking'}
          </Text>
          <Text style={styles.subtitle}>
            Please review your session details
          </Text>

          <View style={styles.summary}>
            <View style={styles.row}>
              <Text style={styles.label}>Session</Text>
              <Text style={styles.value}>Know Yourself (30 min)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{prettyDate}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{params.time}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{data.name || '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Platform</Text>
              <Text style={styles.value}>Google Meet</Text>
            </View>
          </View>

          {isReschedule && params.reason ? (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reschedule reason</Text>
              <Text style={styles.reasonText}>{params.reason}</Text>
            </View>
          ) : null}

          <View style={styles.note}>
            <Text style={styles.noteText}>
              ℹ️ An admin will assign an interviewer and share the Google Meet link shortly before your session.
            </Text>
          </View>
        </View>

        <CustomButton
          title={isReschedule ? 'Confirm Reschedule' : 'Confirm Booking'}
          onPress={handleConfirm}
          loading={loading}
          disabled={loading}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.lg },
  iconWrap: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  iconText: { fontSize: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },

  summary: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.lightGray },
  label: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  value: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, maxWidth: '60%', textAlign: 'right' },

  reasonBox: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  reasonLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  reasonText: { ...TYPOGRAPHY.body, color: COLORS.text },

  note: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
  },
  noteText: { ...TYPOGRAPHY.caption, color: COLORS.primary, lineHeight: 18 },
});
