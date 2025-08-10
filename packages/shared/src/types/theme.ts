import { z } from 'zod';

export const ThemeSchema = z.enum(['light', 'dark', 'auto']);

export const ColorSchemeSchema = z.object({
  // Base colors
  background: z.string(),
  foreground: z.string(),
  
  // Surface colors (glassmorphism)
  surface: z.string(),
  surfaceHover: z.string(),
  surfaceActive: z.string(),
  
  // Border colors
  border: z.string(),
  borderHover: z.string(),
  
  // Text colors
  text: z.string(),
  textMuted: z.string(),
  textInverse: z.string(),
  
  // Gaming-specific colors
  bitcoin: z.string(),
  lightning: z.string(),
  achievement: z.string(),
  rare: z.string(),
  legendary: z.string(),
  
  // Status colors
  success: z.string(),
  warning: z.string(),
  error: z.string(),
  info: z.string(),
  
  // Interactive colors
  primary: z.string(),
  primaryHover: z.string(),
  secondary: z.string(),
  secondaryHover: z.string(),
  
  // Glass effects
  glass: z.object({
    background: z.string(),
    border: z.string(),
    blur: z.string(),
    opacity: z.string()
  })
});

export const ThemeConfigSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  type: ThemeSchema,
  colors: ColorSchemeSchema,
  fonts: z.object({
    sans: z.string(),
    mono: z.string(),
    display: z.string()
  }),
  spacing: z.object({
    xs: z.string(),
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    '2xl': z.string()
  }),
  borderRadius: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    full: z.string()
  }),
  shadows: z.object({
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    glass: z.string()
  }),
  animations: z.object({
    fast: z.string(),
    normal: z.string(),
    slow: z.string()
  })
});

export type Theme = z.infer<typeof ThemeSchema>;
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;
