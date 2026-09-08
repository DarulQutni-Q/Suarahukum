import { HistoryEntry } from '../types';

export const STORAGE_KEY = 'suarahukum_v1';

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
    console.warn('Failed to save history to localStorage, trimming oldest entries', error);
    // If storage is full, keep only recent 5 items and retry
    try {
      const trimmed = history.slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Critical: localStorage quota completely exhausted', e);
    }
  }
}

export async function createThumbnail(base64Image: string, maxDim: number = 140): Promise<string> {
  if (!base64Image) return '';
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Image);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Produce a tiny, low-weight JPEG thumbnail (~10-25KB instead of 1-2MB)
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Image);
    img.src = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  });
}
