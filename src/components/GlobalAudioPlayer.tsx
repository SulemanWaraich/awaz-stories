import { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/stores/audio-store";
import { formatDuration } from "@/lib/mock-data";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, ChevronUp, ChevronDown, Heart, Bookmark, Share2, RotateCcw, RotateCw, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [expanded, setExpanded] = useState(false);
  const {
    currentEpisode, isPlaying, currentTime, duration, volume, playbackRate, queue,
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

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
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
        {currentEpisode && !expanded && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg shadow-soft transition-colors duration-300"
          >
            {/* Progress bar */}
            <div className="h-1 w-full cursor-pointer bg-muted" onClick={handleSeek} role="progressbar" aria-label="Episode progress" aria-valuenow={progress}>
              <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>

            <div className="container flex items-center gap-4 py-3">
              {/* Tap to expand on mobile */}
              <button onClick={() => setExpanded(true)} className="flex items-center gap-3 sm:contents" aria-label="Expand player">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {currentEpisode.artworkUrl ? (
                    <img src={currentEpisode.artworkUrl} alt={currentEpisode.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10">
                      <Volume2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="truncate text-sm font-medium font-heading">{currentEpisode.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentEpisode.hostName}</p>
                </div>
              </button>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button onClick={playPrevious} className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block" aria-label="Previous">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <button onClick={playNext} className="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:block" aria-label="Next">
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
                aria-label={`Playback speed ${playbackRate}x`}
              >
                {playbackRate}x
              </button>

              {/* Volume */}
              <div className="hidden items-center gap-1 md:flex">
                <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="p-1 text-muted-foreground hover:text-foreground" aria-label={volume === 0 ? "Unmute" : "Mute"}>
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
                  aria-label="Volume"
                />
              </div>

              {/* Close */}
              <button
                onClick={() => useAudioStore.setState({ currentEpisode: null, isPlaying: false })}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Close player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded full-screen mobile player */}
      <AnimatePresence>
        {currentEpisode && expanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col bg-background transition-colors duration-300"
          >
            {/* Blurred artwork bg */}
            {currentEpisode.artworkUrl && (
              <div className="absolute inset-0 overflow-hidden">
                <img src={currentEpisode.artworkUrl} alt="" className="h-full w-full scale-110 object-cover opacity-15 blur-3xl" />
              </div>
            )}

            <div className="relative flex flex-1 flex-col items-center justify-center px-6">
              {/* Collapse */}
              <button onClick={() => setExpanded(false)} className="absolute left-4 top-4 rounded-xl p-2 text-muted-foreground hover:text-foreground" aria-label="Collapse player">
                <ChevronDown className="h-6 w-6" />
              </button>

              {/* Artwork */}
              <div className="mb-8 w-[80vw] max-w-[320px] overflow-hidden rounded-3xl shadow-warm">
                {currentEpisode.artworkUrl ? (
                  <img src={currentEpisode.artworkUrl} alt={currentEpisode.title} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-primary/10">
                    <Volume2 className="h-20 w-20 text-primary/20" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="mb-1 text-center font-heading text-xl font-bold">{currentEpisode.title}</h2>
              <p className="mb-8 text-sm text-muted-foreground">{currentEpisode.hostName}</p>

              {/* Progress */}
              <div className="mb-2 w-full max-w-sm">
                <div className="h-1.5 w-full cursor-pointer rounded-full bg-muted" onClick={handleSeek}>
                  <div className="h-full rounded-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(Math.floor(currentTime))}</span>
                  <span>{formatDuration(Math.floor(duration))}</span>
                </div>
              </div>

              {/* Main controls */}
              <div className="mb-6 flex items-center gap-6">
                <button onClick={() => skip(-15)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Rewind 15 seconds">
                  <RotateCcw className="h-6 w-6" />
                </button>
                <button onClick={togglePlay} className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg" aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                </button>
                <button onClick={() => skip(15)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Forward 15 seconds">
                  <RotateCw className="h-6 w-6" />
                </button>
              </div>

              {/* Secondary controls */}
              <div className="flex items-center gap-6">
                <button onClick={cycleRate} className="rounded-lg border border-border px-3 py-1 text-xs font-medium text-muted-foreground" aria-label="Playback speed">
                  {playbackRate}x
                </button>
                <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Volume">
                  {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
