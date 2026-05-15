import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: string;
  size?: number;
  color?: string;
}

/**
 * Wraps lucide-react-native icons.
 * Accepts icon name as string — unknown names fall back to HelpCircle.
 */
export function Icon({ name, size = 22, color = '#0f172a', ...props }: IconProps) {
  // Convert kebab-case or camelCase name to PascalCase for lucide lookup
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const LucideIcon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[pascalName];

  if (!LucideIcon) {
    return <LucideIcons.HelpCircle size={size} color={color} {...props} />;
  }

  return <LucideIcon size={size} color={color} {...props} />;
}
