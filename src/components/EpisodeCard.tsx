import { Link } from "react-router-dom";
import { Play, Clock, Headphones, Bookmark } from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";
import type { Episode } from "@/lib/mock-data";
import { formatDurationLong } from "@/lib/mock-data";
import { motion } from "framer-motion";

interface Props {
  episode: Episode;
  index?: number;
}

export function EpisodeCard({ episode, index = 0 }: Props) {
  const play = useAudioStore((s) => s.play);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group overflow-hidden rounded-2xl bg-card shadow-soft transition-shadow hover:shadow-warm"
    >
      {/* Artwork */}
      <Link to={`/episode/${episode.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {episode.artworkUrl ? (
          <img src={episode.artworkUrl} alt={episode.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Headphones className="h-12 w-12 text-primary/40" />
          </div>
        )}
        {/* Play overlay */}
        {episode.audioUrl ? (
          <button
            onClick={(e) => { e.preventDefault(); play(episode); }}
            className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Play episode"
          >
            <Play className="h-5 w-5 ml-0.5" />
          </button>
        ) : null}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${episode.categoryColor}`}>
            {episode.category}
          </span>
          {episode.hasContentWarning && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">⚠ CW</span>
          )}
        </div>

        <Link to={`/episode/${episode.slug}`}>
          <h3 className="mb-1 line-clamp-2 font-heading text-base font-semibold leading-snug transition-colors hover:text-primary">
            {episode.title}
          </h3>
        </Link>

        <p className="mb-3 text-sm text-muted-foreground">{episode.hostName}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDurationLong(episode.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="h-3 w-3" />
            {episode.playCount.toLocaleString()}
          </span>
          <button className="ml-auto p-1 transition-colors hover:text-primary">
            <Bookmark className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
