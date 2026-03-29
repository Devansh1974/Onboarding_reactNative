import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
    setDay(val);
    if (val && month && year) {
      onChange(`${year}-${month.padStart(2, '0')}-${val.padStart(2, '0')}`);
    }
  };

  const handleMonthChange = (val: string) => {
    setMonth(val);
    if (day && val && year) {
      onChange(`${year}-${val.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    if (day && month && val) {
      onChange(`${val}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>DD</Text>
          <TouchableOpacity style={styles.input}>
            <Text style={styles.inputText}>{day || 'DD'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>MM</Text>
          <TouchableOpacity style={styles.input}>
            <Text style={styles.inputText}>{month || 'MM'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.placeholder}>YYYY</Text>
          <TouchableOpacity style={styles.input}>
            <Text style={styles.inputText}>{year || 'YYYY'}</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
});