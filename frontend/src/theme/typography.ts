import { Platform } from 'react-native';

// Simple, Apple-like system typography:
// - iOS uses San Francisco via 'System'
// - Web uses -apple-system stack
// - Android uses Roboto
export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  default: 'System',
});

export const typography = {
  title: {
    fontFamily,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headline: {
    fontFamily,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily,
    fontWeight: '500' as const,
  },
  caption: {
    fontFamily,
    fontWeight: '500' as const,
  },
  button: {
    fontFamily,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },
};
