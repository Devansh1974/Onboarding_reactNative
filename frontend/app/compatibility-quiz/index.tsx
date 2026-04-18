import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function CompatibilityQuizIndex() {
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<any>({});

  useFocusEffect(
    React.useCallback(() => {
      fetchQuizState();
    }, [])
  );

  const fetchQuizState = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${data.phoneNumber}`);
      const result = await response.json();
      if (result.success && result.user) {
        setQuizState(result.user.compatibilityQuiz || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = (sectionKey: string, questionCount: number) => {
    return !!(quizState[sectionKey] && quizState[sectionKey][`q${questionCount}`]);
  };

  const cards = [
    {
      id: 'lifestyle',
      title: 'Lifestyle & Value',
      sub: 'Consistency, priorities, family-career balance',
      icon: 'bicycle',
      route: '/compatibility-quiz/lifestyle',
      isDone: isComplete('lifestyleAndValues', 5),
      isLocked: false // First is always open to start
    },
    {
      id: 'emotional',
      title: 'Emotional Communication',
      sub: 'Responsiveness, vulnerability, expression styles',
      icon: 'chatbubbles',
      route: '/compatibility-quiz/emotional',
      isDone: isComplete('emotionalCommunication', 5),
      isLocked: !isComplete('lifestyleAndValues', 5)
    },
    {
      id: 'attachment',
      title: 'Attachment & Comfort Zone',
      sub: 'Emotional availability, reassurance, independence',
      icon: 'bed',
      route: '/compatibility-quiz/attachment',
      isDone: isComplete('attachmentAndComfort', 5),
      isLocked: !isComplete('emotionalCommunication', 5)
    },
    {
      id: 'conflict',
      title: 'Conflict & Repair Patterns',
      sub: 'Handling disagreements, regulation, recovery',
      icon: 'people',
      route: '/compatibility-quiz/conflict',
      isDone: isComplete('conflictAndRepair', 4),
      isLocked: !isComplete('attachmentAndComfort', 5)
    },
    {
      id: 'growth',
      title: 'Growth & Emotional Maturity',
      sub: 'Reflection, accountability, mindset',
      icon: 'leaf',
      route: '/compatibility-quiz/growth',
      isDone: isComplete('growthAndReadiness', 5),
      isLocked: !isComplete('conflictAndRepair', 4)
    }
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pick a card</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.navigate('/home')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pick a card</Text>
      </View>

      <View style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl, gap: SPACING.lg as any }}
          snapToInterval={CARD_WIDTH + (SPACING.lg as number)}
          decelerationRate="fast"
        >
          {cards.map((card, index) => {
            return (
              <View key={card.id} style={{ width: CARD_WIDTH }}>
                <View style={[styles.card, card.isLocked && styles.cardLocked, card.isDone && styles.cardDone]}>
                  {card.isDone && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primaryDark} />
                    </View>
                  )}
                  {card.isLocked && !card.isDone && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={16} color={COLORS.gray} />
                    </View>
                  )}
                  
                  <Text style={[styles.cardTitle, (card.isLocked || card.isDone) && { color: COLORS.textSecondary }]}>
                    {card.title}
                  </Text>
                  <Text style={[styles.cardSub, (card.isLocked || card.isDone) && { color: COLORS.gray }]}>
                    {card.sub}
                  </Text>

                  <View style={styles.cardIllustration}>
                     {/* Using giant faint icons to represent the full-blur illustrations */}
                     <Ionicons name={card.icon as any} size={100} color={(card.isLocked || card.isDone) ? COLORS.lightGray : COLORS.primary} style={{ opacity: 0.15 }} />
                  </View>
                </View>

                <TouchableOpacity 
                   style={[styles.continueBtn, (card.isLocked || card.isDone) && { backgroundColor: COLORS.gray }]}
                   disabled={card.isLocked || card.isDone}
                   onPress={() => router.push(card.route as any)}
                >
                   <Text style={styles.continueBtnText}>{card.isDone ? 'Completed' : 'Continue'}</Text>
                   {!card.isDone && <Ionicons name="arrow-forward" size={18} color={COLORS.white} />}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primaryDark,
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.primaryLight + '30',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    height: width * 1.1,
    position: 'relative',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardLocked: {
    backgroundColor: COLORS.lightGray + '50',
  },
  cardDone: {
    backgroundColor: COLORS.primaryLight + '10',
    borderColor: COLORS.primaryLight,
  },
  checkBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  lockBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: COLORS.lightGray,
    padding: 6,
    borderRadius: 16,
  },
  cardTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 22,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  cardSub: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.text,
    lineHeight: 20,
  },
  cardIllustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  continueBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    marginRight: 8,
  }
});
