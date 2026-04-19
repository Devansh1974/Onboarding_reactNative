import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useOnboarding } from '../context/OnboardingContext';
import { CustomButton } from '../components/CustomButton';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const PHOTO_TIPS = [
  { icon: 'color-filter-outline' as const, title: 'Avoid filters', sub: 'Show the real you without heavy filters.' },
  { icon: 'heart-outline' as const, title: 'What you like', sub: 'Share hobbies with your best impulse.' },
  { icon: 'walk-outline' as const, title: 'Share lifestyle', sub: "Show you're active and how you carry yourself." },
  { icon: 'eye-outline' as const, title: 'Visible you', sub: "Make sure we can see those details and you identify yourself." },
];

export default function UploadPhotosScreen() {
  const { data, updateData } = useOnboarding();
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = `data:image/jpeg;base64,${asset.base64}`;
      const newPhotos = [...photos];
      if (index < newPhotos.length) {
        newPhotos[index] = base64;
      } else {
        newPhotos.push(base64);
      }
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    if (photos.length === 0) {
      Alert.alert('Add a photo', 'Please upload at least one photo to continue.');
      return;
    }

    setUploading(true);
    try {
      // Save photos to backend
      const response = await fetch(`${BACKEND_URL}/api/users/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: data.phoneNumber, photos }),
      });
      const result = await response.json();

      if (result.success) {
        updateData({ photos });
        router.push('/notifications');
      } else {
        Alert.alert('Error', result.message || 'Failed to upload photos');
      }
    } catch (e) {
      console.error('Upload error:', e);
      // Still continue even if upload fails (user can retry later)
      updateData({ photos });
      router.push('/notifications');
    } finally {
      setUploading(false);
    }
  };

  const renderSlot = (index: number) => {
    const photo = photos[index];
    const isMain = index === 0;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.photoSlot, isMain && styles.mainSlot]}
        onPress={() => pickImage(index)}
        activeOpacity={0.8}
      >
        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removePhoto(index)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.removeBtnInner}>
                <Ionicons name="close" size={14} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Ionicons
              name={isMain ? 'person-add' : 'add'}
              size={isMain ? 32 : 28}
              color={COLORS.primaryLight}
            />
            {isMain && <Text style={styles.mainLabel}>Main Photo</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerStep}>6 PHOTOS MAX</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Upload Your{'\n'}Photo</Text>
        <Text style={styles.subtitle}>Upload at least 1 photo. We'd love to see the real you.</Text>

        {/* 3x2 Photo Grid */}
        <View style={styles.photoGrid}>
          <View style={styles.photoRow}>
            {renderSlot(0)}
            {renderSlot(1)}
            {renderSlot(2)}
          </View>
          <View style={styles.photoRow}>
            {renderSlot(3)}
            {renderSlot(4)}
            {renderSlot(5)}
          </View>
        </View>

        {/* Photo Tips */}
        <View style={styles.tipsSection}>
          {PHOTO_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIconWrap}>
                <Ionicons name={tip.icon} size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipSub}>{tip.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {uploading ? (
          <View style={styles.uploadingRow}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.uploadingText}>Uploading photos...</Text>
          </View>
        ) : (
          <CustomButton
            title="Next"
            onPress={handleNext}
            disabled={photos.length === 0}
          />
        )}
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
  content: { flex: 1, paddingHorizontal: SPACING.lg },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, marginBottom: SPACING.xs, fontSize: 28 },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING.lg, fontSize: 15 },

  // Photo Grid
  photoGrid: { marginBottom: SPACING.lg },
  photoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  photoSlot: {
    width: '31%', aspectRatio: 3 / 4,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 2,
    borderColor: COLORS.primaryLight + '40', borderStyle: 'dashed',
    overflow: 'hidden', backgroundColor: COLORS.cardBackground,
  },
  mainSlot: { borderColor: COLORS.primary, borderWidth: 2.5 },
  emptySlot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainLabel: { ...TYPOGRAPHY.caption, color: COLORS.primaryLight, marginTop: 4, fontSize: 10, fontWeight: '600' },
  photoContainer: { flex: 1, position: 'relative' },
  photoImage: { width: '100%', height: '100%', borderRadius: BORDER_RADIUS.lg - 2 },
  removeBtn: { position: 'absolute', top: 6, right: 6 },
  removeBtnInner: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },

  // Tips
  tipsSection: { marginTop: SPACING.sm },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  tipIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  tipTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 14 },
  tipSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 12, lineHeight: 16 },

  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md },
  uploadingText: { ...TYPOGRAPHY.body, color: COLORS.primary, marginLeft: SPACING.sm },
});
