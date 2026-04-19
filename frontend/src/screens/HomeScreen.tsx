import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, RefreshControl, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import BottomTabBar from '../components/BottomTabBar';

const { width } = Dimensions.get('window');
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function HomeScreen() {
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Session & Auth state
  const [session, setSession] = useState<any>(null);
  const [status, setStatus] = useState<string>('not_scheduled');
  const [reviewStatus, setReviewStatus] = useState<string>('pending');
  const [userProfile, setUserProfile] = useState<any>(null);

  const fetchHomeData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      if (!data.phoneNumber) return;
      
      const [uRes, sRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/users/${data.phoneNumber}`),
        fetch(`${BACKEND_URL}/api/sessions/user/${data.phoneNumber}`)
      ]);
      const uData = await uRes.json();
      const sData = await sRes.json();

      if (uData.success && uData.user) {
        setUserProfile(uData.user);
        // Sync context locally so Footer instantly knows
        updateData(uData.user);
      }
      if (sData.success && sData.session) {
        setSession(sData.session);
        setStatus(sData.session.sessionStatus);
        setReviewStatus(sData.session.reviewStatus);
      } else {
        setSession(null);
        setStatus('not_scheduled');
      }
    } catch (e) {
      console.error('Fetch Home error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const greeting = "Good Evening"; // Can be dynamic based on time
  const firstName = userProfile?.name?.split(' ')[0] || data.name?.split(' ')[0] || 'User';

  const isApproved = reviewStatus === 'approved';
  const isUnderReview = status === 'completed' && reviewStatus === 'pending';
  
  const quiz = userProfile?.compatibilityQuiz || {};
  const totalQuizAnswers = 
    Object.keys(quiz.lifestyleAndValues || {}).length +
    Object.keys(quiz.emotionalCommunication || {}).length +
    Object.keys(quiz.attachmentAndComfort || {}).length +
    Object.keys(quiz.conflictAndRepair || {}).length +
    Object.keys(quiz.growthAndReadiness || {}).length;

  const quizCompletionPercentage = Math.round((totalQuizAnswers / 25) * 100);

  const isQuizCompleted = 
    totalQuizAnswers === 25 || 
    (quiz.growthAndReadiness?.q5);

  const curateVibeCompleted = !!userProfile?.vibeCompleted;
  const matchesUnlocked = isApproved && isQuizCompleted && curateVibeCompleted;

  const getDaysUntil = (dateStr: string) => {
    const sessionDate = new Date(dateStr);
    return Math.ceil((sessionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  // --- Step active checks ---
  const isStep1Active = reviewStatus !== 'approved' && reviewStatus !== 'rejected';
  const isStep2Active = isApproved && !isQuizCompleted;
  const isStep3Active = isApproved && isQuizCompleted && !curateVibeCompleted;

  // Render Rejected Screen (replaces standard timeline)
  if (reviewStatus === 'rejected') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.logo}>lll</Text>
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconBtn}><Ionicons name="heart-outline" size={24} color={COLORS.primaryDark} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/inbox' as any)}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.greetingText}>{greeting}, {firstName}.</Text>
          <Text style={styles.subGreeting}>Welcome to Wingmann ✨</Text>
          <View style={styles.errorBanner}>
            <Ionicons name="mail-outline" size={20} color="#DC2626" />
            <Text style={styles.errorBannerText}>Check your email for details on why this happened</Text>
          </View>
          <View style={styles.rejectedWrap}>
            <View style={styles.rejectedIconBgd}><Ionicons name="sad-outline" size={40} color={COLORS.primaryDark} /></View>
            <Text style={styles.rejectedTitle}>Profile Not Accepted</Text>
            <Text style={styles.rejectedBody}>At The Wingmann, we maintain a highly curated community to ensure the best possible experience for our members. After a careful review of your profile and recent interview notes, we are unable to proceed with your membership at this time.</Text>
            
            <View style={styles.infoBoxGray}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.infoBoxGrayText}>While our decisions are typically final, we value transparency. You may use the dedicated query section below to request clarification or provide additional context.</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert('Report a Query', 'Opening support query form...')}>
              <Ionicons name="refresh" size={18} color={COLORS.white} />
              <Text style={styles.primaryBtnText}>Report a Query</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostBtn} onPress={() => router.push('/delete-account')}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
              <Text style={[styles.ghostBtnText, { color: '#DC2626' }]}>Delete My Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <BottomTabBar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>lll</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/matches/favorites' as any)}>
            <Ionicons name="heart-outline" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/inbox' as any)}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHomeData(); }} />}
      >
        <Text style={styles.greetingText}>{greeting}, {firstName}.</Text>
        <Text style={styles.subGreeting}>Welcome to Wingmann ✨</Text>

        {isApproved && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text style={styles.successBannerText}>Profile Verified! You now have full access.</Text>
          </View>
        )}

        {matchesUnlocked ? (
          // --- FULLY UNLOCKED DASHBOARD ---
          <View style={styles.matchesReadyContainer}>
            <Text style={styles.sectionLabelDashboard}>YOUR DASHBOARD</Text>
            <View style={styles.dashboardGrid}>
              <View style={[styles.dashboardMiniCard, { paddingHorizontal: 4 }]}>
                <Text style={styles.dashboardLabel}>Profile</Text>
                <Text style={styles.dashboardVal} numberOfLines={1} adjustsFontSizeToFit>100%</Text>
              </View>
              <View style={[styles.dashboardMiniCard, { paddingHorizontal: 4 }]}>
                <Text style={styles.dashboardLabel}>Quiz</Text>
                <Text style={styles.dashboardVal} numberOfLines={1} adjustsFontSizeToFit>100%</Text>
              </View>
              <View style={[styles.dashboardMiniCard, { paddingHorizontal: 4 }]}>
                <Text style={styles.dashboardLabel}>Vibe</Text>
                <Text style={styles.dashboardVal} numberOfLines={1} adjustsFontSizeToFit>100%</Text>
              </View>
            </View>

            <View style={styles.matchesHeroCard}>
              <View style={styles.readyPill}><Text style={styles.readyPillText}>✨ READY</Text></View>
              <Text style={styles.matchesHeroTitle}>Meet Your{'\n'}Matches</Text>
              <Text style={styles.matchesHeroSub}>5 profiles curated just for you today</Text>
              <TouchableOpacity style={styles.matchesHeroAction} onPress={() => router.push('/matches' as any)}>
                <Text style={styles.matchesHeroActionText}>See My Matches →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // --- JOURNEY TIMELINE ---
          <View style={styles.timelineContainer}>
            <View style={styles.timelineHeaderRow}>
              <Text style={styles.timelineTitle}>Your Journey to Matches</Text>
              <View style={styles.stepPillLabel}><Text style={styles.stepPillLabelText}>STEP {isStep1Active ? '1' : isStep2Active ? '2' : '3'} OF 3</Text></View>
            </View>
            
            {/* Timeline Progress Graph */}
            <View style={styles.progressGraphRow}>
              <View style={styles.graphNodeWrapper}>
                <View style={[styles.graphNode, {backgroundColor: COLORS.primaryDark}]}>
                  <Ionicons name="person" size={16} color={COLORS.white} />
                </View>
                <Text style={styles.graphNodeLabel}>KNOW YOURSELF</Text>
              </View>
              <View style={styles.graphLine}><View style={[styles.graphLineFill, {width: !isStep1Active ? '100%' : '0%'}]} /></View>
              <View style={styles.graphNodeWrapper}>
                 <View style={[styles.graphNode, (!isStep1Active) ? {backgroundColor: COLORS.primaryDark} : {backgroundColor: COLORS.placeholder}]}>
                  <Ionicons name="people" size={16} color={COLORS.white} />
                </View>
                <Text style={[styles.graphNodeLabel, isStep1Active && {color: COLORS.placeholder}]}>COMPATIBILITY</Text>
              </View>
              <View style={styles.graphLine}><View style={[styles.graphLineFill, {width: (!isStep1Active && !isStep2Active) ? '100%' : '0%'}]} /></View>
              <View style={styles.graphNodeWrapper}>
                <View style={[styles.graphNode, (!isStep1Active && !isStep2Active) ? {backgroundColor: COLORS.primaryDark} : {backgroundColor: COLORS.placeholder}]}>
                  <Ionicons name="sparkles" size={16} color={COLORS.white} />
                </View>
                <Text style={[styles.graphNodeLabel, (isStep1Active || isStep2Active) && {color: COLORS.placeholder}]}>VIBE</Text>
              </View>
            </View>

            {/* ERROR BANNER FOR MISSED SESSION */}
            {status === 'missed' && isStep1Active && (
              <View style={styles.missedBanner}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.missedBannerText}>You missed your session. Please reschedule.</Text>
                </View>
              </View>
            )}

            {/* ====== STEP 1 CARD ====== */}
            {isStep1Active ? (
              <View style={[styles.activeCard, { marginTop: SPACING.lg }]}>
                <View style={styles.activePill}><Text style={styles.activePillText}>ACTIVE STEP</Text></View>
                <Text style={styles.activedBigNumber}>01</Text>
                
                {status === 'not_scheduled' ? (
                  <>
                    <Text style={styles.activeTitle}>Book Your Intro Session</Text>
                    <Text style={styles.activeBody}>A quick 30-min call to verify and understand your relationship goals.</Text>
                    <TouchableOpacity style={styles.activePrimaryBtn} onPress={() => router.push('/schedule-intro')}>
                      <Text style={styles.activePrimaryBtnText}>Book Session 📅</Text>
                    </TouchableOpacity>
                    <Text style={styles.activeTakesText}>TAKES 30 MINUTES</Text>
                    <View style={styles.benefitsList}>
                      <Text style={styles.benefitItem}>✓ Verified profiles only</Text>
                      <Text style={styles.benefitItem}>✓ Safe & curated experience</Text>
                      <Text style={styles.benefitItem}>✓ No random swiping</Text>
                    </View>
                  </>
                ) : status === 'scheduled' || status === 'rescheduled' ? (
                  <>
                    <Text style={styles.activeTitle}>Your session is coming up.</Text>
                    <View style={styles.sessionBox}>
                       <View style={styles.sessionBoxIcon}><Ionicons name="videocam" size={20} color={COLORS.white} /></View>
                       <View style={styles.sessionUpcomingPill}><Text style={styles.sessionUpcomingPillText}>UPCOMING</Text></View>
                       <Text style={styles.sessionDateHuge}>{new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                       <Text style={styles.sessionTimeMedium}>{session.scheduledTime} • Online Session</Text>
                       <TouchableOpacity style={styles.googleMeetBtn} onPress={() => session.meetingLink && Linking.openURL(session.meetingLink)}>
                         <Ionicons name="link" size={16} color={COLORS.primaryDark} />
                         <Text style={styles.googleMeetBtnText}>meet.google.com...</Text>
                         <Text style={styles.googleMeetBtnOpen}>Open ↗</Text>
                       </TouchableOpacity>
                    </View>
                    <View style={styles.countdownRow}>
                      <View style={styles.cdBox}><Text style={styles.cdNum}>0{getDaysUntil(session.scheduledDate)}</Text><Text style={styles.cdLabel}>DAYS</Text></View>
                      <View style={styles.cdBox}><Text style={styles.cdNum}>14</Text><Text style={styles.cdLabel}>HOURS</Text></View>
                      <View style={styles.cdBox}><Text style={styles.cdNum}>45</Text><Text style={styles.cdLabel}>MINS</Text></View>
                    </View>
                    <TouchableOpacity style={styles.activePrimaryBtn} onPress={() => router.push('/reschedule-reason')}>
                      <Text style={styles.activePrimaryBtnText}>Reschedule 📅</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: SPACING.md }}>
                      <Text style={{ color: '#DC2626', textAlign: 'center', ...TYPOGRAPHY.bodyBold }}>Cancel Session</Text>
                    </TouchableOpacity>
                  </>
                ) : status === 'missed' ? (
                  <>
                    <Text style={[styles.activeTitle, { fontSize: 28 }]}>Reschedule Your Know Yourself Session</Text>
                    <Text style={styles.activeBody}>Don't lose your progress. Take the next step in your intentional dating journey.</Text>
                    <TouchableOpacity style={[styles.activePrimaryBtn, { marginTop: SPACING.lg }]} onPress={() => router.push('/reschedule-reason')}>
                      <Text style={styles.activePrimaryBtnText}>Reschedule Now →</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginTop: SPACING.md }}>
                      <Text style={{ color: '#DC2626', textAlign: 'center', ...TYPOGRAPHY.bodyBold }}>Cancel Session</Text>
                    </TouchableOpacity>
                  </>
                ) : isUnderReview ? (
                  <>
                    <Text style={styles.activeTitle}>Session Complete!</Text>
                    <Text style={styles.activeBody}>Your profile is under 24hr review</Text>
                    <View style={styles.reviewBox}>
                       <Text style={styles.reviewBoxLabel}>SESSION DATE</Text>
                       <View style={styles.reviewContentRow}>
                         <Text style={styles.reviewBoxVal}>{new Date(session.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                         <Ionicons name="calendar" size={24} color={COLORS.white} />
                       </View>
                    </View>
                    <View style={styles.reviewBox}>
                       <Text style={styles.reviewBoxLabel}>REVIEW ETA</Text>
                       <View style={styles.reviewContentRow}>
                         <Text style={styles.reviewBoxVal}>{new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                         <Ionicons name="time" size={24} color={COLORS.white} />
                       </View>
                    </View>
                    <View style={styles.reviewDisclaimer}>
                      <Ionicons name="information-circle" size={16} color={COLORS.primaryDark} />
                      <Text style={styles.reviewDisclaimerText}>We'll notify you by email and push notification</Text>
                    </View>
                  </>
                ) : null}
              </View>
            ) : (
              <View style={styles.completedCard}>
                 <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryDark} />
                 <Text style={styles.completedCardText}>Know Yourself Session Completed</Text>
                 <Ionicons name="chevron-down" size={20} color={COLORS.lightGray} style={{ marginLeft: 'auto' }} />
              </View>
            )}

            {/* ====== STEP 2 CARD ====== */}
            {isStep2Active ? (
              <View style={[styles.activeCard, { marginTop: SPACING.md }]}>
                <View style={styles.activePill}><Text style={styles.activePillText}>ACTIVE STEP</Text></View>
                <Text style={styles.activedBigNumber}>02</Text>
                
                <Text style={styles.activeTitle}>Compatibility Quiz</Text>
                <Text style={styles.activeBody}>Answer a few thoughtful questions to help us understand how you think, what you value, and what truly works for you in a relationship.</Text>
                
                {totalQuizAnswers > 0 ? (
                  <>
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressQs}>{totalQuizAnswers} / 25 QUESTIONS COMPLETED</Text>
                      <Text style={styles.progressPct}>{quizCompletionPercentage}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}><View style={[styles.progressBarFill, { width: `${quizCompletionPercentage}%` }]} /></View>
                    <TouchableOpacity style={[styles.activePrimaryBtn, { marginTop: SPACING.md }]} onPress={() => router.push('/compatibility-quiz')}>
                      <Text style={styles.activePrimaryBtnText}>Resume Quiz →</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={[styles.activePrimaryBtn, { marginTop: SPACING.xl }]} onPress={() => router.push('/compatibility-quiz')}>
                    <Text style={styles.activePrimaryBtnText}>Start Quiz →</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (!isStep1Active && isQuizCompleted) ? (
              <View style={[styles.completedCard, { marginTop: SPACING.md }]}>
                 <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryDark} />
                 <Text style={styles.completedCardText}>Compatibility Quiz Completed</Text>
                 <Ionicons name="chevron-down" size={20} color={COLORS.lightGray} style={{ marginLeft: 'auto' }} />
              </View>
            ) : (
              <View style={[styles.lockedCard, { marginTop: SPACING.md }]}>
                <Text style={styles.lockedCardSub}>STEP 2: COMPATIBILITY QUIZ</Text>
                <Text style={styles.lockedCardTitle}>Discover Your{'\n'}Compatibility Profile</Text>
                <Text style={styles.lockedCardBody}>We match you based on how you think, not just what you like.</Text>
                <Ionicons name="lock-closed" size={20} color={COLORS.placeholder} style={styles.lockedIconAbsolute} />
              </View>
            )}

            {/* ====== STEP 3 CARD ====== */}
            {isStep3Active ? (
              <View style={[styles.activeCard, { marginTop: SPACING.md }]}>
                <View style={styles.activePill}><Text style={styles.activePillText}>ACTIVE STEP</Text></View>
                <Text style={styles.activedBigNumber}>03</Text>
                
                <Text style={styles.activeTitle}>Curate Your Vibe</Text>
                <Text style={styles.activeBody}>Select the faces you naturally feel drawn to. This helps us understand your attraction patterns and personalise your matches.</Text>
                
                <TouchableOpacity style={[styles.activePrimaryBtn, { marginTop: SPACING.xl }]} onPress={() => router.push('/curate-vibe' as any)}>
                  <Text style={styles.activePrimaryBtnText}>Start Selection →</Text>
                </TouchableOpacity>
              </View>
            ) : (!isStep1Active && !isStep2Active && curateVibeCompleted) ? (
              <View style={[styles.completedCard, { marginTop: SPACING.md }]}>
                 <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryDark} />
                 <Text style={styles.completedCardText}>Vibe Curated</Text>
              </View>
            ) : (
              <View style={[styles.lockedCard, { marginTop: SPACING.md }]}>
                <Text style={styles.lockedCardSub}>STEP 3: CURATE YOUR VIBE</Text>
                <Text style={styles.lockedCardTitle}>Personalize your matching algorithm</Text>
                {/* <Text style={styles.lockedCardBody}>Discover who you're naturally drawn to.</Text> */}
                <Ionicons name="lock-closed" size={20} color={COLORS.placeholder} style={styles.lockedIconAbsolute} />
              </View>
            )}

          </View>
        )}
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, padding: SPACING.lg },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  logo: { fontSize: 24, fontWeight: '800', color: COLORS.primaryDark, letterSpacing: -1 },
  topIcons: { flexDirection: 'row', gap: 16 },
  iconBtn: { padding: 4 },
  greetingText: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, marginTop: SPACING.md },
  subGreeting: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },

  // Reject / Error
  errorBanner: { flexDirection: 'row', backgroundColor: '#FEE2E2', padding: SPACING.md, borderRadius: 8, alignItems: 'center', marginBottom: SPACING.lg },
  errorBannerText: { ...TYPOGRAPHY.body, color: '#DC2626', marginLeft: 8, flex: 1 },
  rejectedWrap: { alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl },
  rejectedIconBgd: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  rejectedTitle: { ...TYPOGRAPHY.h2, color: COLORS.primaryDark, marginBottom: SPACING.sm },
  rejectedBody: { ...TYPOGRAPHY.body, color: COLORS.text, textAlign: 'center', lineHeight: 22 },
  infoBoxGray: { flexDirection: 'row', backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: 8, marginVertical: SPACING.lg },
  infoBoxGrayText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 8, flex: 1, lineHeight: 18 },
  primaryBtn: { backgroundColor: COLORS.primaryDark, width: '100%', height: 50, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  primaryBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, marginLeft: 8 },
  ghostBtn: { height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { ...TYPOGRAPHY.bodyBold },

  // Timeline Graph
  timelineContainer: { marginTop: SPACING.sm },
  timelineHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  timelineTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark, fontSize: 16 },
  stepPillLabel: { backgroundColor: '#E0D4ED', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  stepPillLabelText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark, letterSpacing: 1 },
  progressGraphRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, marginBottom: 8 },
  graphNodeWrapper: { alignItems: 'center', width: 60 },
  graphNode: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  graphNodeLabel: { fontSize: 8, fontWeight: '700', marginTop: 4, color: COLORS.text, letterSpacing: 0.5 },
  graphLine: { flex: 1, height: 2, backgroundColor: COLORS.placeholder, marginHorizontal: -10, marginTop: -14 },
  graphLineFill: { height: '100%', backgroundColor: COLORS.primaryDark },
  missedBanner: { flexDirection: 'row', backgroundColor: '#FEE2E2', padding: SPACING.md, borderRadius: 8, marginTop: SPACING.md },
  missedBannerText: { color: '#DC2626', fontWeight: '500' },

  // Active Card (Purple)
  activeCard: { backgroundColor: COLORS.primaryDark, borderRadius: 24, padding: SPACING.xl },
  activePill: { alignSelf: 'flex-start', backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: SPACING.md },
  activePillText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark, letterSpacing: 1 },
  activedBigNumber: { position: 'absolute', top: 20, right: 20, fontSize: 64, fontWeight: '800', color: COLORS.white, opacity: 0.1 },
  activeTitle: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: SPACING.sm },
  activeBody: { ...TYPOGRAPHY.body, color: COLORS.lightGray, lineHeight: 22, marginBottom: SPACING.lg },
  activePrimaryBtn: { backgroundColor: COLORS.white, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  activePrimaryBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark },
  activeTakesText: { textAlign: 'center', fontSize: 10, fontWeight: '700', color: COLORS.lightGray, marginTop: SPACING.md, letterSpacing: 1 },
  benefitsList: { marginTop: SPACING.lg },
  benefitItem: { color: COLORS.lightGray, fontSize: 13, marginBottom: 4 },

  sessionBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg },
  sessionBoxIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  sessionUpcomingPill: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sessionUpcomingPillText: { fontSize: 10, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  sessionDateHuge: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: 4 },
  sessionTimeMedium: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.md },
  googleMeetBtn: { flexDirection: 'row', backgroundColor: COLORS.white, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center' },
  googleMeetBtnText: { ...TYPOGRAPHY.caption, fontWeight: '600', color: COLORS.primaryDark, marginLeft: 6, flex: 1 },
  googleMeetBtnOpen: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.primaryDark },

  countdownRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: SPACING.lg },
  cdBox: { backgroundColor: COLORS.white, borderRadius: 30, width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  cdNum: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
  cdLabel: { fontSize: 8, fontWeight: '700', color: COLORS.primaryDark, letterSpacing: 1 },

  reviewBox: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingVertical: SPACING.md },
  reviewBoxLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  reviewContentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewBoxVal: { ...TYPOGRAPHY.h4, color: COLORS.white },
  reviewDisclaimer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.8)', padding: SPACING.sm, borderRadius: 8, alignItems: 'center', marginTop: SPACING.lg },
  reviewDisclaimerText: { fontSize: 12, color: COLORS.primaryDark, marginLeft: 6, fontWeight: '500' },

  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressQs: { fontSize: 10, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 1 },
  progressPct: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  progressBarTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 3 },

  completedCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  completedCardText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark, marginLeft: SPACING.sm },

  lockedCard: { backgroundColor: COLORS.white, borderStyle: 'dotted', borderWidth: 2, borderColor: COLORS.placeholder, borderRadius: 24, padding: SPACING.xl },
  lockedCardSub: { fontSize: 10, fontWeight: '700', color: COLORS.lightGray, letterSpacing: 1, marginBottom: SPACING.sm },
  lockedCardTitle: { ...TYPOGRAPHY.h3, color: COLORS.lightGray, marginBottom: SPACING.sm },
  lockedCardBody: { ...TYPOGRAPHY.body, color: COLORS.placeholder, lineHeight: 20 },
  lockedIconAbsolute: { position: 'absolute', right: 20, top: 20 },

  // Post-Unlock Success
  successBanner: { flexDirection: 'row', backgroundColor: '#DCFCE7', padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center', marginBottom: SPACING.xl },
  successBannerText: { ...TYPOGRAPHY.bodyBold, color: '#166534', marginLeft: 8 },
  matchesReadyContainer: { marginTop: SPACING.sm },
  sectionLabelDashboard: { ...TYPOGRAPHY.caption, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginBottom: SPACING.sm },
  dashboardGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl },
  dashboardMiniCard: { flex: 1, backgroundColor: COLORS.white, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  dashboardLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 4 },
  dashboardVal: { fontSize: 18, fontWeight: '700', color: COLORS.primaryDark },
  matchesHeroCard: { backgroundColor: COLORS.primaryDark, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  readyPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: SPACING.md },
  readyPillText: { fontSize: 10, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  matchesHeroTitle: { ...TYPOGRAPHY.h1, color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  matchesHeroSub: { ...TYPOGRAPHY.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: SPACING.xl },
  matchesHeroAction: { backgroundColor: COLORS.white, width: '100%', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  matchesHeroActionText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark },
});
