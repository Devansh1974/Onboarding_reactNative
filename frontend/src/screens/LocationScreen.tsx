import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { Dropdown } from '../components/Dropdown';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function LocationScreen() {
  const { updateData } = useOnboarding();
  const [location, setLocation] = useState('');
  const cities = ['Bangalore', 'Hyderabad'];

  const handleContinue = () => {
    if (!location) return;
    updateData({ location });
    router.push('/city-welcome');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <Text style={styles.title}>Enable Your Location</Text>
          <Text style={styles.subtitle}>Location access is required to find and verify matches in your area. You cannot proceed without enabling this.</Text>
          
          <View style={styles.buttonContainer}>
            <CustomButton title="Allow Location Access" onPress={() => {}} variant="primary" />
            <Text style={styles.orText}>or</Text>
            <CustomButton title="Enter Location Manually" onPress={() => {}} variant="secondary" />
          </View>

          <View style={styles.dropdown}>
            <Dropdown 
              placeholder="Select your city" 
              value={location} 
              options={cities} 
              onChange={setLocation} 
            />
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={!location} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  icon: { width: 100, height: 100, backgroundColor: COLORS.primary + '20', borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, alignSelf: 'center' },
  iconText: { fontSize: 48 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl, textAlign: 'center' },
  buttonContainer: { marginVertical: SPACING.lg },
  orText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.sm },
  dropdown: { marginTop: SPACING.lg },
});