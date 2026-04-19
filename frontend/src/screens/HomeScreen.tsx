import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../context/OnboardingContext';
import { buildGoogleCalendarUrl, buildSessionDate } from '../utils/calendar';
import BottomTabBar from '../components/BottomTabBar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const { data } = useOnboarding();
  const [greeting, setGreeting] = useState('');
  const [sessionStatus, setSessionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchSessionStatus();
  }, []);

  const fetchSessionStatus = async () => {
    try {
      // Fetch session
      const sessionResponse = await fetch(`${BACKEND_URL}/api/sessions/user/${data.phoneNumber}`);
      const sessionResult = await sessionResponse.json();
      setSessionStatus(sessionResult);

      // Fetch latest user profile to know quiz status
      const userResponse = await fetch(`${BACKEND_URL}/api/users/${data.phoneNumber}`);
      const userResult = await userResponse.json();
      if (userResult.success && userResult.user) {
        setUserProfile(userResult.user);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        details: session.meetingLink
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

  const session = sessionStatus?.session;
  const status = sessionStatus?.status || 'not_scheduled';
  const reviewStatus = session?.reviewStatus;
  const isApproved = reviewStatus === 'approved';
  const isUnderReview = status === 'completed' && reviewStatus === 'under_review';

  // Derived state for quizzes
  const quiz = userProfile?.compatibilityQuiz || {};
  const isQuizCompleted = !!(
    quiz.lifestyleAndValues?.q5 &&
    quiz.emotionalCommunication?.q5 &&
    quiz.attachmentAndComfort?.q6 &&
    quiz.conflictAndRepair?.q4 &&
    quiz.growthAndReadiness?.q5
  );

  const curateVibeCompleted = !!userProfile?.vibeCompleted;

  const matchesUnlocked = isApproved && isQuizCompleted && curateVibeCompleted;

  // === Matches Ready Dashboard ===
  const renderMatchesReadyDashboard = () => (
    <View>
      <Text style={styles.greeting}>
        {greeting}, {data.name || 'there'}
      </Text>
      <Text style={styles.welcome}>Your matches are ready 🎉</Text>

      <View style={styles.successBanner}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#166534" />
        <Text style={styles.successBannerText}>
          Your vibe is set! We've found your first 5 matches.
        </Text>
      </View>

      <Text style={styles.sectionLabelDashboard}>YOUR DASHBOARD</Text>
      <View style={styles.dashboardGrid}>
         <View style={styles.dashboardMiniCard}>
            <Text style={styles.dashboardLabel}>Profile</Text>
            <Text style={styles.dashboardVal}>100%</Text>
            <View style={styles.dashboardLineWrap}><View style={[styles.dashboardLineCore, { width: '100%' }]} /></View>
         </View>
         <View style={styles.dashboardMiniCard}>
            <Text style={styles.dashboardLabel}>Quiz</Text>
            <Text style={styles.dashboardVal}>100%</Text>
            <View style={styles.dashboardLineWrap}><View style={[styles.dashboardLineCore, { width: '100%' }]} /></View>
         </View>
      </View>
      <View style={styles.dashboardMiniCardFull}>
         <Text style={styles.dashboardLabel}>Vibe</Text>
         <Text style={styles.dashboardVal}>100%</Text>
         <View style={styles.dashboardLineWrap}><View style={[styles.dashboardLineCore, { width: '100%' }]} /></View>
      </View>

      <View style={styles.matchesHero}>
        <View style={styles.readyPill}>
          <Text style={styles.readyPillText}>✨ READY</Text>
        </View>
        <Text style={styles.matchesHeroTitle}>Meet Your{'\n'}Matches</Text>
        <Text style={styles.matchesHeroSub}>5 profiles curated just for you today</Text>

        <TouchableOpacity 
           style={styles.heroBtnWhiteMatches} 
           onPress={() => router.push('/matches' as any)}
        >
          <Text style={styles.heroBtnWhiteTextMatches}>See My Matches →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // === Main hero card based on state ===
  const renderHeroCard = () => {
    if (loading) {
      return (
        <View style={styles.heroCard}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      );
    }

    // Scheduled
    if (status === 'scheduled' || status === 'rescheduled') {
      const sessionDate = new Date(session.scheduledDate);
      const daysUntil = Math.ceil((sessionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return (
        <View style={styles.heroCard}>
          <View style={styles.heroPillRow}>
            <View style={styles.confirmedPill}>
              <View style={styles.confirmedDot} />
              <Text style={styles.confirmedPillText}>CONFIRMED</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Your Know Yourself Session</Text>
          <Text style={styles.heroSub}>
            {sessionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}{' '}
            · {session.scheduledTime} ·{' '}
            {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}
          </Text>

          <View style={styles.heroActionsRow}>
            {session.meetingLink ? (
              <TouchableOpacity
                style={styles.heroBtnWhite}
                onPress={() => handleJoinMeet(session.meetingLink)}
                activeOpacity={0.9}
              >
                <Ionicons name="videocam" size={18} color={COLORS.primary} />
                <Text style={styles.heroBtnWhiteText}>Join Meet</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.heroBtnWhite}
                onPress={() => handleAddToCalendar(session)}
                activeOpacity={0.9}
              >
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
                <Text style={styles.heroBtnWhiteText}>Add to Calendar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.heroBtnGhost}
              onPress={() => router.push('/reschedule-reason')}
              activeOpacity={0.9}
            >
              <Text style={styles.heroBtnGhostText}>Reschedule</Text>
            </TouchableOpacity>
          </View>

          {!session.meetingLink && (
            <Text style={styles.heroNote}>📨 Google Meet link will appear here before your session</Text>
          )}
        </View>
      );
    }

    // Under Review
    if (isUnderReview) {
      return (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Under Review</Text>
          <Text style={styles.heroSubLight}>MANDATORY 30-MIN VIDEO CALL</Text>
          <Text style={[styles.heroNote, { marginTop: SPACING.sm }]}>
            Your session is complete. We'll notify you within 24–48 hours.
          </Text>
        </View>
      );
    }

    // Approved
    if (isApproved) {
      return (
        <View style={[styles.heroCard, styles.heroCardApproved]}>
          <Text style={styles.heroTitle}>You're Officially In! 🎉</Text>
          <Text style={styles.heroSubLight}>PROFILE APPROVED — START MATCHING</Text>
        </View>
      );
    }

    // Rejected
    if (reviewStatus === 'rejected') {
      return (
        <View style={[styles.heroCard, styles.heroCardRejected]}>
          <Text style={styles.heroTitle}>Profile Not Approved</Text>
          <Text style={styles.heroSubLight}>CONTACT SUPPORT</Text>
          {session?.reviewNotes ? (
            <Text style={[styles.heroNote, { marginTop: SPACING.sm }]}>{session.reviewNotes}</Text>
          ) : null}
        </View>
      );
    }

    // Missed
    if (status === 'missed') {
      return (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Session Missed</Text>
          <Text style={styles.heroSubLight}>PLEASE RESCHEDULE</Text>
          <TouchableOpacity
            style={[styles.heroBtnWhite, { alignSelf: 'flex-start', marginTop: SPACING.md }]}
            onPress={() => router.push('/reschedule-reason')}
          >
            <Text style={styles.heroBtnWhiteText}>Reschedule Now →</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Default: Not Scheduled
    return (
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Schedule Your Know Yourself Session</Text>
        <Text style={styles.heroSubLight}>MANDATORY 30-MIN VIDEO CALL</Text>
        <TouchableOpacity
          style={[styles.heroBtnWhite, { alignSelf: 'flex-start', marginTop: SPACING.lg }]}
          onPress={() => router.push('/schedule-intro')}
          activeOpacity={0.9}
        >
          <Text style={styles.heroBtnWhiteText}>Book My Session →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // === Step indicator (What Happens Next?) ===
  const stepState = (n: 1 | 2 | 3): 'active' | 'done' | 'pending' => {
    if (n === 1) {
      if (status === 'not_scheduled') return 'active';
      return 'done';
    }
    if (n === 2) {
      if (isUnderReview) return 'active';
      if (isApproved || reviewStatus === 'rejected') return 'done';
      return 'pending';
    }
    return isApproved ? 'active' : 'pending';
  };

  const StepRow = ({
    n,
    title,
    subtitle,
  }: {
    n: 1 | 2 | 3;
    title: string;
    subtitle: string;
  }) => {
    const state = stepState(n);
    return (
      <View style={[styles.stepRow, state === 'active' && styles.stepRowActive]}>
        <View
          style={[
            styles.stepCircle,
            state === 'active' && { backgroundColor: COLORS.primary },
            state === 'done' && { backgroundColor: COLORS.success },
          ]}
        >
          {state === 'done' ? (
            <Ionicons name="checkmark" size={16} color={COLORS.white} />
          ) : (
            <Text style={[styles.stepNum, state === 'active' && { color: COLORS.white }]}>{n}</Text>
          )}
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <Text style={[styles.stepTitle, state === 'pending' && styles.stepTitleDim]}>{title}</Text>
          <Text style={styles.stepSub}>{subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Wingmann</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {matchesUnlocked ? (
          renderMatchesReadyDashboard()
        ) : (
          <>
            <Text style={styles.greeting}>
              {greeting}, {data.name || 'there'}
            </Text>
            <Text style={styles.welcome}>Welcome to Wingmann ✨</Text>

        {/* Hero Card */}
        {renderHeroCard()}

        {/* Info strip */}
        {status === 'not_scheduled' && !loading && (
          <View style={styles.infoStrip}>
            <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
            <Text style={styles.infoStripText}>
              Your profile is complete! Book your session to get verified
            </Text>
          </View>
        )}

        {/* What Happens Next */}
        <Text style={styles.sectionLabel}>WHAT HAPPENS NEXT?</Text>
        <StepRow n={1} title="Book session" subtitle="Choose a slot for your verification call." />
        <StepRow n={2} title="Get verified" subtitle="Our team completes your safety check." />
        <StepRow n={3} title="Meet matches" subtitle="Unlock your curated dating pool." />

        {/* Locked feature cards row */}
        <View style={styles.lockedRow}>
          <LockedCard
            icon={isQuizCompleted ? "checkmark-circle" : "bulb-outline"}
            title="Compatibility Quiz"
            unlocked={isApproved && !isQuizCompleted}
            completed={isQuizCompleted}
            subtextOverride={isQuizCompleted ? "✓ Completed" : undefined}
            onPress={() => router.push('/compatibility-quiz' as any)}
          />
          <LockedCard
            icon={curateVibeCompleted ? "checkmark-circle" : "color-palette-outline"}
            title="Curate Your Vibe"
            unlocked={isApproved && !curateVibeCompleted}
            completed={curateVibeCompleted}
            subtextOverride={curateVibeCompleted ? "✓ Completed" : undefined}
            onPress={() => router.push('/curate-vibe' as any)}
          />
        </View>

        <View style={{ ...styles.lockedRow, marginTop: SPACING.sm }}>
          <LockedCard
            icon="heart-half-outline"
            title="View Matches"
            unlocked={matchesUnlocked}
            subtextOverride={!matchesUnlocked ? "Requires Quiz & Vibe" : undefined}
            onPress={() => router.push('/matches' as any)}
          />
        </View>
        </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

// === Locked/Unlocked feature card ===
const LockedCard = ({
  icon,
  title,
  unlocked,
  completed,
  subtextOverride,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  unlocked: boolean;
  completed?: boolean;
  subtextOverride?: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.lockedCard, unlocked && styles.lockedCardActive, completed && styles.lockedCardCompleted]}
    activeOpacity={unlocked ? 0.85 : 1}
    onPress={unlocked ? onPress : undefined}
    disabled={!unlocked}
  >
    <View style={styles.lockIconWrap}>
      <Ionicons
        name={completed ? 'checkmark-circle' : unlocked ? 'sparkles' : 'lock-closed'}
        size={16}
        color={completed ? '#16a34a' : unlocked ? COLORS.primary : COLORS.textSecondary}
      />
    </View>
    <Ionicons
      name={icon}
      size={28}
      color={completed ? '#16a34a' : unlocked ? COLORS.primary : COLORS.textSecondary}
      style={{ marginTop: SPACING.md }}
    />
    <Text style={[styles.lockedTitle, completed ? { color: '#16a34a' } : !unlocked && { color: COLORS.textSecondary }]}>{title}</Text>
    <Text style={[styles.lockedSub, completed && { color: '#16a34a' }]}>
      {subtextOverride || (unlocked ? 'Tap to start' : 'Unlocks after Session')}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  headerIcons: { flexDirection: 'row' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.md },

  greeting: { ...TYPOGRAPHY.h1, color: COLORS.text, fontSize: 28 },
  welcome: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.lg },

  // Hero
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroCardApproved: { backgroundColor: COLORS.success },
  heroCardRejected: { backgroundColor: COLORS.error },
  heroTitle: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: 4 },
  heroSub: { ...TYPOGRAPHY.body, color: COLORS.white, opacity: 0.9, marginBottom: SPACING.md },
  heroSubLight: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.85,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  heroPillRow: { flexDirection: 'row', marginBottom: SPACING.sm },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  confirmedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  confirmedPillText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroActionsRow: { flexDirection: 'row', gap: SPACING.sm as any, flexWrap: 'wrap' },
  heroBtnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  heroBtnWhiteText: { ...TYPOGRAPHY.button, color: COLORS.primary, fontSize: 14, marginLeft: 6 },
  heroBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroBtnGhostText: { ...TYPOGRAPHY.button, color: COLORS.white, fontSize: 14 },
  heroNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.white, textAlign: 'center' },

  // Info strip
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoStripText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: 14,
  },

  // Steps
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'transparent',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 4,
  },
  stepRowActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { ...TYPOGRAPHY.bodyBold, color: COLORS.textSecondary, fontSize: 14 },
  stepTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
  stepTitleDim: { color: COLORS.textSecondary },
  stepSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },

  // Locked cards
  lockedRow: { flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.sm as any },
  lockedCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray + '60',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    minHeight: 130,
    marginHorizontal: 4,
    position: 'relative',
    opacity: 0.85,
  },
  lockedCardActive: {
    backgroundColor: COLORS.white,
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lockedCardCompleted: {
    backgroundColor: '#f0fdf4',
    opacity: 1,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
  },
  lockIconWrap: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginTop: SPACING.sm,
    fontSize: 15,
  },
  lockedSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Matches Ready Dashboard Styling
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7', // Tailwind green-100
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  successBannerText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: '#166534', // Tailwind green-800
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  sectionLabelDashboard: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dashboardMiniCard: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  dashboardMiniCardFull: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dashboardLabel: { ...TYPOGRAPHY.bodyBold, fontSize: 13, color: COLORS.textSecondary },
  dashboardVal: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.text, marginTop: 4, marginBottom: 8 },
  dashboardLineWrap: { width: '100%', height: 4, backgroundColor: COLORS.lightGray, borderRadius: 2 },
  dashboardLineCore: { height: '100%', backgroundColor: COLORS.primaryDark, borderRadius: 2 },
  
  matchesHero: {
    backgroundColor: '#472B52',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginTop: SPACING.md,
  },
  readyPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  readyPillText: { color: COLORS.white, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  matchesHeroTitle: { ...TYPOGRAPHY.h1, color: COLORS.white, fontSize: 32, lineHeight: 38 },
  matchesHeroSub: { ...TYPOGRAPHY.body, color: COLORS.lightGray, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  heroBtnWhiteMatches: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    width: 200,
  },
  heroBtnWhiteTextMatches: { ...TYPOGRAPHY.button, color: '#472B52', fontSize: 13 },
});
