import type { CSSProperties } from "react";
import type { ThemeConfig } from "./schema";

export type RenderedTheme = {
  cssVariables: Record<string, string>;
  style: CSSProperties;
};

function toPx(value: number): string {
  return `${value}px`;
}

export function renderTheme(theme: ThemeConfig): RenderedTheme {
  const cssVariables: Record<string, string> = {
    "--theme-bg-page": theme.background.page,
    "--theme-bg-surface": theme.background.surface,
    "--theme-bg-elevated": theme.background.elevated,
    "--theme-bg-inverse": theme.background.inverse,
    "--theme-font-family": theme.typography.fontFamily,
    "--theme-text-color": theme.typography.textColor,
    "--theme-muted-text-color": theme.typography.mutedTextColor,
    "--theme-line-height": `${theme.typography.lineHeight}`,
    "--theme-heading-weight": `${theme.typography.headingWeight}`,
    "--theme-body-weight": `${theme.typography.bodyWeight}`,
    "--theme-button-radius": toPx(theme.buttons.radius),
    "--theme-button-padding-y": toPx(theme.buttons.paddingY),
    "--theme-button-padding-x": toPx(theme.buttons.paddingX),
    "--theme-button-primary-bg": theme.buttons.primaryBg,
    "--theme-button-primary-text": theme.buttons.primaryText,
    "--theme-button-secondary-bg": theme.buttons.secondaryBg,
    "--theme-button-secondary-text": theme.buttons.secondaryText,
    "--theme-accent-brand": theme.accents.brand,
    "--theme-accent-success": theme.accents.success,
    "--theme-accent-warning": theme.accents.warning,
    "--theme-accent-danger": theme.accents.danger,
    "--theme-accent-info": theme.accents.info,
    "--theme-space-xs": toPx(theme.spacing.xs),
    "--theme-space-sm": toPx(theme.spacing.sm),
    "--theme-space-md": toPx(theme.spacing.md),
    "--theme-space-lg": toPx(theme.spacing.lg),
    "--theme-space-xl": toPx(theme.spacing.xl),
    "--theme-border-color": theme.bordersShadowsCards.borderColor,
    "--theme-border-width": toPx(theme.bordersShadowsCards.borderWidth),
    "--theme-card-radius": toPx(theme.bordersShadowsCards.cardRadius),
    "--theme-card-shadow": theme.bordersShadowsCards.cardShadow,
    "--theme-focus-ring": theme.bordersShadowsCards.focusRing,
  };

  const style = cssVariables as CSSProperties;
  return { cssVariables, style };
}
