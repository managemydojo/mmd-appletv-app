import { create } from 'zustand';
import { DojoCastConnectionStatus } from '../types/dojo';

interface DojoCastState {
  connectionStatus: DojoCastConnectionStatus;
  selectedProgramId: string | null;
  isPlaying: boolean;
  currentSlideIndex: number;

  setConnectionStatus: (status: DojoCastConnectionStatus) => void;
  selectProgram: (programId: string) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: (totalSlides: number) => void;
  prevSlide: () => void;
  reset: () => void;
}

export const useDojoCastStore = create<DojoCastState>(set => ({
  connectionStatus: 'disconnected',
  selectedProgramId: null,
  isPlaying: false,
  currentSlideIndex: 0,

  setConnectionStatus: status => set({ connectionStatus: status }),

  selectProgram: programId => set({ selectedProgramId: programId }),

  setPlaying: playing => set({ isPlaying: playing }),

  setCurrentSlideIndex: index => set({ currentSlideIndex: index }),

  nextSlide: totalSlides =>
    set(state => ({
      currentSlideIndex:
        state.currentSlideIndex < totalSlides - 1
          ? state.currentSlideIndex + 1
          : 0,
    })),

  prevSlide: () =>
    set(state => ({
      currentSlideIndex:
        state.currentSlideIndex > 0 ? state.currentSlideIndex - 1 : 0,
    })),

  reset: () =>
    set({
      connectionStatus: 'disconnected',
      selectedProgramId: null,
      isPlaying: false,
      currentSlideIndex: 0,
    }),
}));
