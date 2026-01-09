import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorScheme } from '@theme/colors';

type Language = 'tr' | 'en';

interface SettingsState {
  colorScheme: ColorScheme;
  useSystemTheme: boolean;
  language: Language;
  autoSync: boolean;
  syncInterval: number;
  
  setColorScheme: (scheme: ColorScheme) => void;
  setUseSystemTheme: (use: boolean) => void;
  setLanguage: (lang: Language) => void;
  setAutoSync: (enabled: boolean) => void;
  setSyncInterval: (minutes: number) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      colorScheme: 'light',
      useSystemTheme: true,
      language: 'tr',
      autoSync: true,
      syncInterval: 15,
      
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      setUseSystemTheme: (use) => set({ useSystemTheme: use }),
      setLanguage: (lang) => set({ language: lang }),
      setAutoSync: (enabled) => set({ autoSync: enabled }),
      setSyncInterval: (minutes) => set({ syncInterval: minutes }),
      
      toggleTheme: () => {
        const current = get().colorScheme;
        set({ colorScheme: current === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        useSystemTheme: state.useSystemTheme,
        language: state.language,
        autoSync: state.autoSync,
        syncInterval: state.syncInterval,
      }),
    }
  )
);