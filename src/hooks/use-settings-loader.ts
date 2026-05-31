import { useEffect } from "react";
import { load } from "@tauri-apps/plugin-store";
import { useSettingsStore } from "@/stores/settings";
import type { Settings } from "@/stores/settings";

export function useSettingsLoader() {
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const store = await load("settings.json", { defaults: {} });
        const partial: Partial<Settings> = {};

        const apiToken = await store.get<string>("api_token");
        if (apiToken !== undefined && apiToken !== null) partial.apiToken = apiToken;

        const ttsVoice = await store.get<string>("tts_voice");
        if (ttsVoice !== undefined && ttsVoice !== null) partial.ttsVoice = ttsVoice;

        const creditOnly = await store.get<boolean>("credit_only");
        if (creditOnly !== undefined && creditOnly !== null) partial.creditOnly = creditOnly;

        const announcementsEnabled = await store.get<boolean>("announcements_enabled");
        if (announcementsEnabled !== undefined && announcementsEnabled !== null)
          partial.announcementsEnabled = announcementsEnabled;

        const notificationsEnabled = await store.get<boolean>("notifications_enabled");
        if (notificationsEnabled !== undefined && notificationsEnabled !== null)
          partial.notificationsEnabled = notificationsEnabled;

        const autostartEnabled = await store.get<boolean>("autostart_enabled");
        if (autostartEnabled !== undefined && autostartEnabled !== null)
          partial.autostartEnabled = autostartEnabled;

        setSettings(partial);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }

    loadSettings();
  }, [setSettings]);
}
