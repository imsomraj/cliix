import { useEffect, useMemo, useState } from "react";
import { BASE_THEMES, getBaseTheme } from "../theme/baseThemes";
import type { ThemeConfig } from "../theme/schema";
import { parseThemeConfig } from "../theme/schema";

export type UserThemeRecord = {
  userId: string;
  themeId: string;
  config_json: ThemeConfig;
};

export async function persistUserThemeConfig(record: UserThemeRecord): Promise<void> {
  await fetch(`/api/users/${record.userId}/theme`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });
}

export function useUserThemeConfig(userId: string, initialThemeId = BASE_THEMES[0].id) {
  const [themeId, setThemeId] = useState(initialThemeId);
  const [config, setConfig] = useState<ThemeConfig>(BASE_THEMES[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const base = getBaseTheme(themeId);
    if (base) {
      setConfig(base);
    }
  }, [themeId]);

  const canSave = useMemo(() => Boolean(userId && config), [userId, config]);

  async function saveThemeConfig() {
    if (!canSave) {
      return;
    }
    setIsSaving(true);
    try {
      const payload: UserThemeRecord = {
        userId,
        themeId,
        config_json: parseThemeConfig(config),
      };
      await persistUserThemeConfig(payload);
    } finally {
      setIsSaving(false);
    }
  }

  return {
    themeId,
    setThemeId,
    config,
    setConfig,
    isSaving,
    saveThemeConfig,
    availableThemes: BASE_THEMES,
  };
}
