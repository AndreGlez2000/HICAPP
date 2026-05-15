import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Stepper({ value, onChange, min = 0, max = 99 }: StepperProps) {
  return (
    <View className="flex-row items-center bg-surface border border-border rounded-pill px-1.5 py-1.5 self-start">
      <TouchableOpacity
        onPress={() => onChange(Math.max(min, value - 1))}
        activeOpacity={0.75}
        className="w-9 h-9 rounded-full bg-[#f5eef2] items-center justify-center"
      >
        <Text className="text-primary font-nunito-bold text-lg leading-none">−</Text>
      </TouchableOpacity>

      <Text className="font-fredoka text-ink text-xl min-w-[30px] text-center mx-3">
        {value}
      </Text>

      <TouchableOpacity
        onPress={() => onChange(Math.min(max, value + 1))}
        activeOpacity={0.75}
        className="w-9 h-9 rounded-full bg-[#f5eef2] items-center justify-center"
      >
        <Text className="text-primary font-nunito-bold text-lg leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );
}
