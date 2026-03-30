export const lightModeTokens = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f9',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  border: '#dbe4ee',
  borderStrong: '#cbd5e1',
  accent: '#2563eb',
  accentSoft: '#dbeafe',
  success: '#15803d',
  warning: '#b45309',
  danger: '#b91c1c',
  shadow: '0 8px 28px rgba(15, 23, 42, 0.06)',
} as const;

export type LightModeToken = keyof typeof lightModeTokens;
