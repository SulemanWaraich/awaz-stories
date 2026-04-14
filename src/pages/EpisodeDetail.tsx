import { useParams, Link } from "react-router-dom";
import { Play, Pause, Heart, Share2, Download, ArrowLeft, Clock, Headphones, AlertTriangle, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { episodes as mockEpisodes, formatDurationLong } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { useAudioStore } from "@/stores/audio-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { toast } from "sonner";

export default function EpisodeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { currentEpisode, isPlaying, play, togglePlay } = useAudioStore();
  const [showWarning, setShowWarning] = useState(true);

  // Try DB first, fallback to mock
  const { data: dbEpisode } = useQuery({
    queryKey: ["episode", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*, profiles!episodes_creator_id_fkey(display_name, avatar_url, id)")
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  // Construct episode from DB or mock
  const mockEp = mockEpisodes.find((e) => e.slug === slug);
  const episode = dbEpisode ? {
    id: dbEpisode.id,
    slug: dbEpisode.slug,
    title: dbEpisode.title,
    titleUrdu: dbEpisode.title_urdu || undefined,
    description: dbEpisode.description || "",
    hostName: (dbEpisode.profiles as any)?.display_name || "Creator",
    hostId: (dbEpisode.profiles as any)?.id,
    artworkUrl: dbEpisode.artwork_url || "",
    audioUrl: dbEpisode.audio_url || "",
    durationSeconds: dbEpisode.duration_seconds || 0,
    category: "Episode",
    categoryColor: "bg-muted text-muted-foreground",
    language: dbEpisode.language || "en",
    playCount: dbEpisode.play_count || 0,
    likeCount: 0,
    publishedAt: dbEpisode.publish_at || dbEpisode.created_at || "",
    hasContentWarning: dbEpisode.has_content_warning || false,
    warningText: dbEpisode.warning_text || undefined,
    seriesTitle: undefined,
  } : mockEp;

  // Like status
  const { data: isLiked } = useQuery({
    queryKey: ["liked", episode?.id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("likes").select("id").eq("user_id", user!.id).eq("episode_id", episode!.id).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!episode,
  });

  const { data: likeCount } = useQuery({
    queryKey: ["like-count", episode?.id],
    queryFn: async () => {
      const { count } = await supabase.from("likes").select("*", { count: "exact", head: true }).eq("episode_id", episode!.id);
      return count || 0;
    },
    enabled: !!episode,
  });

  // Bookmark status
  const { data: isBookmarked } = useQuery({
    queryKey: ["bookmarked", episode?.id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookmarks").select("id").eq("user_id", user!.id).eq("episode_id", episode!.id).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!episode,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to like"); return; }
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("episode_id", episode!.id);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, episode_id: episode!.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liked", episode?.id] });
      queryClient.invalidateQueries({ queryKey: ["like-count", episode?.id] });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user) { toast.error("Sign in to save"); return; }
      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("episode_id", episode!.id);
        toast.success("Removed from saved");
      } else {
        await supabase.from("bookmarks").insert({ user_id: user.id, episode_id: episode!.id });
        toast.success("Saved to bookmarks");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarked", episode?.id] });
    },
  });

  // Related episodes (from mock for now)
  const relatedEpisodes = mockEpisodes.filter((e) => e.slug !== slug).slice(0, 3);

  if (!episode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold">Episode not found</h1>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const isCurrentlyPlaying = currentEpisode?.id === episode.id && isPlaying;

  const handlePlay = () => {
    if (episode.hasContentWarning && showWarning) return;
    if (currentEpisode?.id === episode.id) togglePlay();
    else {
      play(episode);
      // Record play event
      if (user && dbEpisode) {
        supabase.from("play_events").insert({
          user_id: user.id,
          episode_id: episode.id,
          duration_played_seconds: 0,
        }).then(() => {});
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Content Warning Modal */}
      <AnimatePresence>
        {episode.hasContentWarning && showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-3xl bg-card p-8 shadow-warm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold">Content Notice</h3>
              <p className="mb-6 text-muted-foreground">{episode.warningText}</p>
              <p className="mb-6 text-sm text-muted-foreground">
                If you need support:{" "}
                <span className="font-medium text-primary">Umang Pakistan Helpline</span> ·{" "}
                <span className="font-medium text-primary">iCall India</span>
              </p>
              <div className="flex gap-3">
                <Link
                  to="/explore"
                  className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
                >
                  Go Back
                </Link>
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  I Understand, Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-8">
        <Link to="/explore" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left: Player */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="mb-6 aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-warm">
                {episode.artworkUrl ? (
                  <img src={episode.artworkUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Headphones className="h-20 w-20 text-primary/20" />
                  </div>
                )}
              </div>

              <button
                onClick={handlePlay}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-lg font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                {isCurrentlyPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                {isCurrentlyPlaying ? "Pause" : "Play Episode"}
              </button>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => likeMutation.mutate()}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isLiked ? "bg-red-50 text-red-500" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {likeCount ?? episode.likeCount}
                </button>
                <button className="flex items-center gap-1.5 rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/80">
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                  onClick={() => bookmarkMutation.mutate()}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isBookmarked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} /> Save
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${episode.categoryColor}`}>
                {episode.category}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {episode.language}
              </span>
              {episode.hasContentWarning && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">⚠ Content Warning</span>
              )}
            </div>

            <h1 className="mb-2 font-heading text-3xl font-bold leading-tight md:text-4xl">{episode.title}</h1>
            {episode.titleUrdu && (
              <p className="mb-4 text-xl text-muted-foreground" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>
                {episode.titleUrdu}
              </p>
            )}

            <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
              {(episode as any).hostId ? (
                <Link to={`/creator/${(episode as any).hostId}`} className="font-medium text-foreground hover:text-primary">{episode.hostName}</Link>
              ) : (
                <span className="font-medium text-foreground">{episode.hostName}</span>
              )}
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDurationLong(episode.durationSeconds)}</span>
              <span>·</span>
              <span>{new Date(episode.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>

            {(episode as any).seriesTitle && (
              <div className="mb-6 rounded-2xl bg-sage-light p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Part of series</p>
                <p className="font-heading text-base font-semibold">{(episode as any).seriesTitle}</p>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              {episode.description.split("\n\n").map((para, i) => (
                <p key={i} className={`mb-4 leading-relaxed text-foreground/80 ${para.startsWith(">") ? "border-l-4 border-accent pl-4 italic text-muted-foreground" : ""}`}>
                  {para.startsWith("> ") ? para.slice(2) : para}
                </p>
              ))}
            </div>

            {/* Crisis footer */}
            {episode.category === "Mental Health" && (
              <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                <p className="mb-2 text-sm font-medium">If you need support</p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">Umang Pakistan Helpline: 0311-7786264</span> ·
                  <span className="ml-2 font-medium text-primary">iCall India: 9152987821</span>
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related */}
        <section className="mt-20">
          <h2 className="mb-8 font-heading text-2xl font-bold">You might also like</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedEpisodes.map((ep, i) => (
              <EpisodeCard key={ep.id} episode={ep} index={i} />
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
