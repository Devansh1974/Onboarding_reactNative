import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { CustomButton } from '../../src/components/CustomButton';

export default function QuizComplete() {
  const handleCurateVibe = () => {
    // Show alert as requested by the user scenario
    Alert.alert("Coming Soon", "Still coming up!", [
      { text: "OK", onPress: () => router.navigate('/home') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Abstract Illustration Representation */}
        <View style={styles.illustrationWrap}>
          <View style={styles.screenShape}>
            <Ionicons name="person" size={80} color={COLORS.black} />
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </View>
          </View>
          <View style={[styles.screenShape, { marginTop: -40, marginLeft: 80, transform: [{ rotate: '5deg' }] }]}>
            <Ionicons name="person" size={80} color={COLORS.black} />
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </View>
          </View>
        </View>

        <View style={styles.messageBox}>
          <View style={styles.iconCorner}>
            <Ionicons name="happy" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.messageText}>
            The wait is almost over! Your matches are just one click away.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton 
            title="Curate Your Vibe ->" 
            onPress={handleCurateVibe} 
          />
          
          <TouchableOpacity 
            style={styles.homeLink} 
            onPress={() => router.navigate('/home')}
          >
            <Text style={styles.homeLinkText}>Go Back To Home Screen -></Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.round,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  illustrationWrap: {
    marginBottom: SPACING.xxl,
    alignItems: 'center',
    width: '100%',
    height: 200,
  },
  screenShape: {
    width: 140,
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    position: 'absolute',
  },
  plusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBox: {
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryLight + '10',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    position: 'relative',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    width: '100%',
  },
  iconCorner: {
    position: 'absolute',
    top: -12,
    left: -12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 2,
  },
  messageText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: SPACING.xxl,
  },
  homeLink: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  homeLinkText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text,
    fontSize: 15,
  }
});
