/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Matches the PrayFit brand (prayfit.org): #2D3940 is the exact color sampled
 * from the official logo vector (assets/brand/prayfit-logo.ai), bold condensed
 * headlines, black-and-white/monochrome UI with a single dark charcoal-navy
 * accent — no bright "app blue."
 */
export const Colors = {
  light: {
    text: '#1B1F23',
    background: '#ffffff',
    backgroundElement: '#EEF0F2',
    backgroundSelected: '#DCE1E6',
    textSecondary: '#5B6470',
    primary: '#2D3940',
    onPrimary: '#ffffff',
    success: '#1E9E5A',
    successBackground: '#E4F7EC',
    danger: '#D0392B',
    dangerBackground: '#FBEAE8',
    border: '#D7DBDF',
  },
  dark: {
    text: '#F5F6F7',
    background: '#12151A',
    backgroundElement: '#1E242B',
    backgroundSelected: '#2A323B',
    textSecondary: '#9AA3AC',
    primary: '#8FA0AC',
    onPrimary: '#12151A',
    success: '#3FCE85',
    successBackground: '#0F2B1D',
    danger: '#FF6B5E',
    dangerBackground: '#331311',
    border: '#2C333B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Bold condensed display face for brand headline moments (title, streak, score) — loaded via expo-font in _layout.tsx. */
export const DISPLAY_FONT = 'Anton_400Regular';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    display: DISPLAY_FONT,
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    display: DISPLAY_FONT,
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
    display: DISPLAY_FONT,
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
