import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const interests = [
  { label: 'Reading', icon: 'book' },
  { label: 'Photography', icon: 'camera' },
  { label: 'Gaming', icon: 'game-controller' },
  { label: 'Music', icon: 'musical-notes' },
  { label: 'Travel', icon: 'airplane' },
  { label: 'Painting', icon: 'color-palette' },
  { label: 'Politics', icon: 'megaphone' },
  { label: 'Charity', icon: 'heart' },
  { label: 'Cooking', icon: 'restaurant' },
  { label: 'Pets', icon: 'paw' },
  { label: 'Sports', icon: 'football' },
  { label: 'Fashion', icon: 'shirt' },
  { label: 'Dancing', icon: 'body' },
  { label: 'Singing', icon: 'mic' },
  { label: 'Yoga', icon: 'fitness' },
  { label: 'Fitness', icon: 'barbell' },
  { label: 'Video games', icon: 'game-controller' },
  { label: 'Adventure', icon: 'rocket' },
  { label: 'Gardening', icon: 'leaf' },
  { label: 'Art & Craft', icon: 'brush' },
];

export default function FreeTimeScreen() {
  const { updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelected(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    updateData({ interests: selected });
    router.push('/lifestyle');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What do you love doing in your free time?</Text>
          <Text style={styles.subtitle}>Anything that makes you. Meet. Select upto 5</Text>
          
          <View style={styles.interests}>
            {interests.map((interest) => (
              <TouchableOpacity
                key={interest.label}
                style={[
                  styles.interest,
                  selected.includes(interest.label) && styles.interestSelected,
                ]}
                onPress={() => toggleInterest(interest.label)}
                disabled={selected.length >= 5 && !selected.includes(interest.label)}
              >
                <Ionicons 
                  name={interest.icon as any} 
                  size={20} 
                  color={selected.includes(interest.label) ? COLORS.white : COLORS.primary} 
                />
                <Text style={[
                  styles.interestText,
                  selected.includes(interest.label) && styles.interestTextSelected,
                ]}>
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <CustomButton title="Continue" onPress={handleContinue} disabled={selected.length === 0} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  interests: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.lg },
  interest: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.round, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, margin: 4 },
  interestSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  interestText: { ...TYPOGRAPHY.body, color: COLORS.text, marginLeft: SPACING.xs },
  interestTextSelected: { color: COLORS.white },
});