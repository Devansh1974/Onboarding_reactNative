import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../constants/theme';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  React.useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth(parts[1]);
        setDay(parts[2]);
      }
    }
  }, [value]);

  const handleDayChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(cleanVal);
    if (cleanVal && month && year && cleanVal.length === 2) {
      onChange(`${year}-${month.padStart(2, '0')}-${cleanVal.padStart(2, '0')}`);
    }
  };

  const handleMonthChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(cleanVal);
    if (day && cleanVal && year && cleanVal.length === 2) {
      onChange(`${year}-${cleanVal.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  const handleYearChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(cleanVal);
    if (day && month && cleanVal && cleanVal.length === 4) {
      onChange(`${cleanVal}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>DD</Text>
          <TextInput
            style={styles.input}
            value={day}
            onChangeText={handleDayChange}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="DD"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>MM</Text>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={handleMonthChange}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="MM"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>YYYY</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={handleYearChange}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="YYYY"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>
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
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  placeholder: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingHorizontal: SPACING.sm,
  },
});
