import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Dimensions, ActivityIndicator, ScrollView, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.25;
const MAX_DAILY = 5;

interface MatchItem {
  userId: string;
  phoneNumber: string;
  name: string;
  gender: string;
  location: string;
  birthday: string;
  education: string;
  story: string;
  interests: string[];
  photos: string[];
  workDetails: any;
  studyDetails: any;
  timeUsage: string;
  nonNegotiables: string[];
  offerings: string[];
  lifestyle: any;
  height: number | null;
  nativeState: string;
  score: number;
  maxScore: number;
  percentage: number;
  pillarScores: any;
  reasons: string[];
}

export default function MatchFeedScreen() {
  const { data } = useOnboarding();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allViewed, setAllViewed] = useState(false);
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    // Animate card entrance
    cardScale.setValue(0.95);
    cardOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    setCurrentPhotoIndex(0);
  }, [currentIndex]);

  const fetchMatches = async () => {
    try {
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/matches/${data.phoneNumber}`);
      const result = await response.json();
      if (result.success) {
        // Take only top 5 (or fewer)
        const top = (result.matches || []).slice(0, MAX_DAILY);
        setMatches(top);
        if (top.length === 0) setAllViewed(true);
      } else {
        setError(result.message || 'Failed to load matches');
      }
    } catch (e) {
      console.error(e);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birthday: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    if (isNaN(birth.getTime())) return null;
    return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const nextProfile = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAllViewed(true);
    }
  };

  const handleNotForMe = () => {
    nextProfile();
  };

  const handleFavorite = () => {
    nextProfile();
  };

  const handleRequestCall = () => {
    // Future feature — just show next for now
    nextProfile();
  };

  const openProfile = () => {
    if (!matches[currentIndex]) return;
    const match = matches[currentIndex];
    // Navigate to profile with match data serialized
    router.push({
      pathname: '/matches/profile',
      params: { matchData: JSON.stringify(match) },
    } as any);
  };

  const cyclePhoto = (dir: number) => {
    const match = matches[currentIndex];
    if (!match || !match.photos || match.photos.length <= 1) return;
    const len = match.photos.length;
    setCurrentPhotoIndex((prev) => (prev + dir + len) % len);
  };

  // ─── Loading ───
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your matches...</Text>
        </View>
        <BottomTabs />
      </SafeAreaView>
    );
  }

  // ─── Error ───
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchMatches(); }}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
        <BottomTabs />
      </SafeAreaView>
    );
  }

  // ─── Daily Limit ───
  if (allViewed) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />
        <View style={styles.center}>
          <Text style={{ fontSize: 60, marginBottom: SPACING.lg }}>🌙</Text>
          <Text style={styles.limitTitle}>That's all for today</Text>
          <Text style={styles.limitSubtitle}>
            {matches.length > 0
              ? `You've seen all ${matches.length} profile${matches.length > 1 ? 's' : ''} for today.\nCome back tomorrow for 5 fresh matches.`
              : 'No matches available yet.\nCheck back as more people join!'}
          </Text>

          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>NEXT REFRESH IN</Text>
            <Text style={styles.timerValue}>
              {getTimeUntilNoon()}
            </Text>
            <Text style={styles.timerSub}>🕐 Tomorrow at 12:00 PM</Text>
          </View>

          {matches.length > 0 && (
            <TouchableOpacity
              style={styles.viewLikedBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.viewLikedBtnText}>View Liked Profiles →</Text>
            </TouchableOpacity>
          )}
        </View>
        <BottomTabs />
      </SafeAreaView>
    );
  }

  // ─── Main Match Card ───
  const match = matches[currentIndex];
  const age = getAge(match.birthday);
  const photos = match.photos || [];
  const hasPhotos = photos.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header />

      <View style={styles.feedContent}>
        {/* Photo Dots */}
        {hasPhotos && photos.length > 1 && (
          <View style={styles.dotsRow}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentPhotoIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Match Card */}
        <Animated.View style={[styles.matchCard, {
          transform: [{ scale: cardScale }],
          opacity: cardOpacity,
        }]}>
          <TouchableOpacity activeOpacity={0.95} onPress={openProfile} style={{ flex: 1 }}>
            {/* Photo */}
            <View style={styles.photoWrap}>
              {hasPhotos ? (
                <Image source={{ uri: photos[currentPhotoIndex] }} style={styles.cardPhoto} />
              ) : (
                <View style={[styles.cardPhoto, styles.noPhoto]}>
                  <Ionicons name="person" size={80} color={COLORS.white} />
                </View>
              )}

              {/* Photo nav left/right zones */}
              {hasPhotos && photos.length > 1 && (
                <>
                  <TouchableOpacity style={styles.photoNavLeft} onPress={() => cyclePhoto(-1)} />
                  <TouchableOpacity style={styles.photoNavRight} onPress={() => cyclePhoto(1)} />
                </>
              )}

              {/* Compatibility badge */}
              <View style={styles.compatBadge}>
                <Text style={styles.compatBadgeText}>{match.percentage}% Compatible</Text>
              </View>

              {/* Name overlay */}
              <View style={styles.nameOverlay}>
                <Text style={styles.nameText}>
                  {match.name}{age ? `, ${age}` : ''}
                </Text>
                {match.location ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.locationText}>{match.location}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleNotForMe}>
            <View style={styles.actionCircle}>
              <Ionicons name="close" size={28} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.actionLabel}>NOT FOR ME</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
            <View style={[styles.actionCircle, styles.actionCircleFav]}>
              <Ionicons name="heart" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>FAVORITE</Text>
          </TouchableOpacity>
        </View>

        {/* Request a Call */}
        <TouchableOpacity style={styles.callBtn} onPress={handleRequestCall}>
          <Text style={styles.callBtnText}>Request a Call</Text>
        </TouchableOpacity>

        {/* Info text */}
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoLine}>NOT FOR ME = REFRESHES IN 24H</Text>
          <Text style={styles.infoLine}>FAVORITE = STAYS UNTIL UNFAVORED</Text>
          <Text style={[styles.infoLine, styles.infoBold]}>
            THESE PROFILES WILL REFRESH AT 12:00 NOON IF{'\n'}NO ACTION IS TAKEN.
          </Text>
        </View>
      </View>

      <BottomTabs />
    </SafeAreaView>
  );
}

