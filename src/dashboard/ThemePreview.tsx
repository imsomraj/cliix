import type { ThemeConfig } from "../theme/schema";
import { renderTheme } from "../theme/renderer";

type ThemePreviewProps = {
  theme: ThemeConfig;
};

export function ThemePreview({ theme }: ThemePreviewProps) {
  const { style } = renderTheme(theme);

  return (
    <section style={{ ...style, background: "var(--theme-bg-page)", padding: "var(--theme-space-lg)" }}>
      <article
        style={{
          background: "var(--theme-bg-surface)",
          color: "var(--theme-text-color)",
          border: "var(--theme-border-width) solid var(--theme-border-color)",
          borderRadius: "var(--theme-card-radius)",
          boxShadow: "var(--theme-card-shadow)",
          padding: "var(--theme-space-lg)",
          fontFamily: "var(--theme-font-family)",
          lineHeight: "var(--theme-line-height)",
        }}
      >
        <h3 style={{ marginBottom: "var(--theme-space-sm)", fontWeight: "var(--theme-heading-weight)" }}>
          Theme Preview
        </h3>
        <p style={{ color: "var(--theme-muted-text-color)", marginBottom: "var(--theme-space-md)" }}>
          This preview uses the shared renderer utility to match public pages exactly.
        </p>
        <div style={{ display: "flex", gap: "var(--theme-space-sm)" }}>
          <button
            type="button"
            style={{
              background: "var(--theme-button-primary-bg)",
              color: "var(--theme-button-primary-text)",
              border: "none",
              borderRadius: "var(--theme-button-radius)",
              padding: "var(--theme-button-padding-y) var(--theme-button-padding-x)",
            }}
          >
            Primary
          </button>
          <button
            type="button"
            style={{
              background: "var(--theme-button-secondary-bg)",
              color: "var(--theme-button-secondary-text)",
              border: "none",
              borderRadius: "var(--theme-button-radius)",
              padding: "var(--theme-button-padding-y) var(--theme-button-padding-x)",
            }}
          >
            Secondary
          </button>
        </div>
      </article>
    </section>
  );
}
