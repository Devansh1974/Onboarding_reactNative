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
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="gender" />
            <Stack.Screen name="name" />
            <Stack.Screen name="home" />
            <Stack.Screen name="admin" />
          </Stack>
        </AdminProvider>
      </OnboardingProvider>
    </GestureHandlerRootView>
  );
}
