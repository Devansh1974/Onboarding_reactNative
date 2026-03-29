import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.name}>{data.name}! 👋</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome to WingMann</Text>
          <Text style={styles.cardText}>Your journey to meaningful connections starts here</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>🚀</Text>
          <Text style={styles.placeholderTitle}>Main App Coming Soon</Text>
          <Text style={styles.placeholderSubtitle}>Profile completed successfully!</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg, paddingTop: SPACING.xxl },
  greeting: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  name: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginBottom: SPACING.xl },
  card: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: 16, marginBottom: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.sm },
  cardText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 80, marginBottom: SPACING.lg },
  placeholderTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm },
  placeholderSubtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});