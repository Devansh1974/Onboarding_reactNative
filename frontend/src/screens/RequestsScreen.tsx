import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../components/BottomTabBar';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function RequestsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
      </View>
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>No requests yet</Text>
        <Text style={styles.emptySub}>
          Call requests and match invites from other members will show up here.
        </Text>
      </View>
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { ...TYPOGRAPHY.h1, fontSize: 28, color: COLORS.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
});
