import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioStore } from "@/stores/audio-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Headphones, Heart, Bookmark, Users, Loader2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDurationLong } from "@/lib/mock-data";

export default function ListenerProfile() {
  const { profile } = useAuth();
  const recentlyPlayed = useAudioStore(s => s.recentlyPlayed);
  const [tab, setTab] = useState<"saved" | "liked" | "following" | "recent">("saved");

  const { data: bookmarks, isLoading: loadingBookmarks } = useQuery({
    queryKey: ["my-bookmarks", profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("*, episodes(*)")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!profile && tab === "saved",
  });

  const { data: likes, isLoading: loadingLikes } = useQuery({
    queryKey: ["my-likes", profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("likes")
        .select("*, episodes(*)")
        .eq("user_id", profile!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!profile && tab === "liked",
  });

  const { data: following, isLoading: loadingFollowing } = useQuery({
    queryKey: ["my-following", profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*, profiles!subscriptions_creator_id_fkey(*)")
        .eq("listener_id", profile!.id);
      return data || [];
    },
    enabled: !!profile && tab === "following",
  });

  const tabs = [
    { key: "saved" as const, label: "Saved", icon: Bookmark },
    { key: "liked" as const, label: "Liked", icon: Heart },
    { key: "following" as const, label: "Following", icon: Users },
    { key: "recent" as const, label: "Recently Played", icon: Clock },
  ];

  const isLoading = tab === "saved" ? loadingBookmarks : tab === "liked" ? loadingLikes : tab === "following" ? loadingFollowing : false;
  const episodes = tab === "saved" ? bookmarks?.map((b: any) => b.episodes) : tab === "liked" ? likes?.map((l: any) => l.episodes) : null;

  const emptyMessages: Record<string, { msg: string; action: string }> = {
    saved: { msg: "You haven't saved any stories yet.", action: "Start exploring →" },
    liked: { msg: "Nothing liked yet — go find something that moves you.", action: "Discover episodes →" },
    following: { msg: "Not following anyone yet.", action: "Find creators →" },
    recent: { msg: "No recently played episodes.", action: "Start listening →" },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        {/* Profile header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">{profile?.display_name || "User"}</h1>
            <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : tab === "following" ? (
          !following?.length ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="mb-2 text-muted-foreground">{emptyMessages.following.msg}</p>
              <Link to="/explore" className="text-sm font-medium text-primary hover:underline">{emptyMessages.following.action}</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {following.map((sub: any) => (
                <Link key={sub.id} to={`/creator/${sub.creator_id}`} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft transition-shadow hover:shadow-warm">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {sub.profiles?.avatar_url ? (
                      <img src={sub.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-muted-foreground">
                        {sub.profiles?.display_name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold">{sub.profiles?.display_name}</p>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : tab === "recent" ? (
          !recentlyPlayed.length ? (
            <div className="py-16 text-center">
              <Headphones className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="mb-2 text-muted-foreground">{emptyMessages.recent.msg}</p>
              <Link to="/explore" className="text-sm font-medium text-primary hover:underline">{emptyMessages.recent.action}</Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyPlayed.map((ep) => (
                <Link key={ep.id} to={`/episode/${ep.slug}`} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft transition-shadow hover:shadow-warm">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    {ep.artworkUrl ? <img src={ep.artworkUrl} alt={ep.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{ep.title}</p>
                    <p className="text-xs text-muted-foreground">{ep.hostName} • {formatDurationLong(ep.durationSeconds)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : !episodes?.length ? (
          <div className="py-16 text-center">
            <Headphones className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="mb-2 text-muted-foreground">{emptyMessages[tab].msg}</p>
            <Link to="/explore" className="text-sm font-medium text-primary hover:underline">{emptyMessages[tab].action}</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.filter(Boolean).map((ep: any) => (
              <Link key={ep.id} to={`/episode/${ep.slug}`} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft transition-shadow hover:shadow-warm">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {ep.artwork_url ? <img src={ep.artwork_url} alt={ep.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{ep.title}</p>
                  <p className="text-xs text-muted-foreground">{ep.play_count || 0} plays</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
