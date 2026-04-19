import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../context/OnboardingContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { CustomButton } from '../components/CustomButton';

const HEIGHTS_FT = [];
for (let f = 4; f <= 7; f++) {
  for (let i = 0; i < 12; i++) {
    if (f === 7 && i > 0) break;
    HEIGHTS_FT.push(`${f}.${i}`);
  }
}
// Reverse to make taller at top
HEIGHTS_FT.reverse();

const ITEM_HEIGHT = 40;

export default function HeightScreen() {
  const { data, updateData } = useOnboarding();
  const [selectedHeight, setSelectedHeight] = useState('5.6');
  const isMale = data.gender === 'male';
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial scroll to default height
    const index = HEIGHTS_FT.indexOf(selectedHeight);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
      }, 300);
    }
  }, []);

  const handleContinue = () => {
    // Save height, e.g., converting 5.6 to float.
    updateData({ height: parseFloat(selectedHeight) });
    router.push('/location');
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    // Calculate which item is at the center based on content offset
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < HEIGHTS_FT.length) {
      setSelectedHeight(HEIGHTS_FT[index]);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedHeight;
    return (
      <View style={[styles.scaleItem, { height: ITEM_HEIGHT }]}>
        <View style={[styles.scaleLinesWrap, isSelected && styles.scaleLinesWrapActive]}>
          <View style={[styles.scaleLine, isSelected && styles.scaleLineActive]} />
          <View style={[styles.scaleLineSmall]} />
          <View style={[styles.scaleLineSmall]} />
        </View>
        <Text style={[styles.scaleText, isSelected && styles.scaleTextActive]}>
          {item}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerStep}>Wingmann</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitleSmall}>PROFILE BASICS</Text>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>
          Height is a common preference. Being honest helps find the most compatible matches.
        </Text>

        <View style={styles.mainCard}>
          <View style={styles.illustrationWrap}>
             {/* Left color block placeholder for illustration */}
             <View style={styles.illustrationBg}>
                <Text style={styles.illustrationEmoji}>{isMale ? '🧍‍♂️' : '🧍‍♀️'}</Text>
             </View>
          </View>

          <View style={styles.scaleContainer}>
             <View style={styles.selectorBoxWrap}>
               <Text style={styles.unitText}>Inch</Text>
               <View style={styles.selectorBox}>
                 <Text style={styles.selectorBoxText}>{selectedHeight}</Text>
               </View>
             </View>

             <FlatList
                ref={flatListRef}
                data={HEIGHTS_FT}
                keyExtractor={(item) => item}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingVertical: 140 }}
             />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
         <TouchableOpacity style={styles.nextBtn} onPress={handleContinue}>
            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40',
  },
  headerStep: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, fontSize: 18 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  subtitleSmall: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, letterSpacing: 1, fontWeight: '700', marginBottom: 4 },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, fontSize: 32, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.xxl },

  // Main Card Area
  mainCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
    marginBottom: SPACING.xl,
  },

  // Illustration side
  illustrationWrap: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  illustrationBg: {
    width: 60,
    height: '85%',
    backgroundColor: '#8E7398', // Matching purple color from image
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    position: 'relative',
  },
  illustrationEmoji: {
    fontSize: 80,
    position: 'absolute',
    bottom: 20,
    left: -15, // To pop out of the boundary slightly like the images
  },

  // Scale side
  scaleContainer: {
    flex: 0.55,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectorBoxWrap: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -30,
    zIndex: 10,
    alignItems: 'center',
  },
  unitText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 4 },
  selectorBox: {
    width: 60, height: 40,
    borderRadius: 8, borderWidth: 1, borderColor: '#8E7398',
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  selectorBoxText: { ...TYPOGRAPHY.bodyBold, color: COLORS.text },

  // Scale lines
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 60,
  },
  scaleLinesWrap: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: SPACING.md,
    opacity: 0.4,
  },
  scaleLinesWrapActive: {
    opacity: 1,
  },
  scaleLine: {
    width: 40, height: 2, backgroundColor: '#8E7398',
    marginBottom: 8,
  },
  scaleLineSmall: {
    width: 20, height: 1, backgroundColor: '#8E7398',
    marginBottom: 8,
  },
  scaleLineActive: {
    height: 3,
  },
  scaleText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    width: 20,
  },
  scaleTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  nextBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#5D3365', // Dark purple from the design
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5D3365', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
});