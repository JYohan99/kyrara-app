import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  // Bases y Superficies (Obsidian / Dark Studio)
  background: '#101415',
  surface: '#101415',
  surfaceContainerLowest: '#0b0f10',
  surfaceContainerLow: '#181c1d',
  surfaceContainer: '#1c2021',
  surfaceContainerHigh: '#272b2c',
  surfaceContainerHighest: '#313536',

  // Acentos Primarios (Violeta Eléctrico)
  primary: '#8a4fff',
  primaryLight: '#d1bcff',
  primaryDim: '#712fe5',
  primaryDark: '#3d008f',

  // Acentos Secundarios (Cyan Eléctrico)
  secondary: '#00d2ff',
  secondaryLight: '#a5e7ff',
  secondaryDim: '#55d8e9',
  secondaryDark: '#003543',

  // Textos y Contenido
  textPrimary: '#e0e3e4',
  textSecondary: '#ccc3d8',
  textMuted: '#958da1',

  // Bordes y Divisores
  border: '#313536',
  borderSubtle: '#272b2c',
  outline: '#4a4455',

  // Estados Funcionales
  success: '#059669',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  errorDark: '#690005',
} as const;

export const Colors = {
  light: {
    text: Palette.textPrimary,
    background: Palette.background,
    backgroundElement: Palette.surfaceContainer,
    backgroundSelected: Palette.surfaceContainerHigh,
    textSecondary: Palette.textMuted,
    primary: Palette.primary,
    secondary: Palette.secondary,
    border: Palette.border,
    card: Palette.surfaceContainer,
  },
  dark: {
    text: Palette.textPrimary,
    background: Palette.background,
    backgroundElement: Palette.surfaceContainer,
    backgroundSelected: Palette.surfaceContainerHigh,
    textSecondary: Palette.textMuted,
    primary: Palette.primary,
    secondary: Palette.secondary,
    border: Palette.border,
    card: Palette.surfaceContainer,
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  card: 20,
  pill: 9999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
