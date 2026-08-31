import type { TimeEntry } from '../types/timeEntry';
import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

const STORAGE_KEYS = {
  entries: 'work-hours.entries',
  settings: 'work-hours.settings',
  theme: 'work-hours.theme',
} as const;

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    throw new Error(`Não foi possível salvar os dados: ${String(error)}`);
  }
}

export function getEntries(): TimeEntry[] {
  return safeGetItem<TimeEntry[]>(STORAGE_KEYS.entries, []);
}

export function saveEntries(entries: TimeEntry[]): void {
  safeSetItem(STORAGE_KEYS.entries, entries);
}

export function getSettings(): AppSettings {
  return safeGetItem<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  safeSetItem(STORAGE_KEYS.settings, settings);
}

export function getTheme(): 'light' | 'dark' {
  return safeGetItem<'light' | 'dark'>(STORAGE_KEYS.theme, 'dark');
}

export function saveTheme(theme: 'light' | 'dark'): void {
  safeSetItem(STORAGE_KEYS.theme, theme);
}

export interface ExportData {
  version: number;
  settings: AppSettings;
  entries: TimeEntry[];
}

export function exportAllData(): ExportData {
  return {
    version: 1,
    settings: getSettings(),
    entries: getEntries(),
  };
}

export function validateImportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') return false;
  if (!Array.isArray(obj.entries)) return false;
  if (typeof obj.settings !== 'object' || obj.settings === null) return false;

  const settings = obj.settings as Record<string, unknown>;
  if (typeof settings.weeklyGoalMinutes !== 'number') return false;
  if (typeof settings.hourlyRate !== 'number') return false;

  for (const entry of obj.entries) {
    if (typeof entry !== 'object' || entry === null) return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== 'string') return false;
    if (typeof e.date !== 'string') return false;
    if (typeof e.startTime !== 'string') return false;
    if (typeof e.endTime !== 'string') return false;
    if (typeof e.description !== 'string') return false;
    if (typeof e.category !== 'string') return false;
  }

  return true;
}

export function importAllData(data: ExportData): void {
  saveSettings(data.settings);
  saveEntries(data.entries);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.entries);
  localStorage.removeItem(STORAGE_KEYS.settings);
}
