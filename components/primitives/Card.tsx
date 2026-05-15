import React from 'react';
import { View, type ViewStyle, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  gradient?: string[];
  style?: ViewStyle;
}

export function Card({
  children,
  padded = true,
  gradient,
  style,
  ...props
}: CardProps) {
  const containerClasses = [
    'rounded-card bg-surface',
    padded ? 'p-4' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (gradient && gradient.length >= 2) {
    return (
      <LinearGradient
        colors={gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={containerClasses}
        style={style}
        {...(props as any)}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View className={containerClasses} style={style} {...props}>
      {children}
    </View>
  );
}
