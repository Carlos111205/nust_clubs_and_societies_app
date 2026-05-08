// NUST Clubs & Societies - Design Tokens

export const Colors = {
  // Primary
  primary: '#FFD700',       // NUST Gold
  primaryDark: '#C9A800',
  primaryLight: '#FFE84D',

  // Backgrounds
  background: '#070D1A',
  surface: '#0F1A2E',
  surfaceAlt: '#162035',
  surfaceCard: '#1A2640',
  surfaceBorder: '#243050',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#8A9BBE',
  textMuted: '#4A5A7A',
  textOnPrimary: '#070D1A',

  // Semantic
  success: '#22D76A',
  warning: '#FFAA00',
  error: '#FF4D6A',
  info: '#4DA6FF',

  // Category accents
  academic: '#4DA6FF',
  sports: '#22D76A',
  arts: '#FF6BA8',
  tech: '#9B6BFF',
  cultural: '#FF9B3D',
  social: '#3DDCFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  body: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  hero: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
