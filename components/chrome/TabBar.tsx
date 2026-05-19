import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../primitives/Icon';

const TABS = [
  { name: 'metas', label: 'Metas', icon: 'Target', path: '/(tabs)/metas' },
  { name: 'dia', label: 'Día', icon: 'Sun', path: '/(tabs)/dia' },
  { name: 'fotos', label: 'Fotos', icon: 'Camera', path: '/(tabs)/fotos' },
  { name: 'perfil', label: 'Perfil', icon: 'User', path: '/(tabs)/perfil' },
] as const;

export function TabBar(_props: BottomTabBarProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="w-full bg-surface border-t border-border flex-row justify-around items-start flex-shrink-0"
      style={{ paddingTop: 12, paddingBottom: insets.bottom + 8 }}
    >
      {TABS.map((tab) => {
        const isActive = pathname.includes(tab.name);
        const color = isActive ? '#e87a3f' : '#70787c';

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.path)}
            activeOpacity={0.75}
            className="flex-col items-center gap-1"
          >
            <Icon name={tab.icon} size={24} color={color} />
            <Text
              className="font-nunito-bold text-xs"
              style={{ color }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
