import { useEffect, useRef } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { formatDuration } from "@/lib/mock-data";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentEpisode, isPlaying, currentTime, duration, volume, playbackRate,
    togglePlay, setCurrentTime, setDuration, setVolume, setPlaybackRate,
    playNext, playPrevious,
  } = useAudioStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    audio.src = currentEpisode.audioUrl;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const rates = [0.75, 1, 1.25, 1.5, 2];
  const cycleRate = () => {
    const idx = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(idx + 1) % rates.length]);
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        preload="metadata"
      />
      <AnimatePresence>
        {currentEpisode && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg shadow-soft"
          >
            {/* Progress bar */}
            <div
              className="h-1 w-full cursor-pointer bg-muted"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="container flex items-center gap-4 py-3">
              {/* Artwork */}
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {currentEpisode.artworkUrl ? (
                  <img src={currentEpisode.artworkUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium font-heading">{currentEpisode.title}</p>
                <p className="truncate text-xs text-muted-foreground">{currentEpisode.hostName}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button onClick={playPrevious} className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <button onClick={playNext} className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Time */}
              <span className="hidden text-xs text-muted-foreground sm:block">
                {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
              </span>

              {/* Speed */}
              <button
                onClick={cycleRate}
                className="hidden rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
              >
                {playbackRate}x
              </button>

              {/* Volume */}
              <div className="hidden items-center gap-1 md:flex">
                <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="p-1 text-muted-foreground hover:text-foreground">
                  {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-primary"
                />
              </div>

              {/* Close */}
              <button
                onClick={() => useAudioStore.setState({ currentEpisode: null, isPlaying: false })}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
