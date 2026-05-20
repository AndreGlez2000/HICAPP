import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  maxDate?: Date;
  minDate?: Date;
}

const pad = (n: number) => String(n).padStart(2, '0');

const toIsoDate = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseIsoDate = (value: string): Date | null => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDisplayDate = (value: string): string => {
  const parsed = parseIsoDate(value);
  if (!parsed) return 'Selecciona la fecha';
  return parsed.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export function DatePickerField({
  label,
  value,
  onChange,
  maxDate,
  minDate,
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const pickerValue = useMemo(() => {
    return parseIsoDate(value) ?? maxDate ?? new Date();
  }, [value, maxDate]);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'dismissed') return;
    }

    if (!date) return;
    onChange(toIsoDate(date));
  };

  const displayValue = formatDisplayDate(value);
  const valueClass = value ? 'text-ink' : 'text-muted';

  return (
    <View className="w-full">
      {label ? (
        <Text className="font-nunito-bold text-sm text-ink mb-1.5">{label}</Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <View className="rounded-input bg-surface border border-border px-4 py-3">
          <Text className={`font-nunito text-base ${valueClass}`}>{displayValue}</Text>
          <View className="mt-2">
            <DateTimePicker
              value={pickerValue}
              mode="date"
              display="spinner"
              onChange={handleChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              style={{ alignSelf: 'stretch' }}
            />
          </View>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShow(true)}
            className="h-14 rounded-input bg-surface px-4 border border-border flex-row items-center"
          >
            <Text className={`font-nunito text-base ${valueClass}`}>{displayValue}</Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={pickerValue}
              mode="date"
              display="default"
              onChange={handleChange}
              maximumDate={maxDate}
              minimumDate={minDate}
            />
          )}
        </View>
      )}
    </View>
  );
}
