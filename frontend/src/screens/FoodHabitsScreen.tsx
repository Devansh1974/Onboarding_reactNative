import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const foodOptions = [
  'Non vegetarian',
  'Vegetarian',
  'Vegan',
];

export default function FoodHabitsScreen() {
  const { updateData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (option: string) => {
    setSelected(prev => 
      prev.includes(option) 
        ? prev.filter(i => i !== option)
        : [...prev, option]
    );
  };

  const handleContinue = () => {
    updateData({ foodHabits: selected });
    router.push('/free-time');
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>What do you enjoy eating?</Text>
          <Text style={styles.subtitle}>You can totally skip if you'd like</Text>
          
          <View style={styles.options}>
            {foodOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  selected.includes(option) && styles.optionSelected,
                ]}
                onPress={() => toggleSelection(option)}
              >
                <Text style={[
                  styles.optionText,
                  selected.includes(option) && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.hint}>
            <Text style={styles.hintText}>Please select your food habits</Text>
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
  options: { marginTop: SPACING.lg },
  option: { padding: SPACING.md, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white, marginBottom: SPACING.sm },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { ...TYPOGRAPHY.body, color: COLORS.text },
  optionTextSelected: { color: COLORS.white },
  hint: { marginTop: SPACING.lg, padding: SPACING.md, backgroundColor: COLORS.primaryLight + '10', borderRadius: BORDER_RADIUS.md },
  hintText: { ...TYPOGRAPHY.caption, color: COLORS.text },
});