import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TimeEntry } from '../types/timeEntry';
import { getEntries, saveEntries } from '../services/storage';

interface TimeEntriesContextValue {
  entries: TimeEntry[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<Omit<TimeEntry, 'id' | 'createdAt'>>) => void;
  deleteEntry: (id: string) => void;
  setAllEntries: (entries: TimeEntry[]) => void;
}

const TimeEntriesContext = createContext<TimeEntriesContextValue | null>(null);

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TimeEntry[]>(() => getEntries());

  const persistEntries = useCallback((updated: TimeEntry[]) => {
    setEntries(updated);
    saveEntries(updated);
  }, []);

  const addEntry = useCallback(
    (entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newEntry: TimeEntry = {
        ...entryData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      persistEntries([...entries, newEntry]);
    },
    [entries, persistEntries],
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<TimeEntry, 'id' | 'createdAt'>>) => {
      const updated = entries.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry,
      );
      persistEntries(updated);
    },
    [entries, persistEntries],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persistEntries(entries.filter((entry) => entry.id !== id));
    },
    [entries, persistEntries],
  );

  const setAllEntries = useCallback(
    (newEntries: TimeEntry[]) => {
      persistEntries(newEntries);
    },
    [persistEntries],
  );

  const value = useMemo(
    () => ({ entries, addEntry, updateEntry, deleteEntry, setAllEntries }),
    [entries, addEntry, updateEntry, deleteEntry, setAllEntries],
  );

  return (
    <TimeEntriesContext.Provider value={value}>
      {children}
    </TimeEntriesContext.Provider>
  );
}

export function useTimeEntries(): TimeEntriesContextValue {
  const context = useContext(TimeEntriesContext);
  if (!context) {
    throw new Error('useTimeEntries deve ser usado dentro de TimeEntriesProvider');
  }
  return context;
}
