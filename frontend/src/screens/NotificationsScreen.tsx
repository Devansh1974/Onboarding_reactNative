import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { api } from '../utils/api';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function NotificationsScreen() {
  const { data, updateData } = useOnboarding();
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    await handleComplete(true);
  };

  const handleSkip = async () => {
    await handleComplete(false);
  };

  const handleComplete = async (notificationsEnabled: boolean) => {
    try {
      setLoading(true);
      
      // Update local state
      updateData({ 
        notificationsEnabled,
        onboardingCompleted: true,
      });
      
      // Save full profile to backend
      await api.updateProfile(data.phoneNumber, {
        ...data,
        notificationsEnabled,
        onboardingCompleted: true,
      });
      
      // Mark onboarding complete
      await api.completeOnboarding(data.phoneNumber);
      
      // Save to local storage
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('userPhone', data.phoneNumber);
      
      router.replace('/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout showHeader={false} backgroundColor={COLORS.white} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STAY IN THE LOOP</Text>
          </View>
          
          <Text style={styles.title}>Don't miss a{' \n'}thing</Text>
          <Text style={styles.subtitle}>
            Enable notifications so you never miss a match, call request, or date confirmation
          </Text>
          
          <View style={styles.icon}>
            <Text style={styles.iconText}>🔔</Text>
          </View>
          
          <View style={styles.notifications}>
            <View style={styles.notification}>
              <Text style={styles.notificationIcon}>🐞</Text>
              <Text style={styles.notificationText}>If you accepted, your call request</Text>
              <Text style={styles.notificationTime}>Just now</Text>
            </View>
            <View style={styles.notification}>
              <Text style={styles.notificationIcon}>✅</Text>
              <Text style={styles.notificationText}>Your date is confirmed for Saturday</Text>
              <Text style={styles.notificationTime}>10 min</Text>
            </View>
            <View style={styles.notification}>
              <Text style={styles.notificationIcon}>💌</Text>
              <Text style={styles.notificationText}>5 new matches waiting for you</Text>
              <Text style={styles.notificationTime}>1 day</Text>
            </View>
          </View>
        </View>

        <View>
          <CustomButton 
            title="Enable Notifications" 
            onPress={handleEnable} 
            loading={loading}
          />
          <View style={{ height: SPACING.sm }} />
          <CustomButton 
            title="Maybe later" 
            onPress={handleSkip} 
            variant="outline"
            disabled={loading}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: SPACING.lg, paddingTop: SPACING.xxl },
  content: { flex: 1, alignItems: 'center', paddingTop: SPACING.xl },
  badge: { backgroundColor: COLORS.primaryLight + '20', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: 20, marginBottom: SPACING.lg },
  badgeText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '700' },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  icon: { width: 80, height: 80, backgroundColor: COLORS.white, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  iconText: { fontSize: 40 },
  notifications: { width: '100%', marginTop: SPACING.lg },
  notification: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.sm, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  notificationIcon: { fontSize: 20, marginRight: SPACING.sm },
  notificationText: { ...TYPOGRAPHY.caption, color: COLORS.text, flex: 1 },
  notificationTime: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 11 },
});