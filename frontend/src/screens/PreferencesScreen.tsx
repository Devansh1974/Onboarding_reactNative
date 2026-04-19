import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../context/OnboardingContext';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const LANGUAGES = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil', 'Malayalam', 'Bengali', 'Marathi'];
const DEALBREAKERS = ['Smoking', 'Drinking', 'Different Religion', 'Long Distance', 'No Ambition', 'Poor Hygiene'];

export default function PreferencesScreen() {
  const { data, updateData } = useOnboarding();
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(28);
  const [heightMin, setHeightMin] = useState(5.0);
  const [heightMax, setHeightMax] = useState(6.5);
  const [languages, setLanguages] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState<string[]>([]);

  const toggleChip = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const adjustAge = (which: 'min' | 'max', dir: number) => {
    if (which === 'min') {
      const v = Math.max(18, Math.min(ageMax - 1, ageMin + dir));
      setAgeMin(v);
    } else {
      const v = Math.max(ageMin + 1, Math.min(50, ageMax + dir));
      setAgeMax(v);
    }
  };

  const adjustHeight = (which: 'min' | 'max', dir: number) => {
    const step = 0.5;
    if (which === 'min') {
      const v = Math.max(4.0, Math.min(heightMax - step, +(heightMin + dir * step).toFixed(1)));
      setHeightMin(v);
    } else {
      const v = Math.max(heightMin + step, Math.min(7.0, +(heightMax + dir * step).toFixed(1)));
      setHeightMax(v);
    }
  };

  const handleContinue = () => {
    updateData({
      preferences: {
        ageRange: { min: ageMin, max: ageMax },
        heightRange: { min: heightMin, max: heightMax },
        languages,
        dealbreakers,
      },
    });
    router.push('/upload-photos');
  };

  const RangeSelector = ({
    label, minVal, maxVal, onAdjustMin, onAdjustMax, unit,
  }: {
    label: string; minVal: string; maxVal: string;
    onAdjustMin: (d: number) => void; onAdjustMax: (d: number) => void; unit: string;
  }) => (
    <View style={styles.rangeBlock}>
      <Text style={styles.rangeLabel}>{label}</Text>
      <View style={styles.rangeRow}>
        <View style={styles.rangeControl}>
          <TouchableOpacity style={styles.rangeBtn} onPress={() => onAdjustMin(-1)}>
            <Ionicons name="remove" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.rangeValue}>{minVal}{unit}</Text>
          <TouchableOpacity style={styles.rangeBtn} onPress={() => onAdjustMin(1)}>
            <Ionicons name="add" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.rangeDash}>—</Text>
        <View style={styles.rangeControl}>
          <TouchableOpacity style={styles.rangeBtn} onPress={() => onAdjustMax(-1)}>
            <Ionicons name="remove" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.rangeValue}>{maxVal}{unit}</Text>
          <TouchableOpacity style={styles.rangeBtn} onPress={() => onAdjustMax(1)}>
            <Ionicons name="add" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerStep}>PREFERENCES</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are you{'\n'}looking for?</Text>
        <Text style={styles.subtitle}>Set your preferences for the perfect match.{'\n'}You can update these later too.</Text>

        {/* Age Range */}
        <RangeSelector
          label="AGE RANGE"
          minVal={String(ageMin)} maxVal={String(ageMax)}
          onAdjustMin={(d) => adjustAge('min', d)}
          onAdjustMax={(d) => adjustAge('max', d)}
          unit=""
        />

        {/* Height Range */}
        <RangeSelector
          label="HEIGHT PREFERENCE"
          minVal={heightMin.toFixed(1)} maxVal={heightMax.toFixed(1)}
          onAdjustMin={(d) => adjustHeight('min', d)}
          onAdjustMax={(d) => adjustHeight('max', d)}
          unit=" ft"
        />

        {/* Gender */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>GENDER</Text>
          <View style={styles.chipRow}>
            <View style={[styles.chip, styles.chipSelected]}>
              <Text style={[styles.chipText, styles.chipTextSelected]}>
                {data.gender === 'male' ? 'Female' : data.gender === 'female' ? 'Male' : 'All'}
              </Text>
            </View>
          </View>
        </View>

        {/* Languages */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>LANGUAGES</Text>
          <View style={styles.chipRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.chip, languages.includes(lang) && styles.chipSelected]}
                onPress={() => toggleChip(languages, setLanguages, lang)}
              >
                <Text style={[styles.chipText, languages.includes(lang) && styles.chipTextSelected]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dealbreakers */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>DEALBREAKERS</Text>
          <View style={styles.chipRow}>
            {DEALBREAKERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, dealbreakers.includes(item) && styles.chipSelectedRed]}
                onPress={() => toggleChip(dealbreakers, setDealbreakers, item)}
              >
                <Text style={[styles.chipText, dealbreakers.includes(item) && styles.chipTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerStep: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1 },
  content: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: SPACING.sm, fontSize: 30 },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 22, fontSize: 15 },

  // Range
  rangeBlock: { marginBottom: SPACING.xl },
  rangeLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.sm },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  rangeControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBackground, borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs,
  },
  rangeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  rangeValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginHorizontal: SPACING.md, fontSize: 20, minWidth: 40, textAlign: 'center' },
  rangeDash: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginHorizontal: SPACING.md },

  // Section
  sectionBlock: { marginBottom: SPACING.xl },
  sectionLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BORDER_RADIUS.round, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipSelectedRed: { backgroundColor: '#E74C3C', borderColor: '#E74C3C' },
  chipText: { ...TYPOGRAPHY.caption, color: COLORS.text, fontWeight: '500' },
  chipTextSelected: { color: COLORS.white },

  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
});
