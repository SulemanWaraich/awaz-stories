import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(153,37%,27%)", "hsl(22,68%,69%)", "#6B9BC3", "#C9A0DC", "#F4A261", "#E76F51", "#7FB5A0"];

export default function DashboardAnalytics() {
  const { user } = useAuth();
  const [range, setRange] = useState("30");

  const { data: episodes } = useQuery({
    queryKey: ["creator-episodes-analytics", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("episodes").select("*").eq("creator_id", user!.id).order("play_count", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  // Top episodes chart
  const topEpisodes = (episodes || []).slice(0, 5).map((ep) => ({
    name: ep.title.length > 20 ? ep.title.slice(0, 20) + "…" : ep.title,
    plays: ep.play_count || 0,
  }));

  // Category distribution
  const catMap = new Map<number, number>();
  episodes?.forEach((ep) => {
    ep.category_ids?.forEach((id: number) => {
      catMap.set(id, (catMap.get(id) || 0) + (ep.play_count || 0));
    });
  });
  const categoryData = Array.from(catMap.entries()).map(([id, plays]) => ({
    name: categories?.find((c) => c.id === id)?.name || `Category ${id}`,
    value: plays,
  }));

  // Mock daily plays
  const dailyPlays = Array.from({ length: parseInt(range) }, (_, i) => ({
    day: `Day ${i + 1}`,
    plays: Math.floor(Math.random() * 40 + 5),
  }));

  const totalPlays = episodes?.reduce((s, e) => s + (e.play_count || 0), 0) || 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {[["7", "7 days"], ["30", "30 days"], ["90", "90 days"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setRange(val)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${range === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Total Plays</p>
          <p className="font-heading text-2xl font-bold">{totalPlays.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Total Episodes</p>
          <p className="font-heading text-2xl font-bold">{episodes?.length || 0}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-soft">
          <p className="text-sm text-muted-foreground">Avg Plays/Episode</p>
          <p className="font-heading text-2xl font-bold">{episodes?.length ? Math.round(totalPlays / episodes.length) : 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-heading text-lg font-semibold">Daily Plays</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyPlays}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="plays" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-heading text-lg font-semibold">Top Episodes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topEpisodes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="plays" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <h3 className="mb-4 font-heading text-lg font-semibold">Plays by Category</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
