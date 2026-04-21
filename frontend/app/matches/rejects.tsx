import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function RejectsScreen() {
  const { data } = useOnboarding();
  const [rejects, setRejects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejects();
  }, []);

  const fetchRejects = async () => {
    try {
      if (!data?.phoneNumber) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${BACKEND_URL}/api/users/${encodeURIComponent(data.phoneNumber)}/rejects`);
      
      if (!res.ok) {
        console.error('Fetch failed with status:', res.status);
        setLoading(false);
        return;
      }

      const resData = await res.json();
      if (resData.success) {
        setRejects(resData.rejects || []);
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
        <Text style={styles.headerTitle}>Blacklisted Users</Text>
        <View style={styles.filler} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : rejects.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="ban-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyTitle}>Your Blacklist is Empty</Text>
          <Text style={styles.emptySub}>Users you reject from your matches will appear here anonymously.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.warningBox}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.warningText}>Profiles listed here will never be shown to you again in matches.</Text>
          </View>
          
          {rejects.map((rej, i) => {
            const age = getAge(rej.birthday);
            const photo = rej.photos && rej.photos[0] ? rej.photos[0] : null;

            return (
              <View key={i} style={styles.rejCard}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, { backgroundColor: COLORS.placeholder, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="person" size={40} color={COLORS.white} />
                  </View>
                )}
                
                <View style={styles.infoCol}>
                  <Text style={styles.name}>{rej.name}{age ? `, ${age}` : ''}</Text>
                  {rej.location && (
                    <View style={styles.row}>
                      <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.subtext}>{rej.location}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.statusBadge}>
                   <Text style={styles.statusBadgeText}>Blocked</Text>
                </View>
              </View>
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
  
  warningBox: {
    flexDirection: 'row', backgroundColor: '#F8F9FA', padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.md, alignItems: 'center',
  },
  warningText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 8, flex: 1 },

  rejCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  photo: {
    width: 60, height: 60, borderRadius: 30, marginRight: SPACING.md,
  },
  infoCol: { flex: 1, justifyContent: 'center' },
  name: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  subtext: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 4 },
  statusBadge: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#EF4444' },
});
