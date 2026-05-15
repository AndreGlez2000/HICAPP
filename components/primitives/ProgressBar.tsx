import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
  value: number;      // current value (0–max)
  max?: number;       // default 100
  color?: string;     // fill color, default success green
}

export function ProgressBar({ value, max = 100, color = '#19b78e' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <View className="h-2.5 bg-border rounded-pill overflow-hidden w-full">
      <View
        className="h-full rounded-pill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </View>
  );
}
