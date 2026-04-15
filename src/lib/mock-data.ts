export interface Episode {
  id: string;
  slug: string;
  title: string;
  titleUrdu?: string;
  description: string;
  hostName: string;
  artworkUrl: string;
  audioUrl: string;
  durationSeconds: number;
  category: string;
  categoryColor: string;
  language: string;
  playCount: number;
  likeCount: number;
  publishedAt: string;
  hasContentWarning: boolean;
  warningText?: string;
  seriesTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu: string;
  color: string;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDurationLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}
