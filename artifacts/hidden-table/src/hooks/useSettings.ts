import { useState, useEffect, useCallback } from 'react';
import type { AnimationIntensity, Language, Settings, TextSize } from '../types';

const STORAGE_KEY = 'the-hidden-table:settings';
const SETTINGS_EVENT = 'the-hidden-table:settings-updated';

const defaultSettings: Settings = {
  soundEnabled: false,
  volume: 0.5,
  reduceMotion: false,
  animationIntensity: 'normal',
  language: 'id',
  textSize: 'normal',
};

function isAnimationIntensity(value: unknown): value is AnimationIntensity {
  return value === 'low' || value === 'normal' || value === 'high';
}

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'id';
}

function isTextSize(value: unknown): value is TextSize {
  return value === 'small' || value === 'normal' || value === 'large';
}

function normalizeSettings(value: unknown): Settings {
  if (!value || typeof value !== 'object') return defaultSettings;
  const raw = value as Partial<Settings>;
  const volume = typeof raw.volume === 'number' && Number.isFinite(raw.volume)
    ? Math.min(1, Math.max(0, raw.volume))
    : defaultSettings.volume;

  return {
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : defaultSettings.soundEnabled,
    volume,
    reduceMotion: typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : defaultSettings.reduceMotion,
    animationIntensity: isAnimationIntensity(raw.animationIntensity)
      ? raw.animationIntensity
      : defaultSettings.animationIntensity,
    language: isLanguage(raw.language) ? raw.language : defaultSettings.language,
    textSize: isTextSize(raw.textSize) ? raw.textSize : defaultSettings.textSize,
  };
}

function readSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeSettings(JSON.parse(stored)) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function writeSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // The app can continue with in-memory settings when storage is unavailable.
  }
  // Defer to a microtask so other useSettings() consumers (e.g. AmbientBackground)
  // don't get setState-during-render warnings when this fires while the caller
  // (e.g. SettingsPage) is still in its own render/update cycle.
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent<Settings>(SETTINGS_EVENT, { detail: settings }));
  });
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => readSettings());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setSettings(readSettings());
    };
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Settings>;
      setSettings(normalizeSettings(customEvent.detail));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SETTINGS_EVENT, handleSettingsUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SETTINGS_EVENT, handleSettingsUpdate);
    };
  }, []);

  const update = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = normalizeSettings({ ...prev, ...partial });
      writeSettings(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(defaultSettings);
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent<Settings>(SETTINGS_EVENT, { detail: defaultSettings }));
      });
    }
  }, []);

  return { settings, update, reset };
}
