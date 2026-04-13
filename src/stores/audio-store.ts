import { create } from "zustand";
import type { Episode } from "@/lib/mock-data";

interface AudioState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  queue: Episode[];

  play: (episode: Episode) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  addToQueue: (episode: Episode) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playbackRate: 1,
  queue: [],

  play: (episode) => set({ currentEpisode: episode, isPlaying: true, currentTime: 0 }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  addToQueue: (episode) => set((s) => ({ queue: [...s.queue, episode] })),
  playNext: () => {
    const { queue, currentEpisode } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((e) => e.id === currentEpisode?.id);
    const next = queue[currentIndex + 1];
    if (next) set({ currentEpisode: next, isPlaying: true, currentTime: 0 });
  },
  playPrevious: () => {
    const { queue, currentEpisode } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((e) => e.id === currentEpisode?.id);
    const prev = queue[currentIndex - 1];
    if (prev) set({ currentEpisode: prev, isPlaying: true, currentTime: 0 });
  },
  clearQueue: () => set({ queue: [] }),
}));
