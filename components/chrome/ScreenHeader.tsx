import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../primitives/Icon';

interface ScreenHeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: React.ReactNode;
  dark?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = false,
  right,
  dark = false,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const titleColor = dark ? 'text-white' : 'text-primary';
  const subtitleColor = dark ? 'text-white/70' : 'text-muted';

  return (
    <View 
      className="flex-row items-start justify-between px-6 pb-4 gap-3 flex-shrink-0"
      style={{ paddingTop: Math.max(insets.top + 16, 48) }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {showBack && onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.75}
            className="w-10 h-10 rounded-full bg-[#f5eef2] items-center justify-center flex-shrink-0"
          >
            <Icon name="arrow-left" size={20} color="#522c45" />
          </TouchableOpacity>
        )}

        <View className="min-w-0 flex-1 justify-center">
          {typeof title === 'string' ? (
            <Text
              className={`font-fredoka text-[28px] leading-tight ${titleColor}`}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )}
          {subtitle && (
            <Text className={`font-nunito text-sm mt-0.5 ${subtitleColor}`}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {right && <View className="flex-shrink-0">{right}</View>}
    </View>
  );
}
