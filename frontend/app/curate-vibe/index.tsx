import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Generate deterministic random arrays for images
const buildImageSet = (folder: string) => {
  return [
    [10, 12, 14, 16],
    [20, 22, 24, 26],
    [30, 32, 34, 36],
    [40, 42, 44, 46]
  ].map(arr => arr.map(i => `https://randomuser.me/api/portraits/${folder}/${i}.jpg`));
};

export default function CurateVibe() {
  const { data } = useOnboarding();
  const [step, setStep] = useState(0); 
  const [targetGenderFolder, setTargetGenderFolder] = useState<'men' | 'women'>('women');
  const [images, setImages] = useState<string[][]>([]);
  const [selections, setSelections] = useState<(string | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingTicks, setLoadingTicks] = useState(0); // For the final animated loading sequence

  useEffect(() => {
    fetchUserGender();
  }, []);

  const fetchUserGender = async () => {
    try {
      const resp = await fetch(`${BACKEND_URL}/api/users/${data.phoneNumber}`);
      const result = await resp.json();
      const folder = result.user?.gender === 'female' ? 'men' : 'women';
      setTargetGenderFolder(folder);
      setImages(buildImageSet(folder));
    } catch (e) {
      console.error(e);
      // Fallback
      setImages(buildImageSet('women'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (roundIndex: number, imgUrl: string) => {
    setSelections(prev => {
      const newSel = [...prev];
      newSel[roundIndex] = imgUrl;
      return newSel;
    });
  };

  const nextStep = () => {
    if (step < 6) setStep(step + 1);
  };

  // Launch the loading animation sequence
  useEffect(() => {
    if (step === 6) {
      const timer1 = setTimeout(() => setLoadingTicks(1), 1200);
      const timer2 = setTimeout(() => setLoadingTicks(2), 2400);
      const timer3 = setTimeout(() => setLoadingTicks(3), 3600);
      const timer4 = setTimeout(() => finishVibe(), 4500);

      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); }
    }
  }, [step]);

  const finishVibe = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber,
          data: { 
            vibeCompleted: true,
            vibeSelections: selections.filter(Boolean),
          }
        }),
      });
      router.navigate('/home');
    } catch (e) {
      console.error(e);
      router.navigate('/home');
    }
  };


  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ==== STEP 0: Intro ====
  if (step === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleNeutral}>Curate Your Vibe</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.heroTitle}>Curate Your Vibe</Text>
          <Text style={styles.heroSub}>
            We'll show you photos across 4 rounds. Pick the one you're most drawn to each time.
          </Text>

          <View style={styles.picGrid}>
            {[1,2,3,4].map(idx => (
              <View key={idx} style={[styles.picPlaceholder, { opacity: 0.15 + (idx * 0.1) }]} />
            ))}
          </View>

          <Text style={styles.heroFooter}>4 ROUNDS · 1 PICK PER ROUND</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
            <Text style={styles.primaryButtonText}>Let's Start</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==== STEPS 1-4: The Rounds ====
  if (step >= 1 && step <= 4) {
    const roundIdx = step - 1;
    const currentSelection = selections[roundIdx];
    
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.headerSplit}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitleActive}>Curate Your Vibe</Text>
          </View>
          <View style={styles.pillActive}>
            <Text style={styles.pillActiveText}>ROUND {step} / 4</Text>
          </View>
        </View>

        <View style={styles.progressLineWrap}>
           <View style={[styles.progressLineCore, { width: `${(step/4)*100}%` }]} />
        </View>

        <View style={styles.content}>
          <Text style={styles.roundInstruction}>Pick the one you're most drawn to</Text>
          
          <View style={styles.picGrid}>
            {images[roundIdx].map((imgUrl, i) => {
              const isSelected = currentSelection === imgUrl;
              return (
                <TouchableOpacity 
                   key={i} 
                   style={[styles.picBox, isSelected && styles.picBoxSelected]}
                   onPress={() => handleSelect(roundIdx, imgUrl)}
                   activeOpacity={0.9}
                >
                  <Image source={{ uri: imgUrl }} style={styles.picImage} />
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={{ flex: 1 }} />

          <TouchableOpacity 
             style={[styles.primaryButton, !currentSelection && { backgroundColor: COLORS.textSecondary }]} 
             onPress={nextStep}
             disabled={!currentSelection}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==== STEP 5: Vibe Results ====
  if (step === 5) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(4)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitleNeutral}>Curate Your Vibe</Text>
        </View>

        <View style={[styles.content, { justifyContent: 'space-between' }]}>
           <View>
             <View style={styles.resultsCenter}>
               <Text style={styles.resultsTitle}>Your Vibe ✨</Text>
               <Text style={styles.resultsSub}>Based on your picks, here's the facial type you're most drawn to</Text>
             </View>
             
             <View style={styles.picGrid}>
               {selections.map((imgUrl, i) => (
                  <View key={i} style={styles.picBox}>
                    <Image source={{ uri: imgUrl! }} style={styles.picImage} />
                  </View>
               ))}
             </View>
           </View>

           <TouchableOpacity style={styles.primaryButton} onPress={nextStep}>
              <Text style={styles.primaryButtonText}>Looks Good</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==== STEP 6: Loading Generator ====
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} disabled>
          <Ionicons name="arrow-back" size={24} color={COLORS.lightGray} />
        </TouchableOpacity>
        <Text style={[styles.headerTitleNeutral, {color: COLORS.primaryDark}]}>Curate Your Vibe</Text>
      </View>
      <View style={styles.loadingContent}>
        
        <View style={styles.spinnerWrap}>
           <Ionicons name="sparkles" size={36} color={COLORS.primaryDark} />
        </View>
        <Text style={styles.loadingTitle}>Finding your{'\n'}matches...</Text>
        <Text style={styles.loadingSub}>We're using your quiz answers and vibe picks to find people who genuinely match you.</Text>
        <Text style={styles.loadingAccent}>Curating your personalized list...{'\n'}great things take a moment.</Text>

        <View style={styles.checkList}>
          <TickRow text="Analysing your compatibility quiz" active={loadingTicks >= 1} />
          <TickRow text="Processing your vibe selections" active={loadingTicks >= 2} />
          <TickRow text="Curating your top matches" active={loadingTicks >= 3} pending={loadingTicks < 3} iconOverride={loadingTicks >= 3 ? 'checkmark-circle' : 'hourglass-outline'} />
        </View>

      </View>
      <Text style={styles.bottomBrandMark}>WINGMANN</Text>
    </SafeAreaView>
  );
}

