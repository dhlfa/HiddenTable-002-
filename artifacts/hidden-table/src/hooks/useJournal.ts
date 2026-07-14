import { useState, useEffect, useCallback } from 'react';
import type { ReadingResult } from '../types';

const STORAGE_KEY = 'the-hidden-table:journal';
const MAX_ENTRIES = 100;

function readEntries(): ReadingResult[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) as ReadingResult[] : [];
  } catch {
    return [];
  }
}

function persist(entries: ReadingResult[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
}

export function useJournal() {
  const [entries, setEntries] = useState<ReadingResult[]>([]);

  useEffect(() => {
    setEntries(readEntries());
  }, []);

  const save = useCallback((result: ReadingResult) => {
    setEntries((previous) => {
      const withoutDuplicate = previous.filter((entry) => entry.id !== result.id);
      const next = [result, ...withoutDuplicate].slice(0, MAX_ENTRIES);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((previous) => {
      const next = previous.filter((entry) => entry.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setEntries((previous) => {
      const next = previous.map((entry) => (entry.id === id ? { ...entry, favorite: !entry.favorite } : entry));
      persist(next);
      return next;
    });
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    setEntries((previous) => {
      const next = previous.map((entry) => (entry.id === id ? { ...entry, note } : entry));
      persist(next);
      return next;
    });
  }, []);

  return { entries, save, remove, clearAll, toggleFavorite, updateNote };
}
