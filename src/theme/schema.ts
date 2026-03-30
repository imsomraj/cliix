import { z } from "zod";

export const backgroundSchema = z.object({
  page: z.string().min(1),
  surface: z.string().min(1),
  elevated: z.string().min(1),
  inverse: z.string().min(1),
});

export const typographySchema = z.object({
  fontFamily: z.string().min(1),
  headingWeight: z.number().int().min(100).max(900),
  bodyWeight: z.number().int().min(100).max(900),
  textColor: z.string().min(1),
  mutedTextColor: z.string().min(1),
  lineHeight: z.number().min(1),
});

export const buttonSchema = z.object({
  radius: z.number().min(0),
  paddingY: z.number().min(0),
  paddingX: z.number().min(0),
  primaryBg: z.string().min(1),
  primaryText: z.string().min(1),
  secondaryBg: z.string().min(1),
  secondaryText: z.string().min(1),
});

export const accentsSchema = z.object({
  brand: z.string().min(1),
  success: z.string().min(1),
  warning: z.string().min(1),
  danger: z.string().min(1),
  info: z.string().min(1),
});

export const spacingSchema = z.object({
  xs: z.number().min(0),
  sm: z.number().min(0),
  md: z.number().min(0),
  lg: z.number().min(0),
  xl: z.number().min(0),
});

export const bordersShadowsCardsSchema = z.object({
  borderColor: z.string().min(1),
  borderWidth: z.number().min(0),
  cardRadius: z.number().min(0),
  cardShadow: z.string().min(1),
  focusRing: z.string().min(1),
});

export const themeConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  background: backgroundSchema,
  typography: typographySchema,
  buttons: buttonSchema,
  accents: accentsSchema,
  spacing: spacingSchema,
  bordersShadowsCards: bordersShadowsCardsSchema,
});

export type BackgroundConfig = z.infer<typeof backgroundSchema>;
export type TypographyConfig = z.infer<typeof typographySchema>;
export type ButtonConfig = z.infer<typeof buttonSchema>;
export type AccentsConfig = z.infer<typeof accentsSchema>;
export type SpacingConfig = z.infer<typeof spacingSchema>;
export type BordersShadowsCardsConfig = z.infer<typeof bordersShadowsCardsSchema>;
export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export function parseThemeConfig(input: unknown): ThemeConfig {
  return themeConfigSchema.parse(input);
}
