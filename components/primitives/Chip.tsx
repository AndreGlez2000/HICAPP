import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  fullWidth?: boolean;
}

export function Chip({
  children,
  selected = false,
  onSelect,
  fullWidth = false,
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.75}
      className={[
        'py-3 px-4 rounded-pill border items-center justify-center',
        selected
          ? 'bg-primary border-primary'
          : 'bg-surface border-border',
        fullWidth ? 'flex-1' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Text
        className={[
          'font-nunito-bold text-sm',
          selected ? 'text-white' : 'text-ink',
        ].join(' ')}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