// CheckRow helper for loading
const TickRow = ({text, active, pending, iconOverride}: any) => (
  <View style={styles.tickRow}>
    <Ionicons 
      name={iconOverride || "checkmark-circle"} 
      size={24} 
      color={active ? COLORS.primaryDark : COLORS.lightGray} 
    />
    <Text style={[styles.tickText, !active && { color: COLORS.lightGray }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F8' }, // Slight off-white like figma
  
  // Headers
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerSplit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitleNeutral: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary, fontSize: 18 },
  headerTitleActive: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, fontSize: 20 },
  
  pillActive: { backgroundColor: '#EADCEE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  pillActiveText: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  progressLineWrap: { width: '100%', height: 2, backgroundColor: '#EADCEE', marginBottom: SPACING.md },
  progressLineCore: { height: 2, backgroundColor: COLORS.primaryDark },

  // Content
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl },
  
  // Step 0 UI
  heroTitle: { ...TYPOGRAPHY.h1, color: COLORS.primaryDark, textAlign: 'center', fontSize: 30, marginBottom: SPACING.sm, marginTop: SPACING.md },
  heroSub: { ...TYPOGRAPHY.body, textAlign: 'center', color: COLORS.text, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  heroFooter: { ...TYPOGRAPHY.caption, textAlign: 'center', color: COLORS.textSecondary, letterSpacing: 0.5, marginTop: SPACING.xxl, marginBottom: SPACING.xl },
  
  // Global Button
  primaryButton: { flexDirection: 'row', backgroundColor: '#472B52', width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xl, marginBottom: SPACING.xxl, shadowColor: '#472B52', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { ...TYPOGRAPHY.button, color: COLORS.white, marginRight: SPACING.sm, fontSize: 16 },

  // Grids
  picGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: SPACING.md as any },
  picPlaceholder: { width: '47%', aspectRatio: 0.9, backgroundColor: COLORS.primaryDark, borderRadius: BORDER_RADIUS.xl },
  
  // Rounds UI
  roundInstruction: { ...TYPOGRAPHY.h2, fontSize: 20, color: COLORS.black, marginBottom: SPACING.xl },
  picBox: { width: '47%', aspectRatio: 0.85, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', backgroundColor: COLORS.lightGray, borderWidth: 3, borderColor: 'transparent' },
  picBoxSelected: { borderColor: COLORS.primaryDark },
  picImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Results UI
  resultsCenter: { alignItems: 'center', marginBottom: SPACING.xl },
  resultsTitle: { ...TYPOGRAPHY.h1, color: COLORS.primaryDark, fontSize: 28, marginBottom: SPACING.sm },
  resultsSub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.lg },
  summaryBox: { backgroundColor: COLORS.white, padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, marginTop: SPACING.xl, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 2 },
  summaryBoxSub: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 1, marginBottom: SPACING.sm },
  summaryBoxText: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, lineHeight: 22, fontSize: 15 },
  redoLink: { marginTop: SPACING.xl, alignItems: 'center', marginBottom: SPACING.xl },
  redoLinkText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 13 },

  // Loading UI
  loadingContent: { flex: 1, paddingHorizontal: SPACING.xxl, paddingTop: 40, alignItems: 'center' },
  spinnerWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EADCEE', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  loadingTitle: { ...TYPOGRAPHY.h1, color: COLORS.primaryDark, fontSize: 28, textAlign: 'center', marginBottom: SPACING.md },
  loadingSub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  loadingAccent: { ...TYPOGRAPHY.body, color: '#A582AA', textAlign: 'center', marginTop: SPACING.md, marginBottom: 40 },
  checkList: { width: '100%', backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.xl, gap: SPACING.md as any },
  tickRow: { flexDirection: 'row', alignItems: 'center' },
  tickText: { ...TYPOGRAPHY.bodyBold, fontSize: 13, color: COLORS.primaryDark, marginLeft: SPACING.md },
  bottomBrandMark: { ...TYPOGRAPHY.caption, textAlign: 'center', letterSpacing: 2, color: COLORS.lightGray, marginBottom: SPACING.xl }
});
