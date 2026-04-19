import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const { width } = Dimensions.get('window');

// Pillar icons and colors
const PILLAR_META: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  Lifestyle:     { icon: 'bicycle',      color: '#E67E22' },
  Communication: { icon: 'chatbubbles',  color: '#3498DB' },
  Attachment:    { icon: 'heart',        color: '#E74C3C' },
  Conflict:      { icon: 'people',       color: '#9B59B6' },
  Growth:        { icon: 'leaf',         color: '#27AE60' },
};

interface PillarScore {
  percentage: number;
  earned: number;
  maxPossible: number;
  displayName: string;
}

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
  score: number;
  maxScore: number;
  percentage: number;
  pillarScores: Record<string, PillarScore>;
  reasons: string[];
}

export default function MatchesScreen() {
  const { data } = useOnboarding();
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnims = useRef<Animated.Value[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setError(null);
      const response = await fetch(`${BACKEND_URL}/api/matches/${data.phoneNumber}`);
      const result = await response.json();

      if (result.success) {
        setMatches(result.matches || []);
        // Setup animation values
        fadeAnims.current = (result.matches || []).map(() => new Animated.Value(0));
        // Stagger animate cards
        setTimeout(() => {
          const animations = fadeAnims.current.map((anim, i) =>
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              delay: i * 120,
              useNativeDriver: true,
            })
          );
          Animated.parallel(animations).start();
        }, 100);
      } else {
        setError(result.message || 'Failed to load matches');
      }
    } catch (e) {
      console.error('Error fetching matches:', e);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const getAge = (birthday: string) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    if (isNaN(birth.getTime())) return null;
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const getPercentageColor = (pct: number) => {
    if (pct >= 70) return '#27AE60';
    if (pct >= 45) return '#F39C12';
    return '#E74C3C';
  };

  // ─── Circular Progress Ring ───
  const ProgressRing = ({ percentage, size = 72 }: { percentage: number; size?: number }) => {
    const color = getPercentageColor(percentage);
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const filled = (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {/* Background ring */}
        <View style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: COLORS.lightGray + '60',
        }} />
        {/* Filled ring (approximated with border trick) */}
        <View style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: percentage >= 25 ? color : 'transparent',
          borderRightColor: percentage >= 50 ? color : 'transparent',
          borderBottomColor: percentage >= 75 ? color : 'transparent',
          borderLeftColor: percentage >= 100 ? color : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }} />
        {/* Percentage text */}
        <Text style={{ fontSize: 18, fontWeight: '800', color }}>{percentage}%</Text>
      </View>
    );
  };

  // ─── Pillar Bar ───
  const PillarBar = ({ pillar, data: pillarData }: { pillar: string; data: PillarScore }) => {
    const meta = PILLAR_META[pillar] || { icon: 'ellipse', color: COLORS.primary };
    return (
      <View style={styles.pillarRow}>
        <View style={styles.pillarIconWrap}>
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        <View style={styles.pillarBarWrap}>
          <View style={styles.pillarBarBg}>
            <View style={[styles.pillarBarFill, {
              width: `${Math.min(pillarData.percentage, 100)}%`,
              backgroundColor: meta.color,
            }]} />
          </View>
        </View>
        <Text style={styles.pillarPct}>{pillarData.percentage}%</Text>
      </View>
    );
  };

  // ─── Match Card ───
  const MatchCard = ({ match, index }: { match: MatchItem; index: number }) => {
    const age = getAge(match.birthday);
    const fadeAnim = fadeAnims.current[index] || new Animated.Value(1);

    return (
      <Animated.View style={[styles.matchCard, {
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        }],
      }]}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={COLORS.white} />
            </View>
            <View style={[styles.genderBadge, { backgroundColor: match.gender === 'female' ? '#FF6B9D' : '#5B9BD5' }]}>
              <Ionicons name={match.gender === 'female' ? 'female' : 'male'} size={10} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{match.name}{age ? `, ${age}` : ''}</Text>
            {match.location ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>{match.location}</Text>
              </View>
            ) : null}
            {match.education ? (
              <Text style={styles.educationText}>{match.education}</Text>
            ) : null}
          </View>

          <ProgressRing percentage={match.percentage} />
        </View>

        {/* Reasons Tags */}
        {match.reasons.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reasonsScroll}>
            {match.reasons.map((reason, i) => (
              <View key={i} style={styles.reasonTag}>
                <Ionicons name="sparkles" size={10} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Pillar Breakdown */}
        <View style={styles.pillarSection}>
          <Text style={styles.pillarSectionTitle}>COMPATIBILITY BREAKDOWN</Text>
          {Object.entries(match.pillarScores).map(([pillar, pData]) => (
            <PillarBar key={pillar} pillar={pillar} data={pData} />
          ))}
        </View>

        {/* Story snippet */}
        {match.story ? (
          <View style={styles.storyWrap}>
            <Text style={styles.storyLabel}>ABOUT</Text>
            <Text style={styles.storyText} numberOfLines={2}>{match.story}</Text>
          </View>
        ) : null}

        {/* Interests */}
        {match.interests && match.interests.length > 0 && (
          <View style={styles.interestsWrap}>
            {match.interests.slice(0, 5).map((interest, i) => (
              <View key={i} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            {match.interests.length > 5 && (
              <View style={styles.interestChip}>
                <Text style={styles.interestText}>+{match.interests.length - 5}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Matches</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding your best matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error State ───
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Matches</Text>
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="cloud-offline-outline" size={64} color={COLORS.lightGray} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchMatches(); }}>
            <Ionicons name="refresh" size={18} color={COLORS.white} />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Screen ───
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Matches</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{matches.length}</Text>
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
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="heart" size={24} color={COLORS.white} />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.heroTitle}>
              {matches.length > 0
                ? `We found ${matches.length} match${matches.length > 1 ? 'es' : ''} for you!`
                : 'No matches yet'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {matches.length > 0
                ? 'Based on your compatibility quiz answers'
                : 'Check back soon as more people join'}
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>No matches found</Text>
            <Text style={styles.emptySubtitle}>
              We're growing our community! More compatible profiles will appear here soon.
            </Text>
          </View>
        )}

        {/* Match Cards */}
        {matches.map((match, index) => (
          <MatchCard key={match.userId || match.phoneNumber} match={match} index={index} />
        ))}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + '40',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryDark,
    fontSize: 20,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  scrollContent: { padding: SPACING.lg, paddingTop: SPACING.md },

  // Center content (loading/error)
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  errorSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginTop: SPACING.xl,
  },
  retryBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontSize: 15,
  },

  // Hero Banner
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#472B52',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.white,
    fontSize: 16,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.lg,
    fontSize: 22,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 22,
  },

  // Match Card
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cardName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    fontSize: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 3,
  },
  educationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  // Reasons
  reasonsScroll: {
    marginBottom: SPACING.md,
  },
  reasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
  },
  reasonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 11,
  },

  // Pillar Section
  pillarSection: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  pillarSectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontSize: 10,
    marginBottom: SPACING.sm,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pillarIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  pillarBarWrap: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  pillarBarBg: {
    height: 6,
    backgroundColor: COLORS.lightGray + '60',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pillarBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  pillarPct: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text,
    width: 34,
    textAlign: 'right',
    fontSize: 11,
  },

  // Story
  storyWrap: {
    marginBottom: SPACING.md,
  },
  storyLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontSize: 10,
    marginBottom: 4,
  },
  storyText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Interests
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestChip: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
  },
  interestText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '500',
  },
});
