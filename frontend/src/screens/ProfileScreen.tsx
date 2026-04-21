import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../components/BottomTabBar';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function ProfileScreen() {
  const { data, resetData } = useOnboarding();
  const [pausedProfile, setPausedProfile] = React.useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: () => { resetData(); router.replace('/'); },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    router.push('/delete-account');
  };

  const comingSoon = (label: string) => Alert.alert('Coming Soon', `${label} will be available in the next update.`);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity style={styles.moreBtn} onPress={() => router.push('/inbox' as any)}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/edit-profile')} activeOpacity={0.85}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(data.name || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Text style={styles.profileName}>{data.name || 'Your name'}</Text>
            <View style={styles.profileLocRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.profileLoc}>{data.location || 'Location'}</Text>
            </View>
          </View>
          <Text style={styles.viewProfile}>Edit Profile →</Text>
        </TouchableOpacity>

        <SectionHeader label="ACCOUNT" />
        <MenuGroup>
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => comingSoon('Notifications')} />
          <MenuItem icon="lock-closed-outline" label="Privacy & Security" onPress={() => comingSoon('Privacy & Security')} />
          <MenuItem icon="call-outline" label="Phone Number" value={data.countryCode + ' ' + (data.phoneNumber || '')} onPress={() => comingSoon('Phone Number')} />
          <MenuItem icon="mail-outline" label="Email" value="Add email" onPress={() => comingSoon('Email')} last />
        </MenuGroup>

        <SectionHeader label="PREFERENCES" />
        <MenuGroup>
          <MenuItem icon="options-outline" label="Partner Preferences" onPress={() => comingSoon('Partner Preferences')} />
          <MenuItem icon="location-outline" label="Location" value={data.location || 'Not set'} onPress={() => comingSoon('Location')} />
          <MenuItem
            icon="pause-circle-outline"
            label="Pause My Profile"
            rightElement={<Switch value={pausedProfile} onValueChange={setPausedProfile} trackColor={{ true: COLORS.primary, false: COLORS.lightGray }} thumbColor={COLORS.white} />}
          />
          <MenuItem icon="ban-outline" label="Blacklisted Users" onPress={() => router.push('/matches/rejects' as any)} last />
        </MenuGroup>

        <SectionHeader label="LEGAL & HELP" />
        <MenuGroup>
          <MenuItem icon="star-outline" label="Share a Feedback" onPress={() => comingSoon('Share Feedback')} />
          <MenuItem icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push('/legal-safety')} />
          <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push('/legal-safety')} />
          <MenuItem icon="alert-circle-outline" label="Safety Guidelines" onPress={() => router.push('/legal-safety')} last />
        </MenuGroup>

        <View style={styles.dangerGroup}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            <Text style={styles.dangerText}>Log Out</Text>
          </TouchableOpacity>
          <View style={styles.dangerDivider} />
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
}

const SectionHeader = ({ label }: { label: string }) => (
  <Text style={sectionStyles.header}>{label}</Text>
);

const MenuGroup = ({ children }: { children: React.ReactNode }) => (
  <View style={sectionStyles.group}>{children}</View>
);

const MenuItem = ({
  icon, label, value, onPress, rightElement, last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  last?: boolean;
}) => (
  <TouchableOpacity
    style={[sectionStyles.item, !last && sectionStyles.itemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={!onPress && !rightElement}
  >
    <Ionicons name={icon} size={20} color={COLORS.primary} />
    <View style={{ flex: 1, marginLeft: SPACING.md }}>
      <Text style={sectionStyles.itemLabel}>{label}</Text>
      {value ? <Text style={sectionStyles.itemValue}>{value}</Text> : null}
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', ...TYPOGRAPHY.h3, color: COLORS.text },
  scroll: { padding: SPACING.lg },

  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  profileName: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 16 },
  profileLocRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  profileLoc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginLeft: 4 },
  viewProfile: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '600' },

  dangerGroup: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  dangerItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  dangerText: { ...TYPOGRAPHY.bodyBold, color: COLORS.error, marginLeft: SPACING.md, fontSize: 15 },
  dangerDivider: { height: 1, backgroundColor: COLORS.lightGray, marginLeft: SPACING.md + 20 + SPACING.md },
});

const sectionStyles = StyleSheet.create({
  header: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.2, fontWeight: '700',
    marginBottom: SPACING.sm, marginTop: SPACING.md,
  },
  group: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '80' },
  itemLabel: { ...TYPOGRAPHY.body, color: COLORS.text, fontSize: 15 },
  itemValue: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
});
