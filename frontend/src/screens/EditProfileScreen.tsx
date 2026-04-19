import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { useOnboarding } from '../context/OnboardingContext';
import { CustomButton } from '../components/CustomButton';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function EditProfileScreen() {
  const { data, updateData } = useOnboarding();
  
  // Local state for all fields
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [name, setName] = useState(data.name || '');
  const [birthday, setBirthday] = useState(data.birthday || '');
  const [location, setLocation] = useState(data.location || '');
  const [height, setHeight] = useState(data.height ? data.height.toString() : '');
  const [religion, setReligion] = useState(data.religionFollow || '');
  const [ethnicity, setEthnicity] = useState('');
  const [nativeState, setNativeState] = useState(data.nativeState || '');
  
  const [story, setStory] = useState(data.story || '');
  
  const [interests, setInterests] = useState<string[]>(data.interests || []);
  
  const [education, setEducation] = useState(data.education || '');
  const [profession, setProfession] = useState(data.workDetails?.company || '');

  const [saving, setSaving] = useState(false);

  // Age calculation
  const getAge = (dob: string) => {
    if (!dob) return '';
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return '';
    const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age.toString();
  };

  const pickImage = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      const newPhotos = [...photos];
      if (index < photos.length) {
        newPhotos[index] = base64Image;
      } else {
        newPhotos.push(base64Image);
      }
      setPhotos(newPhotos);
    }
  };

  const removeInterest = (item: string) => setInterests(interests.filter(i => i !== item));
  const addInterest = () => Alert.alert('Coming Soon', 'List picker for interests will be here in the next PR.');

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        name,
        birthday,
        location,
        height: parseFloat(height) || null,
        religionFollow: religion,
        nativeState,
        story,
        interests,
        education,
        workDetails: { ...data.workDetails, company: profession },
      };
      
      const payload = {
        phoneNumber: data.phoneNumber,
        data: updatedData
      };

      const res = await fetch(`${BACKEND_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // We could also dispatch photos to /api/photos/upload here if they changed.
      // Assuming context updates is sufficient for now for local display
      updateData({ ...updatedData, photos });
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* PHOTOS */}
        <Text style={styles.sectionTitle}>PHOTOS</Text>
        <View style={styles.photoGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TouchableOpacity key={i} style={styles.photoSlot} onPress={() => pickImage(i)}>
              {photos[i] ? (
                <>
                  <Image source={{ uri: photos[i] }} style={styles.photo} />
                  <View style={styles.editIconWrap}>
                    <Ionicons name="pencil" size={12} color={COLORS.white} />
                  </View>
                </>
              ) : (
                <Ionicons name="add" size={28} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.photoSub}>Add up to 6 photos</Text>

        {/* BASIC INFO */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>BASIC INFO</Text>
        <View style={styles.cardGroup}>
          <InputField label="Name" value={name} onChangeText={setName} />
          <InputField label="Age" value={getAge(birthday)} editable={false} />
          <InputField label="City" value={location} onChangeText={setLocation} />
          <InputField label="Height" value={height} onChangeText={setHeight} />
          <InputField label="Religion" value={religion} onChangeText={setReligion} />
          <InputField label="Ethnicity" value={ethnicity} onChangeText={setEthnicity} />
          <InputField label="Native State" value={nativeState} onChangeText={setNativeState} last />
        </View>

        {/* ABOUT ME */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>ABOUT ME</Text>
        <View style={styles.aboutCard}>
          <TextInput
            style={styles.aboutInput}
            multiline
            numberOfLines={4}
            value={story}
            onChangeText={setStory}
            placeholder="Tell us about yourself..."
            placeholderTextColor={COLORS.textSecondary}
            maxLength={300}
          />
          <Text style={styles.charCount}>{story.length}/300</Text>
        </View>

        {/* MY INTERESTS */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>MY INTERESTS</Text>
        <View style={styles.interestsContainer}>
          {interests.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.interestChip} onPress={() => removeInterest(item)}>
              <Text style={styles.interestChipText}>{item}</Text>
              <Ionicons name="close" size={14} color={COLORS.primaryDark} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addInterestBtn} onPress={addInterest}>
            <Ionicons name="add" size={16} color={COLORS.textSecondary} />
            <Text style={styles.addInterestText}>Add Interest</Text>
          </TouchableOpacity>
        </View>

        {/* EDUCATION & WORK */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>EDUCATION & WORK</Text>
        <View style={styles.cardGroup}>
          <InputField label="Education" value={education} onChangeText={setEducation} />
          <InputField label="Profession" value={profession} onChangeText={setProfession} last />
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Footer Save Button */}
      <View style={styles.footer}>
        <CustomButton
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: COLORS.primaryDark }} // Deep purple
        />
      </View>
    </SafeAreaView>
  );
}

// Subcomponent for input fields inside a white card
const InputField = ({ label, value, onChangeText, last, editable = true }: any) => (
  <View style={[styles.inputRow, !last && styles.inputBorder]}>
    <View style={{ flex: 1 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.inputValue, !editable && { color: COLORS.textSecondary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Add ${label}`}
        placeholderTextColor={COLORS.lightGray}
        editable={editable}
      />
    </View>
    {editable && <Ionicons name="pencil" size={18} color={COLORS.lightGray} />}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40'
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark },
  scroll: { padding: SPACING.lg },
  
  sectionTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.md },
  
  // Photos
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' },
  photoSlot: { width: '31%', aspectRatio: 4/5, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  editIconWrap: { position: 'absolute', bottom: 6, right: 6, backgroundColor: COLORS.primaryDark, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  photoSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: SPACING.sm },

  // Card Inputs
  cardGroup: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  inputBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lightGray + '40' },
  inputLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 2 },
  inputValue: { ...TYPOGRAPHY.bodyBold, color: COLORS.text, fontSize: 15, padding: 0 },

  // About Me
  aboutCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  aboutInput: { ...TYPOGRAPHY.body, color: COLORS.text, height: 100, textAlignVertical: 'top' },
  charCount: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'right', marginTop: SPACING.xs },

  // Interests
  interestsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  interestChipText: { ...TYPOGRAPHY.caption, color: COLORS.primaryDark, fontWeight: '600' },
  addInterestBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  addInterestText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: '600', marginLeft: 4 },

  footer: { padding: SPACING.lg, backgroundColor: COLORS.background }
});
