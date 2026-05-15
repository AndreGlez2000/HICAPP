import React from 'react';
import {
  TouchableOpacity,
  Text,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';

type ButtonVariant = 'cta' | 'primary' | 'outline' | 'ghost';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const variantContainerClass: Record<ButtonVariant, string> = {
  cta: 'bg-cta',
  primary: 'bg-primary',
  outline: 'bg-surface border border-primary',
  ghost: 'bg-transparent',
};

const variantTextClass: Record<ButtonVariant, string> = {
  cta: 'text-white',
  primary: 'text-white',
  outline: 'text-primary',
  ghost: 'text-primary',
};

export function Button({
  variant = 'cta',
  children,
  disabled = false,
  onPress,
  style,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
      className={[
        'h-14 rounded-pill items-center justify-center px-7 w-full flex-row',
        variantContainerClass[variant],
        disabled ? 'opacity-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...props}
    >
      <Text
        className={[
          'font-nunito-bold text-base',
          variantTextClass[variant],
        ].join(' ')}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
