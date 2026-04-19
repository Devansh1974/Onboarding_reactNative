import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.filler} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.notifCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.textContent}>
            <Text style={styles.notifTitle}>Welcome to WingMann! 🎉</Text>
            <Text style={styles.notifBody}>
              We are thrilled to have you here. Complete your profile and schedule your Know Yourself session to get started.
            </Text>
            <Text style={styles.timeText}>Just now</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  filler: { width: 40 },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  
  scroll: { padding: SPACING.lg },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  textContent: { flex: 1 },
  notifTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginBottom: 4 },
  notifBody: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, lineHeight: 18 },
  timeText: { ...TYPOGRAPHY.caption, color: COLORS.lightGray, marginTop: SPACING.sm, fontSize: 11 },
});
