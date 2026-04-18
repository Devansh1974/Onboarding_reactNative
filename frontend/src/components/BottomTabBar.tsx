import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

type TabKey = 'home' | 'dates' | 'requests' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
  path: string;
}

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconFocused: 'home', path: '/home' },
  { key: 'dates', label: 'Dates', icon: 'calendar-outline', iconFocused: 'calendar', path: '/dates' },
  { key: 'requests', label: 'Requests', icon: 'heart-outline', iconFocused: 'heart', path: '/requests' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person', path: '/profile' },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navigateTo = (path: string) => {
    if (isActive(path)) return;
    router.replace(path as any);
  };

  // Split tabs for layout: first 2 | center brand | last 2
  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.container}>
        {leftTabs.map((t) => (
          <TabButton key={t.key} tab={t} active={isActive(t.path)} onPress={() => navigateTo(t.path)} />
        ))}

        {/* Center floating brand button */}
        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => navigateTo('/home')}
          activeOpacity={0.85}
          accessibilityLabel="WingMann home"
        >
          <View style={styles.centerInner}>
            <Ionicons name="heart" size={22} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {rightTabs.map((t) => (
          <TabButton key={t.key} tab={t} active={isActive(t.path)} onPress={() => navigateTo(t.path)} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const TabButton = ({
  tab,
  active,
  onPress,
}: {
  tab: TabItem;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.tabBtn} onPress={onPress} activeOpacity={0.7}>
    <Ionicons
      name={active ? tab.iconFocused : tab.icon}
      size={24}
      color={active ? COLORS.primary : COLORS.textSecondary}
    />
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
    }),
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: { color: COLORS.primary, fontWeight: '600' },

  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 8,
    marginTop: -28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  centerInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
});
