import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchHistoryEntry {
  contentId: string;
  title: string;
  watchedAt: number;
  /** Progress percentage (0–100) of how much of the video was watched */
  progressPercent?: number;
}

interface WatchHistoryState {
  history: WatchHistoryEntry[];
  loading: boolean;
  loadHistory: () => Promise<void>;
  addToHistory: (item: {
    contentId: string;
    title: string;
    progressPercent?: number;
  }) => Promise<void>;
  updateProgress: (contentId: string, progressPercent: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const STORAGE_KEY = '@mmd_watch_history';
const MAX_HISTORY_ITEMS = 50;

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
  history: [],
  loading: true,

  loadHistory: async () => {
    set({ loading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const history = JSON.parse(raw) as WatchHistoryEntry[];
        set({ history, loading: false });
      } else {
        set({ history: [], loading: false });
      }
    } catch (error) {
      console.error('Failed to load watch history:', error);
      set({ history: [], loading: false });
    }
  },

  addToHistory: async ({ contentId, title, progressPercent }) => {
    const { history } = get();

    // Remove item if it already exists (moves it to top)
    let newHistory = history.filter(item => item.contentId !== contentId);

    // Add new item at the beginning
    newHistory.unshift({
      contentId,
      title,
      watchedAt: Date.now(),
      progressPercent: progressPercent ?? 0,
    });

    // Limit history size
    if (newHistory.length > MAX_HISTORY_ITEMS) {
      newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
    }

    set({ history: newHistory });

    // Persist to AsyncStorage (non-sensitive data, not appropriate for Keychain)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save watch history:', error);
    }
  },

  updateProgress: async (contentId: string, progressPercent: number) => {
    const { history } = get();
    const newHistory = history.map(item =>
      item.contentId === contentId
        ? { ...item, progressPercent, watchedAt: Date.now() }
        : item,
    );
    set({ history: newHistory });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to update watch progress:', error);
    }
  },

  clearHistory: async () => {
    set({ history: [] });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear watch history:', error);
    }
  },
}));
