import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../constants/theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
          placeholderTextColor={COLORS.textSecondary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    height: '100%',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  leftIcon: {
    paddingLeft: SPACING.md,
  },
  rightIcon: {
    paddingRight: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
