import React from 'react';
import { View, Text } from 'react-native';

type BadgeTone = 'success' | 'cta' | 'primary' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: 'bg-[#e8f8f4]', fg: 'text-success' },
  cta: { bg: 'bg-[#fdf0e8]', fg: 'text-cta' },
  primary: { bg: 'bg-[#f5eef2]', fg: 'text-primary' },
  blue: { bg: 'bg-[#eaf1fb]', fg: 'text-[#3560a0]' },
};

export function Badge({ children, tone = 'success' }: BadgeProps) {
  const { bg, fg } = toneClasses[tone];
  return (
    <View
      className={`inline-flex flex-row items-center rounded-pill px-3 py-1.5 ${bg}`}
    >
      <Text className={`font-nunito-bold text-xs ${fg}`}>{children}</Text>
    </View>
  );
}