// ─── Sub Components ───

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>lll</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="heart-outline" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BottomTabs() {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/home' as any)}>
        <Ionicons name="home-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.tabLabel}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/dates' as any)}>
        <Ionicons name="calendar-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.tabLabel}>Dates</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, styles.tabCenter]}>
        <View style={styles.tabCenterCircle}>
          <Ionicons name="sync" size={26} color={COLORS.white} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/requests' as any)}>
        <Ionicons name="mail-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.tabLabel}>Requests</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => router.push('/profile' as any)}>
        <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} />
        <Text style={styles.tabLabel}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

function getTimeUntilNoon(): string {
  const now = new Date();
  const noon = new Date(now);
  noon.setHours(12, 0, 0, 0);
  if (now >= noon) noon.setDate(noon.getDate() + 1);
  const diff = noon.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40',
  },
  logo: {
    fontSize: 26, fontWeight: '800', color: COLORS.primaryDark,
    fontStyle: 'italic', letterSpacing: -1,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: { marginLeft: SPACING.md, padding: 4 },

  // Center states
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xxl },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.lg },
  errorText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center' },
  retryBtn: {
    marginTop: SPACING.lg, backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.round,
  },
  retryBtnText: { ...TYPOGRAPHY.button, color: COLORS.white },

  // Daily limit
  limitTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center', fontSize: 28 },
  limitSubtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 },
  timerCard: {
    backgroundColor: COLORS.primaryDark, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl, alignItems: 'center', marginTop: SPACING.xl, width: '80%',
  },
  timerLabel: { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 },
  timerValue: { fontSize: 36, fontWeight: '800', color: COLORS.white, marginVertical: SPACING.sm },
  timerSub: { ...TYPOGRAPHY.caption, color: '#F39C12', fontWeight: '600' },
  viewLikedBtn: {
    marginTop: SPACING.xl, backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.round,
  },
  viewLikedBtnText: { ...TYPOGRAPHY.button, color: COLORS.white, fontSize: 15 },

  // Feed
  feedContent: { flex: 1, alignItems: 'center', paddingTop: SPACING.sm },

  // Dots
  dotsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  dot: {
    width: 24, height: 5, borderRadius: 3,
    backgroundColor: COLORS.lightGray, marginHorizontal: 2,
  },
  dotActive: { backgroundColor: COLORS.primaryDark, width: 30 },

  // Match Card
  matchCard: {
    width: CARD_WIDTH, height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl, overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  photoWrap: { flex: 1, position: 'relative' },
  cardPhoto: { width: '100%', height: '100%', borderRadius: BORDER_RADIUS.xl },
  noPhoto: {
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  photoNavLeft: { position: 'absolute', left: 0, top: 0, width: '40%', height: '100%' },
  photoNavRight: { position: 'absolute', right: 0, top: 0, width: '40%', height: '100%' },
  compatBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.round,
  },
  compatBadgeText: { ...TYPOGRAPHY.caption, color: COLORS.primaryDark, fontWeight: '700', fontSize: 12 },
  nameOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, paddingTop: SPACING.xxl,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  nameText: { ...TYPOGRAPHY.h2, color: COLORS.white, fontSize: 24 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { ...TYPOGRAPHY.caption, color: 'rgba(255,255,255,0.85)', marginLeft: 4 },

  // Actions
  actionsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: SPACING.lg,
    gap: 40,
  },
  actionBtn: { alignItems: 'center' },
  actionCircle: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2, borderColor: COLORS.lightGray,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  actionCircleFav: { borderColor: COLORS.primaryLight },
  actionLabel: {
    ...TYPOGRAPHY.caption, color: COLORS.textSecondary,
    fontWeight: '700', fontSize: 10, marginTop: 6, letterSpacing: 0.5,
  },

  // Call button
  callBtn: {
    backgroundColor: COLORS.primaryDark, borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    marginTop: SPACING.md, width: CARD_WIDTH * 0.75, alignItems: 'center',
  },
  callBtnText: { ...TYPOGRAPHY.button, color: COLORS.white, fontSize: 16 },

  // Info text
  infoTextWrap: { marginTop: SPACING.md, alignItems: 'center', paddingHorizontal: SPACING.lg },
  infoLine: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 10, textAlign: 'center', lineHeight: 16 },
  infoBold: { fontWeight: '700', color: COLORS.primaryDark, marginTop: 4 },

  // Bottom Tabs
  tabBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: SPACING.sm, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.lightGray + '40',
  },
  tab: { alignItems: 'center', flex: 1 },
  tabCenter: { marginTop: -20 },
  tabCenterCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
  },
  tabLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
});
