import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';

export default function DeleteAccountScreen() {
  const { data, resetData } = useOnboarding();

  const handlePermanentDelete = () => {
    Alert.alert(
      "Confirm Action",
      "Are you absolutely sure you want to permanently delete your account? All data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Forever", 
          style: "destructive", 
          onPress: () => {
            // Ideally trigger API to delete here
            resetData();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={40} color={COLORS.error} />
          </View>
        </View>
        
        <Text style={styles.title}>Delete Your Account?</Text>
        <Text style={styles.subtitle}>
          This action is permanent. All your data, matches, and conversation history will be erased from our servers forever.
        </Text>

        <View style={styles.lossCard}>
          <Text style={styles.lossLabel}>YOU WILL LOSE</Text>
          <LossItem text="Profile & Photos" />
          <LossItem text="Active Matches" />
          <LossItem text="Scheduled Dates" />
          <LossItem text="Chat Histories" />
        </View>

        <Text style={styles.confirmLabel}>TYPE DELETE TO CONFIRM</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputBoxPlaceholder}>DELETE</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handlePermanentDelete}>
          <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keepBtn} onPress={() => router.back()}>
          <Text style={styles.keepBtnText}>Keep My Account</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Fake Bottom tab spacing if it's placed over bottom tabs? Design implies a bottom tab might be visible but often settings doesn't have it. We'll leave it out for this stacked view. */}
    </SafeAreaView>
  );
}

const LossItem = ({ text }: { text: string }) => (
  <View style={styles.lossItemRow}>
    <Ionicons name="close" size={16} color={COLORS.error} />
    <Text style={styles.lossItemText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  scroll: { padding: SPACING.xl, alignItems: 'center' },

  iconContainer: { alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.xl },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.error + '15', alignItems: 'center', justifyContent: 'center' },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: SPACING.md },

  lossCard: { 
    width: '100%', backgroundColor: COLORS.error + '08', 
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, 
    marginTop: SPACING.xxl, marginBottom: SPACING.xxl 
  },
  lossLabel: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.error, letterSpacing: 1, marginBottom: SPACING.md },
  lossItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  lossItemText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginLeft: SPACING.sm },

  confirmLabel: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  inputBox: { width: '100%', height: 50, backgroundColor: COLORS.lightGray + '40', borderRadius: BORDER_RADIUS.round, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl },
  inputBoxPlaceholder: { ...TYPOGRAPHY.bodyBold, color: COLORS.textSecondary, opacity: 0.5 },

  deleteBtn: { width: '100%', height: 50, backgroundColor: COLORS.error + '25', borderRadius: BORDER_RADIUS.round, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg },
  deleteBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.error },
  
  keepBtn: { width: '100%', height: 50, justifyContent: 'center', alignItems: 'center' },
  keepBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },
});
