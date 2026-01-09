import { lightColors, darkColors, type ColorScheme } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export const getTheme = (colorScheme: ColorScheme) => ({
  colors: colorScheme === 'dark' ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
  isDark: colorScheme === 'dark',
});

export type Theme = ReturnType<typeof getTheme>;

export { lightColors, darkColors, typography, spacing, borderRadius };
export type { ColorScheme };