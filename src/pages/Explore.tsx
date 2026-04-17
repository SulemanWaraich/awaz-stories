import { useState, useMemo, useEffect } from "react";
import { Search, Loader2, Layers, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Episode } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "latest";
  const initialTab = searchParams.get("tab") || "episodes";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.q = search;
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (sortBy !== "latest") params.sort = sortBy;
    if (activeTab !== "episodes") params.tab = activeTab;
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, sortBy, activeTab, setSearchParams]);

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("id");
      return data || [];
    },
  });

  const { data: dbEpisodes, isLoading } = useQuery({
    queryKey: ["explore-episodes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*, profiles!episodes_creator_id_fkey(display_name)")
        .eq("status", "published")
        .order("publish_at", { ascending: false });
      return data || [];
    },
  });

  const { data: dbSeries, isLoading: loadingSeries } = useQuery({
    queryKey: ["explore-series"],
    queryFn: async () => {
      const { data } = await supabase
        .from("series")
        .select("*, profiles!series_creator_id_fkey(display_name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: activeTab === "series",
  });

  const categoryNames = (dbCategories || []).map((c) => c.name);

  const allEpisodes: Episode[] = useMemo(() => {
    return (dbEpisodes || []).map((ep) => ({
      id: ep.id,
      slug: ep.slug,
      title: ep.title,
      titleUrdu: ep.title_urdu || undefined,
      description: ep.description || "",
      hostName: (ep.profiles as any)?.display_name || "Creator",
      artworkUrl: ep.artwork_url || "",
      audioUrl: ep.audio_url || "",
      durationSeconds: ep.duration_seconds || 0,
      category: dbCategories?.find((c) => ep.category_ids?.includes(c.id))?.name || "Uncategorized",
      categoryColor: "bg-muted text-muted-foreground",
      language: ep.language || "en",
      playCount: ep.play_count || 0,
      likeCount: 0,
      publishedAt: ep.publish_at || ep.created_at || "",
      hasContentWarning: ep.has_content_warning || false,
      warningText: ep.warning_text || undefined,
    }));
  }, [dbEpisodes, dbCategories]);

  const filtered = useMemo(() => {
    let result = allEpisodes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.hostName.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q));
    }
    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }
    if (sortBy === "popular") {
      result = [...result].sort((a, b) => b.playCount - a.playCount);
    }
    return result;
  }, [search, selectedCategory, sortBy, allEpisodes]);

  const filteredSeries = useMemo(() => {
    if (!dbSeries) return [];
    let result = dbSeries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(q));
    }
    return result;
  }, [dbSeries, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-heading text-3xl font-bold md:text-4xl">Explore</h1>
          <p className="mb-8 text-muted-foreground">Discover stories that move you</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          {[{ key: "episodes", label: "Episodes" }, { key: "series", label: "Series" }].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-30 -mx-4 mb-8 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-md transition-colors duration-300">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "episodes" ? "Search episodes..." : "Search series..."}
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          {activeTab === "episodes" && (
            <>
              <div className="flex gap-2 overflow-x-auto">
                {["All", ...categoryNames].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Played</option>
              </select>
            </>
          )}
        </div>

        {/* Results info */}
        {search && activeTab === "episodes" && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </p>
        )}

        {/* Results */}
        {activeTab === "episodes" ? (
          isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ep, i) => (
                <EpisodeCard key={ep.id} episode={ep} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Headphones className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <p className="mb-2 text-lg font-medium text-muted-foreground">
                {search ? `No episodes found for "${search}"` : "No stories yet"}
              </p>
              <p className="mb-4 text-sm text-muted-foreground">
                {search || selectedCategory !== "All" ? "Try a different filter or search term." : "Be the first to share your voice."}
              </p>
              {(search || selectedCategory !== "All") && (
                <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground">Clear filters</button>
              )}
            </div>
          )
        ) : (
          loadingSeries ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filteredSeries.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSeries.map((s: any, i: number) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <a href={`/series/${s.slug}`} className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition-shadow hover:shadow-warm">
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {s.artwork_url ? (
                        <img src={s.artwork_url} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"><Layers className="h-12 w-12 text-primary/40" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Series</p>
                      <h3 className="mb-1 font-heading text-base font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{(s.profiles as any)?.display_name || "Creator"}</p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Layers className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <p className="mb-2 text-lg font-medium text-muted-foreground">No series found</p>
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}
