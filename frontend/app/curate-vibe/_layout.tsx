import { Stack } from 'expo-router';
import { COLORS } from '../../src/constants/theme';

export default function CurateVibeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
