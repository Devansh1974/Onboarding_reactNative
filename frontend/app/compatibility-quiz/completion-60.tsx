import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';

export default function Completion60() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        
        {/* Confetti decoration top */}
        <View style={styles.confettiTop}>
          <Ionicons name="sparkles" size={40} color={COLORS.white} style={{ opacity: 0.8, transform: [{rotate: '15deg'}] }} />
          <Ionicons name="happy" size={24} color={COLORS.secondary || '#FFC107'} style={{ opacity: 0.9, marginTop: 40, marginLeft: 40 }} />
          <Ionicons name="star" size={30} color={COLORS.white} style={{ opacity: 0.5, marginLeft: -60, marginTop: 20 }} />
        </View>

        <Text style={styles.title}>You have{'\n'}completed 60%{'\n'}of the quiz.</Text>

        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={() => router.push('/compatibility-quiz')}
        >
          <Text style={styles.continueText}>Go to Next Section</Text>
        </TouchableOpacity>

        <View style={styles.illustrationWrap}>
          {/* Using a musical icon to closely mimic the man with the trumpet from Figma */}
          <Ionicons name="musical-notes" size={120} color={COLORS.white} style={{ opacity: 0.9 }} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D4468', // Deep vintage purple matching Figma exactly
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    position: 'relative',
  },
  confettiTop: {
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 45,
    fontFamily: 'serif', // matching the serif font in Figma
    marginBottom: SPACING.xxl * 2,
    zIndex: 10,
  },
  continueButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  continueText: {
    color: '#5D4468',
    ...TYPOGRAPHY.button,
  },
  illustrationWrap: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    opacity: 0.8,
  }
});
