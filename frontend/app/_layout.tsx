import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import { AdminProvider } from '../src/context/AdminContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OnboardingProvider>
        <AdminProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 200,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="gender" />
            <Stack.Screen name="name" />
            <Stack.Screen name="home" />
            <Stack.Screen name="compatibility-quiz" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="upload-photos" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="legal-safety" />
            <Stack.Screen name="delete-account" />
            <Stack.Screen name="notifications" />
          </Stack>
        </AdminProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}
