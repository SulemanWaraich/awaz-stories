import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: creator, isLoading } = useQuery({
    queryKey: ["creator", id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: episodes } = useQuery({
    queryKey: ["creator-episodes-public", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("creator_id", id!)
        .eq("status", "published")
        .order("publish_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", id],
    queryFn: async () => {
      const { count } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("creator_id", id!);
      return count || 0;
    },
    enabled: !!id,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("subscriptions").select("id").eq("listener_id", user!.id).eq("creator_id", id!).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await supabase.from("subscriptions").delete().eq("listener_id", user!.id).eq("creator_id", id!);
      } else {
        await supabase.from("subscriptions").insert({ listener_id: user!.id, creator_id: id! });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", id] });
      queryClient.invalidateQueries({ queryKey: ["follower-count", id] });
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    },
  });

  const socialLinks = (creator?.social_links as Record<string, string>) || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title={`${creator?.display_name || "Creator"} | Awaz Creator`}
        description={creator?.bio?.slice(0, 160) || `${creator?.display_name || "A creator"} shares stories on Awaz.`}
        image={creator?.avatar_url || undefined}
      />
      <Navbar />
      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 h-24 w-24 overflow-hidden rounded-full bg-muted">
            {creator?.avatar_url ? (
              <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {creator?.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <h1 className="mb-1 font-heading text-3xl font-bold">{creator?.display_name}</h1>
          {creator?.bio && <p className="mb-4 max-w-lg text-muted-foreground">{creator.bio}</p>}

          <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{followerCount} followers</span>
            <span>{episodes?.length || 0} episodes</span>
          </div>

          {Object.values(socialLinks).some(Boolean) && (
            <div className="mb-4 flex gap-3">
              {Object.entries(socialLinks).filter(([, v]) => v).map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener" className="text-sm text-primary hover:underline capitalize">{key}</a>
              ))}
            </div>
          )}

          {user && user.id !== id && (
            <button
              onClick={() => followMutation.mutate()}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-transform hover:scale-105 ${
                isFollowing ? "border border-border bg-card text-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </motion.div>

        {episodes && episodes.length > 0 && (
          <>
            <h2 className="mb-6 font-heading text-2xl font-bold">Episodes</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {episodes.map((ep, i) => (
                <EpisodeCard
                  key={ep.id}
                  episode={{
                    ...ep,
                    id: ep.id,
                    slug: ep.slug,
                    title: ep.title,
                    description: ep.description || "",
                    hostName: creator?.display_name || "Creator",
                    artworkUrl: ep.artwork_url || "",
                    audioUrl: ep.audio_url || "",
                    durationSeconds: ep.duration_seconds || 0,
                    category: "",
                    categoryColor: "bg-muted text-muted-foreground",
                    language: ep.language || "en",
                    playCount: ep.play_count || 0,
                    likeCount: 0,
                    publishedAt: ep.publish_at || ep.created_at || "",
                    hasContentWarning: ep.has_content_warning || false,
                  }}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
