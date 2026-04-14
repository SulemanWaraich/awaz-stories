import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioStore } from "@/stores/audio-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Play, Headphones, Users, Loader2, Bell, BellOff, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { formatDurationLong } from "@/lib/mock-data";
import { toast } from "sonner";

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { play, addToQueue, clearQueue } = useAudioStore();

  const { data: series, isLoading } = useQuery({
    queryKey: ["series", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("series")
        .select("*, profiles!series_creator_id_fkey(id, display_name, avatar_url)")
        .eq("slug", slug!)
        .maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  const { data: episodes } = useQuery({
    queryKey: ["series-episodes", series?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", series!.id)
        .eq("status", "published")
        .order("publish_at", { ascending: true });
      return data || [];
    },
    enabled: !!series?.id,
  });

  const totalPlays = episodes?.reduce((sum, ep) => sum + (ep.play_count || 0), 0) || 0;

  const { data: isSubscribed } = useQuery({
    queryKey: ["sub-series-creator", series?.creator_id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("id").eq("listener_id", user!.id).eq("creator_id", series!.creator_id!).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!series?.creator_id,
  });

  const subMutation = useMutation({
    mutationFn: async () => {
      if (isSubscribed) {
        await supabase.from("subscriptions").delete().eq("listener_id", user!.id).eq("creator_id", series!.creator_id!);
      } else {
        await supabase.from("subscriptions").insert({ listener_id: user!.id, creator_id: series!.creator_id! });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-series-creator"] });
      toast.success(isSubscribed ? "Unsubscribed" : "Subscribed!");
    },
  });

  const handlePlayAll = () => {
    if (!episodes?.length) return;
    clearQueue();
    const mapped = episodes.map(ep => ({
      id: ep.id,
      slug: ep.slug,
      title: ep.title,
      description: ep.description || "",
      hostName: (series?.profiles as any)?.display_name || "Creator",
      artworkUrl: ep.artwork_url || "",
      audioUrl: ep.audio_url || "",
      durationSeconds: ep.duration_seconds || 0,
      category: "",
      categoryColor: "",
      language: ep.language || "en",
      playCount: ep.play_count || 0,
      likeCount: 0,
      publishedAt: ep.publish_at || "",
      hasContentWarning: ep.has_content_warning || false,
    }));
    mapped.forEach(ep => addToQueue(ep));
    play(mapped[0]);
  };

  const handlePlayEpisode = (ep: any) => {
    play({
      id: ep.id,
      slug: ep.slug,
      title: ep.title,
      description: ep.description || "",
      hostName: (series?.profiles as any)?.display_name || "Creator",
      artworkUrl: ep.artwork_url || "",
      audioUrl: ep.audio_url || "",
      durationSeconds: ep.duration_seconds || 0,
      category: "",
      categoryColor: "",
      language: ep.language || "en",
      playCount: ep.play_count || 0,
      likeCount: 0,
      publishedAt: ep.publish_at || "",
      hasContentWarning: ep.has_content_warning || false,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-heading text-2xl font-bold">Series not found</h1>
          <Link to="/explore" className="mt-4 inline-block text-primary hover:underline">← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const creator = series.profiles as any;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        {series.artwork_url && (
          <img src={series.artwork_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 blur-2xl" />
        )}
        <div className="container relative py-16">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
            <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-3xl bg-muted shadow-warm">
              {series.artwork_url ? (
                <img src={series.artwork_url} alt={series.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center"><Layers className="h-16 w-16 text-primary/20" /></div>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Series</p>
              <h1 className="mb-2 font-heading text-3xl font-bold md:text-4xl">{series.title}</h1>
              {series.title_urdu && (
                <p className="mb-3 text-lg text-muted-foreground" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>{series.title_urdu}</p>
              )}
              {creator && (
                <Link to={`/creator/${creator.id}`} className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-muted">
                    {creator.avatar_url ? <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[10px] font-bold">{creator.display_name?.charAt(0)}</div>}
                  </div>
                  {creator.display_name}
                </Link>
              )}
              {series.description && <p className="mb-4 max-w-xl text-muted-foreground">{series.description}</p>}
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>{episodes?.length || 0} episodes</span>
                <span>{totalPlays.toLocaleString()} plays</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handlePlayAll} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105">
                  <Play className="h-4 w-4" /> Play All
                </button>
                {user && series.creator_id !== user.id && (
                  <button onClick={() => subMutation.mutate()} className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-transform hover:scale-105 ${isSubscribed ? "border border-border bg-card" : "bg-accent text-accent-foreground"}`}>
                    {isSubscribed ? <><BellOff className="h-4 w-4" /> Subscribed</> : <><Bell className="h-4 w-4" /> Subscribe</>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Episode list */}
      <div className="container py-10">
        <h2 className="mb-6 font-heading text-2xl font-bold">Episodes</h2>
        {episodes && episodes.length > 0 ? (
          <div className="space-y-3">
            {episodes.map((ep, i) => (
              <motion.div
                key={ep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft transition-shadow hover:shadow-warm"
              >
                <span className="w-8 text-center text-sm font-medium text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {ep.artwork_url ? <img src={ep.artwork_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <Link to={`/episode/${ep.slug}`} className="block truncate text-sm font-medium hover:text-primary">{ep.title}</Link>
                  {ep.description && <p className="line-clamp-1 text-xs text-muted-foreground">{ep.description}</p>}
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{formatDurationLong(ep.duration_seconds || 0)}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{(ep.play_count || 0).toLocaleString()} plays</span>
                <button
                  onClick={() => handlePlayEpisode(ep)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Play className="h-4 w-4 ml-0.5" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">No episodes in this series yet.</div>
        )}
      </div>

      <Footer />
    </div>
  );
}
