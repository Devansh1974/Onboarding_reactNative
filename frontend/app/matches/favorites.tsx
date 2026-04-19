import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function FavoritesScreen() {
  const { data } = useOnboarding();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${data.phoneNumber}/favorites`);
      const resData = await res.json();
      if (resData.success) {
        setFavorites(resData.favorites || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAge = (birthday?: string) => {
    if (!birthday) return null;
    const past = new Date(birthday);
    const ageDifMs = Date.now() - past.getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.filler} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="heart-dislike-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySub}>When you favorite a profile from your matches, they will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {favorites.map((fav, i) => {
            const age = getAge(fav.birthday);
            const photo = fav.photos && fav.photos[0] ? fav.photos[0] : null;

            return (
              <TouchableOpacity key={i} style={styles.favCard} activeOpacity={0.9}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, { backgroundColor: COLORS.placeholder, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person" size={40} color={COLORS.white} />
                  </View>
                )}
                
                <View style={styles.infoCol}>
                  <Text style={styles.name}>{fav.name}{age ? `, ${age}` : ''}</Text>
                  {fav.location && (
                    <View style={styles.row}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.subtext}>{fav.location}</Text>
                    </View>
                  )}
                  {fav.percentage && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{fav.percentage}% Compatible</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.heartBtn}>
                  <Ionicons name="heart" size={24} color={COLORS.primary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  filler: { width: 40 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyTitle: { ...TYPOGRAPHY.h4, marginTop: SPACING.md, color: COLORS.text },
  emptySub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  scroll: { padding: SPACING.md },
  
  favCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  photo: {
    width: 70, height: 70, borderRadius: BORDER_RADIUS.sm, marginRight: SPACING.md,
  },
  infoCol: { flex: 1, justifyContent: 'center' },
  name: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  subtext: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 4 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  badgeText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '600' },
  heartBtn: { padding: SPACING.sm, opacity: 0.8 },
});
