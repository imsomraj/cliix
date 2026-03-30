import type { ThemeConfig } from "../theme/schema";
import { renderTheme } from "../theme/renderer";

type PublicPageProps = {
  theme: ThemeConfig;
  title: string;
  description: string;
};

export function PublicPage({ theme, title, description }: PublicPageProps) {
  const { style } = renderTheme(theme);

  return (
    <main
      style={{
        ...style,
        minHeight: "100vh",
        background: "var(--theme-bg-page)",
        color: "var(--theme-text-color)",
        fontFamily: "var(--theme-font-family)",
        padding: "var(--theme-space-xl)",
      }}
    >
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "var(--theme-bg-surface)",
          borderRadius: "var(--theme-card-radius)",
          border: "var(--theme-border-width) solid var(--theme-border-color)",
          boxShadow: "var(--theme-card-shadow)",
          padding: "var(--theme-space-xl)",
        }}
      >
        <h1 style={{ marginBottom: "var(--theme-space-sm)" }}>{title}</h1>
        <p style={{ color: "var(--theme-muted-text-color)" }}>{description}</p>
      </section>
    </main>
  );
}
