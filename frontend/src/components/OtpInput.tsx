import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../constants/theme';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  value: string;
  onChange: (otp: string) => void;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  value,
  onChange,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    // Auto focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (value.length === length) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    const cleanText = text.replace(/[^0-9]/g, '');
    
    if (cleanText.length > 1) {
      // Handle paste
      const pastedOtp = cleanText.slice(0, length);
      onChange(pastedOtp);
      
      // Focus the last filled box or the next empty one
      const nextIndex = Math.min(pastedOtp.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Update value
    const newValue = value.split('');
    newValue[index] = cleanText;
    const newOtp = newValue.join('');
    onChange(newOtp);

    // Auto focus next input
    if (cleanText && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <OtpBox
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          isFocused={focusedIndex === index}
        />
      ))}
    </View>
  );
};

interface OtpBoxProps {
  value: string;
  onChangeText: (text: string) => void;
  onKeyPress: (e: any) => void;
  onFocus: () => void;
  isFocused: boolean;
}

const OtpBox = React.forwardRef<TextInput, OtpBoxProps>(
  ({ value, onChangeText, onKeyPress, onFocus, isFocused }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    useEffect(() => {
      if (isFocused) {
        scale.value = withSpring(1.05);
      } else {
        scale.value = withSpring(1);
      }
    }, [isFocused]);

    return (
      <Animated.View style={[styles.boxContainer, animatedStyle]}>
        <TextInput
          ref={ref}
          style={[
            styles.box,
            isFocused && styles.boxFocused,
            value && styles.boxFilled,
          ]}
          maxLength={1}
          keyboardType="number-pad"
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          value={value}
          selectTextOnFocus
        />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SPACING.md,
  },
  boxContainer: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  box: {
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  boxFocused: {
    borderColor: COLORS.primary,
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
});
