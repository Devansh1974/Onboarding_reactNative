import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

const PILLAR_COLORS: Record<string, string> = {
  Lifestyle: '#E67E22',
  Communication: '#3498DB',
  Attachment: '#E74C3C',
  Conflict: '#9B59B6',
  Growth: '#27AE60',
};

export default function ProfileDetailScreen() {
  const params = useLocalSearchParams();
  const match = useMemo(() => {
    try {
      return JSON.parse(params.matchData as string);
    } catch {
      return null;
    }
  }, [params.matchData]);

  const [photoIndex, setPhotoIndex] = useState(0);

  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text>Profile not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: COLORS.primary, marginTop: 16 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos: string[] = match.photos || [];
  const age = getAge(match.birthday);
  const hasPhotos = photos.length > 0;

  const jobTitle = match.workDetails?.jobTitle || match.workDetails?.position || '';
  const company = match.workDetails?.company || '';
  const school = match.studyDetails?.school || '';
  const course = match.studyDetails?.course || '';
  const degree = match.studyDetails?.degree || '';

  const cyclePhoto = (dir: number) => {
    if (photos.length <= 1) return;
    setPhotoIndex((prev) => (prev + dir + photos.length) % photos.length);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          {hasPhotos ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photos[photoIndex] }} style={styles.profilePhoto} />
              {photos.length > 1 && (
                <>
                  <TouchableOpacity style={styles.photoNavL} onPress={() => cyclePhoto(-1)} />
                  <TouchableOpacity style={styles.photoNavR} onPress={() => cyclePhoto(1)} />
                </>
              )}
            </View>
          ) : (
            <View style={[styles.photoWrap, styles.noPhoto]}>
              <Ionicons name="person" size={80} color={COLORS.white} />
            </View>
          )}

          {/* Photo Dots */}
          {hasPhotos && photos.length > 1 && (
            <View style={styles.photoDots}>
              {photos.map((_, i) => (
                <View key={i} style={[styles.photoDot, i === photoIndex && styles.photoDotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Name & Basic Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{match.name}{age ? `, ${age}` : ''}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
            </View>
          </View>

          {(jobTitle || company) && (
            <Text style={styles.jobText}>
              {jobTitle}{jobTitle && company ? ' • ' : ''}{company}
            </Text>
          )}

          {match.location && (
            <View style={styles.locRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.locText}>{match.location}</Text>
            </View>
          )}
        </View>

        {/* Compatibility Score */}
        <View style={styles.compatSection}>
          <View style={styles.compatCircle}>
            <Text style={styles.compatPct}>{match.percentage}%</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.compatTitle}>Compatibility Score</Text>
            <Text style={styles.compatSub}>Based on your quiz answers</Text>
          </View>
        </View>

        {/* Pillar Breakdown */}
        {match.pillarScores && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>COMPATIBILITY BREAKDOWN</Text>
            {Object.entries(match.pillarScores).map(([pillar, data]: [string, any]) => (
              <View key={pillar} style={styles.pillarRow}>
                <Text style={styles.pillarName}>{data.displayName || pillar}</Text>
                <View style={styles.pillarBarBg}>
                  <View style={[styles.pillarBarFill, {
                    width: `${Math.min(data.percentage, 100)}%`,
                    backgroundColor: PILLAR_COLORS[pillar] || COLORS.primary,
                  }]} />
                </View>
                <Text style={styles.pillarPct}>{data.percentage}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* About / Story */}
        {match.story && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ABOUT</Text>
            <Text style={styles.storyText}>{match.story}</Text>
          </View>
        )}

        {/* Work & Education */}
        {(jobTitle || school || match.education) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WORK & EDUCATION</Text>
            {(jobTitle || company) && (
              <View style={styles.detailRow}>
                <Ionicons name="briefcase-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {jobTitle}{company ? ` at ${company}` : ''}
                </Text>
              </View>
            )}
            {school && (
              <View style={styles.detailRow}>
                <Ionicons name="school-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>
                  {school}{course ? ` • ${course}` : ''}{degree ? ` • ${degree}` : ''}
                </Text>
              </View>
            )}
            {match.education && (
              <View style={styles.detailRow}>
                <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} />
                <Text style={styles.detailText}>{match.education}</Text>
              </View>
            )}
          </View>
        )}

        {/* Curated Interests */}
        {match.interests && match.interests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>CURATED INTERESTS</Text>
            <View style={styles.chipRow}>
              {match.interests.map((interest: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Values & Vibes */}
        {(match.nonNegotiables?.length > 0 || match.offerings?.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>VALUES & VIBES</Text>
            {match.nonNegotiables?.length > 0 && (
              <>
                <Text style={styles.subLabel}>Non-negotiables</Text>
                <View style={styles.chipRow}>
                  {match.nonNegotiables.map((item: string, i: number) => (
                    <View key={i} style={[styles.chip, styles.chipAccent]}>
                      <Text style={[styles.chipText, { color: COLORS.primary }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
            {match.offerings?.length > 0 && (
              <>
                <Text style={[styles.subLabel, { marginTop: SPACING.md }]}>What they offer</Text>
                <View style={styles.chipRow}>
                  {match.offerings.map((item: string, i: number) => (
                    <View key={i} style={[styles.chip, styles.chipGreen]}>
                      <Text style={[styles.chipText, { color: '#27AE60' }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Lifestyle */}
        {match.lifestyle && (match.lifestyle.drink || match.lifestyle.smoke || match.lifestyle.exercise) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>LIFESTYLE</Text>
            <View style={styles.lifestyleRow}>
              {match.lifestyle.drink && (
                <View style={styles.lifestyleItem}>
                  <Ionicons name="wine-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.lifestyleLabel}>Drinks</Text>
                  <Text style={styles.lifestyleValue}>{match.lifestyle.drink}</Text>
                </View>
              )}
              {match.lifestyle.smoke && (
                <View style={styles.lifestyleItem}>
                  <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.lifestyleLabel}>Smokes</Text>
                  <Text style={styles.lifestyleValue}>{match.lifestyle.smoke}</Text>
                </View>
              )}
              {match.lifestyle.exercise && (
                <View style={styles.lifestyleItem}>
                  <Ionicons name="barbell-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.lifestyleLabel}>Exercise</Text>
                  <Text style={styles.lifestyleValue}>{match.lifestyle.exercise}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Match Reasons */}
        {match.reasons && match.reasons.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>WHY YOU MATCH</Text>
            {match.reasons.map((reason: string, i: number) => (
              <View key={i} style={styles.reasonRow}>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.bottomActionBtn} onPress={() => router.back()}>
          <View style={styles.bottomCircle}>
            <Ionicons name="close" size={24} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.bottomLabel}>NOT FOR ME</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomActionBtn} onPress={() => router.back()}>
          <View style={[styles.bottomCircle, { borderColor: COLORS.primaryLight }]}>
            <Ionicons name="heart" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.bottomLabel}>FAVORITE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getAge(birthday: string): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, fontSize: 18 },

  // Photo
  photoSection: { position: 'relative' },
  photoWrap: { width, height: width * 1.1 },
  profilePhoto: { width: '100%', height: '100%' },
  noPhoto: { backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  photoNavL: { position: 'absolute', left: 0, top: 0, width: '40%', height: '100%' },
  photoNavR: { position: 'absolute', right: 0, top: 0, width: '40%', height: '100%' },
  photoDots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center',
  },
  photoDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3,
  },
  photoDotActive: { backgroundColor: COLORS.white, width: 20 },

  // Info
  infoSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, backgroundColor: COLORS.white },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  profileName: { ...TYPOGRAPHY.h2, color: COLORS.text, fontSize: 26 },
  verifiedBadge: { marginLeft: SPACING.sm },
  jobText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 4, fontSize: 15 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: SPACING.md },
  locText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 4 },

  // Compat
  compatSection: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  compatCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center',
  },
  compatPct: { ...TYPOGRAPHY.bodyBold, color: COLORS.primary, fontSize: 16 },
  compatTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 15 },
  compatSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },

  // Card
  card: {
    backgroundColor: COLORS.white, marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg,
  },
  cardTitle: {
    ...TYPOGRAPHY.caption, color: COLORS.textSecondary,
    fontWeight: '700', letterSpacing: 1.2, fontSize: 11, marginBottom: SPACING.md,
  },

  // Pillar
  pillarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pillarName: { ...TYPOGRAPHY.caption, color: COLORS.text, width: 100, fontSize: 11 },
  pillarBarBg: {
    flex: 1, height: 6, backgroundColor: COLORS.lightGray + '60',
    borderRadius: 3, overflow: 'hidden', marginHorizontal: SPACING.sm,
  },
  pillarBarFill: { height: '100%', borderRadius: 3 },
  pillarPct: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.text, width: 32, textAlign: 'right', fontSize: 11 },

  // Story
  storyText: { ...TYPOGRAPHY.body, color: COLORS.text, lineHeight: 24, fontSize: 15 },

  // Detail
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  detailText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.sm, fontSize: 14, flex: 1 },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.cardBackground,
  },
  chipAccent: { backgroundColor: COLORS.primary + '10' },
  chipGreen: { backgroundColor: '#27AE6010' },
  chipText: { ...TYPOGRAPHY.caption, color: COLORS.text, fontWeight: '500', fontSize: 12 },
  subLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600', fontSize: 12, marginBottom: SPACING.sm },

  // Lifestyle
  lifestyleRow: { flexDirection: 'row', justifyContent: 'space-around' },
  lifestyleItem: { alignItems: 'center' },
  lifestyleLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 4, fontSize: 11 },
  lifestyleValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 13, marginTop: 2 },

  // Reasons
  reasonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  reasonText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.sm, fontSize: 14 },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row', justifyContent: 'center', gap: 50,
    paddingVertical: SPACING.md, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.lightGray + '40',
  },
  bottomActionBtn: { alignItems: 'center' },
  bottomCircle: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, borderColor: COLORS.lightGray,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white,
  },
  bottomLabel: {
    ...TYPOGRAPHY.caption, color: COLORS.textSecondary,
    fontWeight: '700', fontSize: 10, marginTop: 4, letterSpacing: 0.5,
  },
});
