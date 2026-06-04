import { HistoryEntry } from '../types';

const STORAGE_KEY = 'suarahukum_v1';

export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse history from localStorage', error);
    return [];
  }
}

export function saveToHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history to localStorage', error);
  }
}
