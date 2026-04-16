/**
 * Student Settings Store — user preferences for the student section.
 *
 * Mirrors the persistence pattern of useDojoSettingsStore (AsyncStorage via
 * zustand/persist) so behavior survives app restarts.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StudentSettingsState {
  // Playback
  /** Whether video previews should auto-play when a card/hero is focused. */
  autoplayVideos: boolean;
  /** Whether auto-played previews should play with audio (vs muted). */
  autoplaySound: boolean;

  // Actions
  toggleAutoplayVideos: () => void;
  toggleAutoplaySound: () => void;
}

export const useStudentSettingsStore = create<StudentSettingsState>()(
  persist(
    set => ({
      autoplayVideos: true,
      autoplaySound: false,

      toggleAutoplayVideos: () =>
        set(s => ({ autoplayVideos: !s.autoplayVideos })),
      toggleAutoplaySound: () =>
        set(s => ({ autoplaySound: !s.autoplaySound })),
    }),
    {
      name: 'student-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
