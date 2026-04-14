import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Headphones, Heart, Bookmark, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ListenerProfile() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<"saved" | "liked" | "following">("saved");

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
  ];

  const isLoading = tab === "saved" ? loadingBookmarks : tab === "liked" ? loadingLikes : loadingFollowing;
  const episodes = tab === "saved" ? bookmarks?.map((b: any) => b.episodes) : tab === "liked" ? likes?.map((l: any) => l.episodes) : null;

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
        <div className="mb-6 flex gap-2 border-b border-border">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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
            <div className="py-16 text-center"><p className="text-muted-foreground">Not following anyone yet</p></div>
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
        ) : !episodes?.length ? (
          <div className="py-16 text-center">
            <Headphones className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No episodes here yet</p>
            <Link to="/explore" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">Discover episodes →</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.filter(Boolean).map((ep: any) => (
              <Link key={ep.id} to={`/episode/${ep.slug}`} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft transition-shadow hover:shadow-warm">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {ep.artwork_url ? <img src={ep.artwork_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>}
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
