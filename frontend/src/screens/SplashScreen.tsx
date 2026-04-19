import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If video fails to load or user wants a fallback, automatically proceed after 3 seconds
    const fallbackTimer = setTimeout(() => {
      finishSplash();
    }, 4000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const finishSplash = () => {
    if (!isReady) {
      setIsReady(true);
      // Navigate to the welcome screen
      router.replace('/welcome'); 
    }
  };

  return (
    <View style={styles.container}>
      {/* 
        You will need to place your 'logo_animation.mp4' in frontend/assets/ 
        Uncomment the below Video component after placing the file.
      */}
      <View style={styles.videoContainer}>
        <Text style={styles.placeholderText}>Wingmann</Text>
        <Text style={styles.subText}>(Video Animation Placeholder)</Text>
        
        {/* 
        <Video
          source={require('../../assets/logo_animation.mp4')}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              finishSplash();
            }
          }}
        />
        */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  videoContainer: { width: width, height: height, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  video: { width: width, height: height, position: 'absolute' },
  placeholderText: { ...TYPOGRAPHY.h1, color: COLORS.primaryDark, fontSize: 40, fontStyle: 'italic' },
  subText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 10 }
});
