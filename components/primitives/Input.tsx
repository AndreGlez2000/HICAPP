import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  suffix?: string;
}

export function Input({ label, error, suffix, value, ...props }: InputProps) {
  const hasFocus = Boolean(value);

  return (
    <View className="w-full">
      {label && (
        <Text className="font-nunito-bold text-sm text-ink mb-1.5">{label}</Text>
      )}

      <View className="relative">
        <TextInput
          value={value}
          className={[
            'h-14 rounded-input bg-surface px-4 text-base font-nunito text-ink',
            'border',
            error
              ? 'border-red-500'
              : hasFocus
              ? 'border-primary'
              : 'border-border',
          ].join(' ')}
          placeholderTextColor="#70787c"
          {...props}
        />
        {suffix && (
          <Text className="absolute right-4 top-4 text-muted font-nunito-bold">
            {suffix}
          </Text>
        )}
      </View>

      {error && (
        <Text className="font-nunito text-xs text-red-600 mt-1">{error}</Text>
      )}
    </View>
  );
}
