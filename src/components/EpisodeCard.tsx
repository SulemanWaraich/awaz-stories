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
  const isUrdu = episode.language === "ur";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-elevated hover:bg-card-hover"
    >
      {/* Artwork */}
      <Link to={`/episode/${episode.slug}`} className="relative block aspect-square overflow-hidden bg-muted">
        {episode.artworkUrl ? (
          <img
            src={episode.artworkUrl}
            alt={episode.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <Headphones className="h-12 w-12 text-primary/40" />
          </div>
        )}

        {/* Language badge */}
        <span
          className="absolute left-3 top-3 rounded-full border border-border/40 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur-md"
          style={isUrdu ? { fontFamily: '"Noto Nastaliq Urdu", serif' } : undefined}
        >
          {isUrdu ? "اردو" : episode.language === "both" ? "EN/UR" : "EN"}
        </span>

        {/* Play overlay */}
        {episode.audioUrl ? (
          <button
            onClick={(e) => { e.preventDefault(); play(episode); }}
            className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-warm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-[1.08] hover:bg-primary-dim"
            aria-label={`Play ${episode.title}`}
          >
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </button>
        ) : null}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
            {episode.category}
          </span>
          {episode.hasContentWarning && (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              ⚠ CW
            </span>
          )}
        </div>

        <Link to={`/episode/${episode.slug}`}>
          <h3 className="mb-1 line-clamp-2 font-heading text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary">
            {episode.title}
          </h3>
        </Link>

        {episode.description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{episode.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDurationLong(episode.durationSeconds)}
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="h-3 w-3" />
            {episode.playCount.toLocaleString()}
          </span>
          <button className="ml-auto p-1 transition-colors hover:text-primary" aria-label="Bookmark">
            <Bookmark className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
