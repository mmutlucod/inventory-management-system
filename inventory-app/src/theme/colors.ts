export const lightColors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#3B82F6',
  
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#34D399',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#111827',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F3F4F6',
  
  stockHigh: '#10B981',
  stockMedium: '#F59E0B',
  stockLow: '#EF4444',
  stockOut: '#DC2626',
  
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const darkColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  primaryLight: '#60A5FA',
  
  secondary: '#34D399',
  secondaryDark: '#10B981',
  secondaryLight: '#6EE7B7',
  
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  background: '#111827',
  surface: '#1F2937',
  card: '#374151',
  
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textDisabled: '#6B7280',
  
  border: '#4B5563',       
  borderLight: '#374151',   
  divider: '#374151',
  
  stockHigh: '#34D399',
  stockMedium: '#FBBF24',
  stockLow: '#F87171',
  stockOut: '#DC2626',
  
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export type ColorScheme = 'light' | 'dark';
export type Colors = typeof lightColors;