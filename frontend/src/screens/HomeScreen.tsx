import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../context/OnboardingContext';
import { buildGoogleCalendarUrl, buildSessionDate } from '../utils/calendar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const { data } = useOnboarding();
  const [greeting, setGreeting] = useState('');
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchSessionStatus();
  }, []);

  const fetchSessionStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions/user/${data.phoneNumber}`);
      const result = await response.json();
      setSessionStatus(result);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSessionStatus();
  };

  const handleAddToCalendar = (session: any) => {
    try {
      const start = buildSessionDate(session.scheduledDate, session.scheduledTime);
      const url = buildGoogleCalendarUrl({
        title: 'WingMann · Know Yourself Session',
        details:
          session.meetingLink
            ? `Your 30-minute Know Yourself video session.\n\nJoin: ${session.meetingLink}`
            : 'Your 30-minute Know Yourself video session. A Google Meet link will be shared soon.',
        startDate: start,
        durationMinutes: session.duration || 30,
      });
      Linking.openURL(url);
    } catch (e) {
      console.error('Calendar error:', e);
      Alert.alert('Error', 'Could not add to calendar.');
    }
  };

  const handleJoinMeet = (link: string) => {
    if (!link) return;
    Linking.openURL(link).catch(() => Alert.alert('Error', 'Could not open meeting link.'));
  };

  const renderContent = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    const session = sessionStatus?.session;
    const status = sessionStatus?.status || 'not_scheduled';

    // State 1: Not Scheduled
    if (status === 'not_scheduled' || !session) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>Schedule Your Know Yourself Session</Text>
          <Text style={styles.cardText}>
            A 30-minute video call to understand your dating goals better
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/schedule-intro')}
          >
            <Text style={styles.buttonText}>Schedule Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // State 2: Scheduled
    if (status === 'scheduled' || status === 'rescheduled') {
      const sessionDate = new Date(session.scheduledDate);
      const daysUntil = Math.ceil((sessionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      return (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Confirmed</Text>
            </View>
            <TouchableOpacity
              style={styles.calendarIconBtn}
              onPress={() => handleAddToCalendar(session)}
              accessibilityLabel="Add to Calendar"
              activeOpacity={0.7}
            >
              <Text style={styles.calendarIconText}>🗓️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardIcon}>✅</Text>
          <Text style={styles.cardTitle}>Session Scheduled</Text>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionDate}>
              {sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.sessionTime}>{session.scheduledTime}</Text>
            <Text style={styles.countdown}>
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
            </Text>
          </View>

          {session.meetingLink ? (
            <TouchableOpacity style={styles.meetLinkButton} onPress={() => handleJoinMeet(session.meetingLink)}>
              <Text style={styles.meetLinkText}>📹  Join Google Meet</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.meetPendingBox}>
              <Text style={styles.meetPendingText}>📨  Google Meet link will appear here before your session</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addCalBtn}
            onPress={() => handleAddToCalendar(session)}
            activeOpacity={0.85}
          >
            <Text style={styles.addCalText}>🗓️  Add to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/reschedule-reason')}
          >
            <Text style={styles.secondaryButtonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // State 3: Missed
    if (status === 'missed') {
      return (
        <View style={[styles.card, styles.cardWarning]}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardTitle}>Session Missed</Text>
          <Text style={styles.cardText}>
            You missed your scheduled session. Please reschedule to continue.
          </Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/reschedule-reason')}
          >
            <Text style={styles.buttonText}>Reschedule Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // State 4: Under Review
    if (status === 'completed' && session.reviewStatus === 'under_review') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🔍</Text>
          <Text style={styles.cardTitle}>Session Complete - Under Review</Text>
          <Text style={styles.cardText}>
            Your profile is being reviewed. We'll notify you within 24-48 hours.
          </Text>
        </View>
      );
    }

    // State 5: Approved - Show Compatibility Quiz
    if (session.reviewStatus === 'approved') {
      return (
        <>
          <View style={[styles.card, styles.cardSuccess]}>
            <Text style={styles.cardIcon}>🎉</Text>
            <Text style={styles.cardTitle}>You're Officially In!</Text>
            <Text style={styles.cardText}>
              Congratulations! Your profile has been approved. Start finding matches!
            </Text>
          </View>
          
          <View style={[styles.card, { marginTop: SPACING.md }]}>
            <Text style={styles.cardIcon}>💝</Text>
            <Text style={styles.cardTitle}>Take Compatibility Quiz</Text>
            <Text style={styles.cardText}>
              Discover your perfect match with our compatibility assessment
            </Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => router.push('/compatibility-quiz')}
            >
              <Text style={styles.buttonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    // State 6: Rejected
    if (session.reviewStatus === 'rejected') {
      return (
        <View style={[styles.card, styles.cardError]}>
          <Text style={styles.cardIcon}>😔</Text>
          <Text style={styles.cardTitle}>Profile Not Approved</Text>
          <Text style={styles.cardText}>
            Unfortunately, your profile wasn't approved at this time.
          </Text>
          {session.reviewNotes && (
            <Text style={styles.reviewNotes}>{session.reviewNotes}</Text>
          )}
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{data.name}! 👋</Text>
      </View>

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.xxl },
  header: { marginBottom: SPACING.xl },
  greeting: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary },
  name: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginTop: SPACING.xs },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.xl },
  
  card: { 
    backgroundColor: COLORS.white, 
    padding: SPACING.lg, 
    borderRadius: BORDER_RADIUS.lg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 3,
    marginBottom: SPACING.md,
  },
  cardSuccess: { backgroundColor: '#F0FFF4', borderWidth: 1, borderColor: COLORS.success },
  cardWarning: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#F59E0B' },
  cardError: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: COLORS.error },
  cardIcon: { fontSize: 48, textAlign: 'center', marginBottom: SPACING.md },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  cardText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  
  sessionInfo: { alignItems: 'center', marginVertical: SPACING.md },
  sessionDate: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: SPACING.xs },
  sessionTime: { ...TYPOGRAPHY.h2, color: COLORS.primary, marginBottom: SPACING.xs },
  countdown: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  
  button: { 
    backgroundColor: COLORS.primary, 
    padding: SPACING.md, 
    borderRadius: BORDER_RADIUS.md, 
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  buttonText: { ...TYPOGRAPHY.button, color: COLORS.white },
  
  secondaryButton: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: COLORS.primary, 
    padding: SPACING.md, 
    borderRadius: BORDER_RADIUS.md, 
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  secondaryButtonText: { ...TYPOGRAPHY.button, color: COLORS.primary },
  
  meetLinkButton: { 
    backgroundColor: '#4285F4', 
    padding: SPACING.md, 
    borderRadius: BORDER_RADIUS.md, 
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  meetLinkText: { ...TYPOGRAPHY.button, color: COLORS.white },

  meetPendingBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  meetPendingText: { ...TYPOGRAPHY.caption, color: COLORS.primary, textAlign: 'center' },

  addCalBtn: {
    backgroundColor: COLORS.primary + '15',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addCalText: { ...TYPOGRAPHY.button, color: COLORS.primary, fontSize: 15 },

  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '18',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusPillText: { ...TYPOGRAPHY.caption, color: COLORS.success, fontWeight: '600' },
  calendarIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIconText: { fontSize: 18 },
  
  reviewNotes: { 
    ...TYPOGRAPHY.caption, 
    color: COLORS.error, 
    backgroundColor: COLORS.white, 
    padding: SPACING.sm, 
    borderRadius: BORDER_RADIUS.sm, 
    marginVertical: SPACING.sm 
  },
});
