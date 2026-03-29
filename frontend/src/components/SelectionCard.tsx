import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../constants/theme';

interface SelectionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  icon,
  selected,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  React.useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.02);
    } else {
      scale.value = withSpring(1);
    }
  }, [selected]);

  return (
    <AnimatedTouchable
      style={[
        styles.card,
        selected && styles.cardSelected,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Ionicons
          name={icon}
          size={48}
          color={selected ? COLORS.white : COLORS.primary}
        />
      </View>
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  cardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.white + '30',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  titleSelected: {
    color: COLORS.white,
  },
});
