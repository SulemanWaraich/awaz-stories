import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Headphones, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/mock-data";

export default function EmbedEpisode() {
  const { slug } = useParams<{ slug: string }>();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["embed-episode", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("id, title, slug, artwork_url, audio_url, duration_seconds, profiles!episodes_creator_id_fkey(display_name)")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    // Lock to system theme inside iframe — toggle html class based on prefers-color-scheme
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !data?.audio_url) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - r.left) / r.width;
    a.currentTime = pct * duration;
    setTime(a.currentTime);
  };

  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const creator = (data?.profiles as any)?.display_name || "Creator";

  if (isLoading) {
    return (
      <div className="flex h-[180px] items-center justify-center bg-card">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[180px] items-center justify-center bg-card text-sm text-muted-foreground">
        Episode unavailable
      </div>
    );
  }

  return (
    <div className="flex h-[180px] w-full overflow-hidden bg-card text-foreground">
      <audio
        ref={audioRef}
        src={data.audio_url || undefined}
        onTimeUpdate={() => audioRef.current && setTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setPlaying(false)}
        preload="metadata"
      />

      {/* Artwork */}
      <div className="aspect-square h-full flex-shrink-0 bg-gradient-to-br from-primary/20 to-accent/20">
        {data.artwork_url ? (
          <img src={data.artwork_url} alt={data.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Headphones className="h-10 w-10 text-primary/30" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div className="min-w-0">
          <p className="truncate font-heading text-base font-semibold">{data.title}</p>
          <p className="truncate text-xs text-muted-foreground">{creator}</p>
        </div>

        <div className="space-y-2">
          <div
            className="h-1.5 cursor-pointer overflow-hidden rounded-full bg-muted"
            onClick={onSeek}
            role="progressbar"
            aria-valuenow={progress}
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDuration(Math.floor(time))}</span>
            <span>{formatDuration(Math.floor(duration || data.duration_seconds || 0))}</span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={toggle}
              disabled={!data.audio_url}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow disabled:opacity-50"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
            >
              Powered by Awaz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
