import { create } from "zustand";

export interface Settings {
  apiToken: string;
  ttsVoice: string;
  creditOnly: boolean;
  announcementsEnabled: boolean;
  notificationsEnabled: boolean;
  autostartEnabled: boolean;
}

const defaults: Settings = {
  apiToken: "",
  ttsVoice: "",
  creditOnly: true,
  announcementsEnabled: true,
  notificationsEnabled: true,
  autostartEnabled: false,
};

interface SettingsStore {
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaults,
  setSettings: (s) =>
    set((state) => ({ settings: { ...state.settings, ...s } })),
  setSetting: (key, value) =>
    set((state) => ({ settings: { ...state.settings, [key]: value } })),
}));
