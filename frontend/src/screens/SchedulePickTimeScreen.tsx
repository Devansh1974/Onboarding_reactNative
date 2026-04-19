import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { CustomButton } from '../components/CustomButton';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function SchedulePickTimeScreen() {
  const { data } = useOnboarding();
  const params = useLocalSearchParams<{ mode?: string; reason?: string }>();
  const isReschedule = params.mode === 'reschedule';
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  useEffect(() => {
    if (selectedDate) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      fetchSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchSlots = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/sessions/slots/${date}`);
      const result = await response.json();
      setAvailableSlots(result.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;
    router.push({
      pathname: '/schedule-confirm',
      params: {
        date: selectedDate,
        time: selectedTime,
        ...(isReschedule ? { mode: 'reschedule', reason: String(params.reason || '') } : {}),
      },
    });
  };

  return (
    <OnboardingLayout onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{isReschedule ? 'Pick a New Time' : 'Pick a Time'}</Text>
          <Text style={styles.subtitle}>
            {isReschedule
              ? 'Choose a new date and time that works for you'
              : 'Select a date and time for your session'}
          </Text>

          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
            {dates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && (
            <>
              <Text style={styles.sectionTitle}>Select Time</Text>
              {loading ? (
                <Text style={styles.loadingText}>Loading slots...</Text>
              ) : (
                <View style={styles.timeSlotsContainer}>
                  {availableSlots.map((slot) => (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.timeSlot,
                        !slot.available && styles.timeSlotDisabled,
                        selectedTime === slot.time && styles.timeSlotSelected,
                      ]}
                      onPress={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        !slot.available && styles.timeSlotTextDisabled,
                        selectedTime === slot.time && styles.timeSlotTextSelected,
                      ]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <CustomButton 
          title="Continue" 
          onPress={handleContinue} 
          disabled={!selectedDate || !selectedTime}
        />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'space-between', paddingBottom: SPACING.lg },
  content: { flex: 1, paddingTop: SPACING.xl },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.md },
  datesScroll: { marginBottom: SPACING.lg },
  dateCard: { width: 60, padding: SPACING.sm, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginRight: SPACING.sm, alignItems: 'center' },
  dateCardSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDay: { ...TYPOGRAPHY.caption, color: COLORS.text },
  dateNumber: { ...TYPOGRAPHY.h3, color: COLORS.text, marginTop: SPACING.xs },
  dateTextSelected: { color: COLORS.white },
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  timeSlot: { padding: SPACING.md, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, margin: 4, minWidth: 100, alignItems: 'center' },
  timeSlotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeSlotDisabled: { backgroundColor: COLORS.lightGray, opacity: 0.5 },
  timeSlotText: { ...TYPOGRAPHY.body, color: COLORS.text },
  timeSlotTextSelected: { color: COLORS.white },
  timeSlotTextDisabled: { color: COLORS.textSecondary },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.lg },
});