import { create } from 'zustand';
import { Setting } from '@lib/types/settings.types';
import { settingsApi } from '@lib/api/settings.api';

interface SettingsState {
    settings: Setting | null;
    isLoading: boolean;
    error: string | null;
    fetchSettings: (force?: boolean) => Promise<void>;
    setSettings: (settings: Setting) => void;
}

let fetchSettingsPromise: Promise<void> | null = null;

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: null,
    isLoading: false,
    error: null,
    fetchSettings: async (force = false) => {
        // Only fetch if not already present or if forced, simple caching
        if (!force && get().settings) return;

        // On homepage, the /home-data API completely fetches settings. 
        // Skip individual fetch to prevent duplicate requests.
        if (!force && typeof window !== 'undefined' && window.location.pathname === '/') return;

        // Protect against concurrent client-side fetches creating 429 errors
        if (!force && fetchSettingsPromise)
        {
            return fetchSettingsPromise;
        }

        const promise = (async () => {
            set({ isLoading: true, error: null });
            try
            {
                const data = await settingsApi.getSettings();
                set({ settings: data, isLoading: false });
            } catch (error: any)
            {
                console.error("[Settings Store] Client fetch failed:", error);
                set({ error: error.message || 'Failed to fetch settings', isLoading: false });
            } finally
            {
                fetchSettingsPromise = null;
            }
        })();

        if (!force)
        {
            fetchSettingsPromise = promise;
        }

        return promise;
    },
    setSettings: (settings: Setting) => set({ settings }),
}));
