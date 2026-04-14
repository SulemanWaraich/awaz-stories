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
  recentlyPlayed: Episode[];

  play: (episode: Episode) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (id: string) => void;
  reorderQueue: (from: number, to: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;
}

// Load recently played from localStorage
const loadRecentlyPlayed = (): Episode[] => {
  try {
    const stored = localStorage.getItem("awaz-recently-played");
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const saveRecentlyPlayed = (episodes: Episode[]) => {
  try { localStorage.setItem("awaz-recently-played", JSON.stringify(episodes)); } catch {}
};

export const useAudioStore = create<AudioState>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  playbackRate: 1,
  queue: [],
  recentlyPlayed: loadRecentlyPlayed(),

  play: (episode) => {
    const recent = [episode, ...get().recentlyPlayed.filter(e => e.id !== episode.id)].slice(0, 20);
    saveRecentlyPlayed(recent);
    set({ currentEpisode: episode, isPlaying: true, currentTime: 0, recentlyPlayed: recent });
  },
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  addToQueue: (episode) => set((s) => ({ queue: [...s.queue, episode] })),
  removeFromQueue: (id) => set((s) => ({ queue: s.queue.filter(e => e.id !== id) })),
  reorderQueue: (from, to) => {
    const queue = [...get().queue];
    const [moved] = queue.splice(from, 1);
    queue.splice(to, 0, moved);
    set({ queue });
  },
  playNext: () => {
    const { queue, currentEpisode } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((e) => e.id === currentEpisode?.id);
    const next = queue[currentIndex + 1];
    if (next) {
      const recent = [next, ...get().recentlyPlayed.filter(e => e.id !== next.id)].slice(0, 20);
      saveRecentlyPlayed(recent);
      set({ currentEpisode: next, isPlaying: true, currentTime: 0, recentlyPlayed: recent });
    }
  },
  playPrevious: () => {
    const { queue, currentEpisode } = get();
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((e) => e.id === currentEpisode?.id);
    const prev = queue[currentIndex - 1];
    if (prev) {
      const recent = [prev, ...get().recentlyPlayed.filter(e => e.id !== prev.id)].slice(0, 20);
      saveRecentlyPlayed(recent);
      set({ currentEpisode: prev, isPlaying: true, currentTime: 0, recentlyPlayed: recent });
    }
  },
  clearQueue: () => set({ queue: [] }),
}));
