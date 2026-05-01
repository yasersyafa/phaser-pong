import type { Settings } from '../types';
import { SCORE_LIMIT_DEFAULT, SETTINGS_STORAGE_KEY } from './Constants';

const DEFAULTS: Settings = {
  scoreLimit: SCORE_LIMIT_DEFAULT,
  ballSpeedTier: 'normal',
  juiceEnabled: true,
  soundEnabled: true,
  masterVolume: 0.7,
};

function isValid(obj: unknown): obj is Settings {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Partial<Settings>;
  return (
    typeof s.scoreLimit === 'number' &&
    (s.ballSpeedTier === 'slow' || s.ballSpeedTier === 'normal' || s.ballSpeedTier === 'fast') &&
    typeof s.juiceEnabled === 'boolean' &&
    typeof s.soundEnabled === 'boolean' &&
    typeof s.masterVolume === 'number'
  );
}

export const SettingsStore = {
  load(): Settings {
    try {
      const raw = globalThis.localStorage?.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return isValid(parsed) ? { ...DEFAULTS, ...parsed } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  },
  save(settings: Settings): void {
    try {
      globalThis.localStorage?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* swallow quota / private mode errors */
    }
  },
  defaults(): Settings {
    return { ...DEFAULTS };
  },
};
