import { useMemo } from "react";
import { ThemePreview } from "./ThemePreview";
import { useUserThemeConfig } from "./useUserThemeConfig";

type ThemeCustomizationPanelProps = {
  userId: string;
};

export function ThemeCustomizationPanel({ userId }: ThemeCustomizationPanelProps) {
  const { availableThemes, themeId, setThemeId, config, setConfig, saveThemeConfig, isSaving } =
    useUserThemeConfig(userId);

  const selectedThemeName = useMemo(
    () => availableThemes.find((theme) => theme.id === themeId)?.name ?? themeId,
    [availableThemes, themeId],
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <header>
        <h2>Theme Settings</h2>
        <p>Choose a base theme and customize accent colors. Saved values persist in user config_json.</p>
      </header>

      <label>
        Base Theme
        <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
          {availableThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend>{selectedThemeName} customization</legend>
        <label>
          Brand Accent
          <input
            type="color"
            value={config.accents.brand}
            onChange={(event) =>
              setConfig((current) => ({ ...current, accents: { ...current.accents, brand: event.target.value } }))
            }
          />
        </label>
        <label>
          Surface Background
          <input
            type="color"
            value={config.background.surface}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                background: { ...current.background, surface: event.target.value },
              }))
            }
          />
        </label>
      </fieldset>

      <button type="button" onClick={saveThemeConfig} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Theme"}
      </button>

      <ThemePreview theme={config} />
    </div>
  );
}
