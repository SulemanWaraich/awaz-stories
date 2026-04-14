import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Headphones, Play, Heart, Users, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardOverview() {
  const { user } = useAuth();

  const { data: episodes } = useQuery({
    queryKey: ["creator-episodes", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("creator_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ["creator-stats", user?.id],
    queryFn: async () => {
      const { data: eps } = await supabase
        .from("episodes")
        .select("play_count")
        .eq("creator_id", user!.id);
      const { count: likeCount } = await supabase
        .from("likes")
        .select("*, episodes!inner(creator_id)", { count: "exact", head: true })
        .eq("episodes.creator_id", user!.id);
      const { count: followers } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", user!.id);

      const totalPlays = eps?.reduce((sum, e) => sum + (e.play_count || 0), 0) || 0;
      return {
        episodes: eps?.length || 0,
        plays: totalPlays,
        likes: likeCount || 0,
        followers: followers || 0,
      };
    },
    enabled: !!user,
  });

  // Mock chart data for now (will use play_events in production)
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    plays: Math.floor(Math.random() * 50 + 10),
  }));

  const statCards = [
    { icon: Headphones, label: "Episodes", value: stats?.episodes || 0, color: "text-primary" },
    { icon: Play, label: "Total Plays", value: stats?.plays || 0, color: "text-primary" },
    { icon: Heart, label: "Likes", value: stats?.likes || 0, color: "text-accent" },
    { icon: Users, label: "Followers", value: stats?.followers || 0, color: "text-primary" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your studio</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Upload Episode
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-card p-5 shadow-soft"
          >
            <s.icon className={`mb-2 h-5 w-5 ${s.color}`} />
            <p className="font-heading text-2xl font-bold">{s.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-semibold">Plays (Last 30 days)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Line type="monotone" dataKey="plays" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Episodes */}
      <div className="rounded-2xl bg-card p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-semibold">Recent Episodes</h3>
        {!episodes?.length ? (
          <div className="py-8 text-center">
            <p className="mb-2 text-muted-foreground">No episodes yet</p>
            <Link to="/dashboard/upload" className="text-sm font-medium text-primary hover:underline">
              Upload your first episode →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.slice(0, 5).map((ep) => (
              <div key={ep.id} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-muted/50">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {ep.artwork_url ? (
                    <img src={ep.artwork_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Headphones className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ep.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ep.play_count || 0} plays · {ep.status}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  ep.status === "published" ? "bg-emerald-100 text-emerald-700" :
                  ep.status === "draft" ? "bg-muted text-muted-foreground" :
                  ep.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {ep.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
