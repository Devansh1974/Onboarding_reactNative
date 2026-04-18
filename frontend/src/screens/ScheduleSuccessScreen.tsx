import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/CustomButton';
import { buildGoogleCalendarUrl, buildSessionDate } from '../utils/calendar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ScheduleSuccessScreen() {
  const params = useLocalSearchParams<{ date: string; time: string }>();

  const prettyDate = (() => {
    if (!params.date) return '';
    const [y, m, d] = String(params.date).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  })();

  const handleAddToCalendar = async () => {
    try {
      const start = buildSessionDate(String(params.date), String(params.time));
      const url = buildGoogleCalendarUrl({
        title: 'WingMann · Know Yourself Session',
        details:
          'Your 30-minute Know Yourself video session with WingMann. A Google Meet link will be shared by the WingMann team before the session.',
        startDate: start,
        durationMinutes: 30,
      });
      const supported = await Linking.canOpenURL(url);
      if (supported || Platform.OS === 'web') {
        Linking.openURL(url);
      } else {
        Alert.alert('Cannot open calendar', 'Please add the event manually.');
      }
    } catch (e) {
      console.error('Calendar error:', e);
      Alert.alert('Error', 'Could not add to calendar.');
    }
  };

  const handleDone = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          <Text style={styles.title}>Session Booked!</Text>
          <Text style={styles.subtitle}>We can't wait to meet you</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardEmoji}>📅</Text>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardValue}>{prettyDate}</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardEmoji}>⏰</Text>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardLabel}>Time</Text>
                <Text style={styles.cardValue}>{params.time} · 30 min</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardRow}>
              <Text style={styles.cardEmoji}>📹</Text>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardLabel}>Platform</Text>
                <Text style={styles.cardValue}>Google Meet (link soon)</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar} activeOpacity={0.85}>
            <Text style={styles.calendarEmoji}>🗓️</Text>
            <Text style={styles.calendarText}>Add to Calendar</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              We'll assign an interviewer and send your Google Meet link here before your session.
            </Text>
          </View>
        </View>

        <View style={styles.buttonWrap}>
          <CustomButton title="Go to Home" onPress={handleDone} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, justifyContent: 'space-between' },
  content: { alignItems: 'center', paddingTop: SPACING.xl },

  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkMark: { color: COLORS.white, fontSize: 64, fontWeight: '700', lineHeight: 72 },

  title: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.xl },

  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  cardEmoji: { fontSize: 28, marginRight: SPACING.md },
  cardTextWrap: { flex: 1 },
  cardLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  cardValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginTop: 2 },
  cardDivider: { height: 1, backgroundColor: COLORS.lightGray, marginVertical: 2 },

  calendarButton: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  calendarEmoji: { fontSize: 20, marginRight: SPACING.sm },
  calendarText: { ...TYPOGRAPHY.button, color: COLORS.primary },

  infoBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '10',
    width: '100%',
  },
  infoText: { ...TYPOGRAPHY.caption, color: COLORS.primary, textAlign: 'center', lineHeight: 18 },

  buttonWrap: { paddingTop: SPACING.lg },
});
