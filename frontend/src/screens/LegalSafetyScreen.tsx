import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function LegalSafetyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal & Safety</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primaryDark} style={{ marginRight: SPACING.md }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Your Safety is Our Priority</Text>
            <Text style={styles.bannerSub}>We partner with curated venues to ensure safe environments for your offline experiences.</Text>
          </View>
        </View>

        {/* Safety Reminders */}
        <Text style={styles.sectionTitle}>SAFETY REMINDERS</Text>
        <View style={styles.card}>
          <SafetyItem 
            icon="shield-outline" 
            title="Don't share phone numbers early" 
            desc="Stay on the platform until you are fully comfortable." 
          />
          <SafetyItem 
            icon="home-outline" 
            title="Keep home address private" 
            desc="Meet in public spaces and avoid sharing residential details." 
          />
          <SafetyItem 
            icon="person-circle-outline" 
            title="Verify identity first" 
            desc="Ask for a quick video chat or a verified social profile." 
            last 
          />
        </View>

        {/* Legal Docs */}
        <Text style={styles.sectionTitle}>LEGAL DOCUMENTS</Text>
        <View style={styles.card}>
          <DocItem title="Terms & Conditions" />
          <DocItem title="Privacy Policy" />
          <DocItem title="Cookie Policy" />
          <DocItem title="Community Guidelines" last />
        </View>

        {/* Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteTitleRow}>
            <Ionicons name="warning-outline" size={18} color="#7E7B6C" />
            <Text style={styles.noteTitleText}>Important Note</Text>
          </View>
          <Text style={styles.noteBody}>
            While we facilitate introductions, we are not responsible for interactions occurring outside of our verified platform or partner venues.
          </Text>
        </View>

        <TouchableOpacity style={styles.contactBtn}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primaryDark} style={{ marginRight: 8 }} />
          <Text style={styles.contactBtnText}>Contact Safety Team</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const SafetyItem = ({ icon, title, desc, last }: any) => (
  <View style={[styles.safetyItem, !last && styles.itemBorder]}>
    <Ionicons name={icon} size={24} color={COLORS.primaryDark} />
    <View style={{ flex: 1, marginLeft: SPACING.md }}>
      <Text style={styles.safeTitle}>{title}</Text>
      <Text style={styles.safeDesc}>{desc}</Text>
    </View>
  </View>
);

const DocItem = ({ title, last }: any) => (
  <View style={[styles.docItem, !last && styles.itemBorder]}>
    <Text style={styles.docText}>{title}</Text>
    <Ionicons name="open-outline" size={18} color={COLORS.textSecondary} />
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  scroll: { padding: SPACING.lg },

  banner: { flexDirection: 'row', backgroundColor: '#F6EFF9', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl },
  bannerTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark, marginBottom: 4 },
  bannerSub: { ...TYPOGRAPHY.caption, color: COLORS.primaryDark, opacity: 0.8 },

  sectionTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.md, marginLeft: SPACING.sm },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40' },
  
  safetyItem: { flexDirection: 'row', padding: SPACING.lg },
  safeTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 15, marginBottom: 2 },
  safeDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, lineHeight: 18 },

  docItem: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg },
  docText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 15 },

  noteCard: { backgroundColor: '#F0F2D6', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xl },
  noteTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  noteTitleText: { ...TYPOGRAPHY.bodyBold, color: '#7E7B6C', marginLeft: 6 },
  noteBody: { ...TYPOGRAPHY.caption, color: '#7E7B6C', lineHeight: 18 },

  contactBtn: { flexDirection: 'row', backgroundColor: '#F6EFF9', borderRadius: BORDER_RADIUS.round, paddingVertical: SPACING.md, justifyContent: 'center', alignItems: 'center' },
  contactBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primaryDark },
});
