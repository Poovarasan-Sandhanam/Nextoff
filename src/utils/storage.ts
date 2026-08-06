import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '@/types';

const SETTINGS_KEY = 'nextoff_user_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  region: 'ew',
  paydayConfig: {
    type: 'fixed',
    fixedDay: 25
  },
  notificationsEnabled: false
};

export async function loadSettings(): Promise<UserSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        paydayConfig: {
          ...DEFAULT_SETTINGS.paydayConfig,
          ...(parsed.paydayConfig || {})
        }
      };
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
    throw e;
  }
}
