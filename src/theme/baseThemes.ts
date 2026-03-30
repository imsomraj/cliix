import type { ThemeConfig } from "./schema";
import { parseThemeConfig } from "./schema";

export const BASE_THEMES: ThemeConfig[] = [
  {
    id: "prd-light",
    name: "PRD Light",
    background: {
      page: "#f8fafc",
      surface: "#ffffff",
      elevated: "#f1f5f9",
      inverse: "#0f172a",
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
      textColor: "#0f172a",
      mutedTextColor: "#475569",
      lineHeight: 1.5,
    },
    buttons: {
      radius: 10,
      paddingY: 10,
      paddingX: 16,
      primaryBg: "#2563eb",
      primaryText: "#ffffff",
      secondaryBg: "#dbeafe",
      secondaryText: "#1e3a8a",
    },
    accents: {
      brand: "#2563eb",
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      info: "#0ea5e9",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    bordersShadowsCards: {
      borderColor: "#cbd5e1",
      borderWidth: 1,
      cardRadius: 14,
      cardShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
      focusRing: "0 0 0 3px rgba(37, 99, 235, 0.35)",
    },
  },
  {
    id: "trd-dark",
    name: "TRD Dark",
    background: {
      page: "#020617",
      surface: "#0f172a",
      elevated: "#1e293b",
      inverse: "#f8fafc",
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
      textColor: "#e2e8f0",
      mutedTextColor: "#94a3b8",
      lineHeight: 1.5,
    },
    buttons: {
      radius: 10,
      paddingY: 10,
      paddingX: 16,
      primaryBg: "#38bdf8",
      primaryText: "#082f49",
      secondaryBg: "#334155",
      secondaryText: "#f8fafc",
    },
    accents: {
      brand: "#38bdf8",
      success: "#4ade80",
      warning: "#fbbf24",
      danger: "#f87171",
      info: "#22d3ee",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    bordersShadowsCards: {
      borderColor: "#334155",
      borderWidth: 1,
      cardRadius: 14,
      cardShadow: "0 8px 24px rgba(2, 6, 23, 0.65)",
      focusRing: "0 0 0 3px rgba(56, 189, 248, 0.4)",
    },
  },
].map(parseThemeConfig);

export function getBaseTheme(id: string): ThemeConfig | undefined {
  return BASE_THEMES.find((theme) => theme.id === id);
}
