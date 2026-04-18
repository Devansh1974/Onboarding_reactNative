import React from 'react';
import { Stack } from 'expo-router';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="emotional" />
      <Stack.Screen name="attachment" />
      <Stack.Screen name="conflict" />
      <Stack.Screen name="growth" />
      <Stack.Screen name="quiz-complete" />
      <Stack.Screen name="completion-60" />
    </Stack>
  );
}
