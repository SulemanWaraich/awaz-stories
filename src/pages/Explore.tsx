import { useState, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { episodes as mockEpisodes, categories as mockCategories } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  // Fetch categories from DB
  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("id");
      return data || [];
    },
  });

  // Fetch episodes from DB
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

  // Use DB episodes if available, otherwise fallback to mock
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : mockCategories;
  const categoryNames = dbCategories && dbCategories.length > 0
    ? dbCategories.map((c) => c.name)
    : mockCategories.map((c) => c.name);

  // Merge DB episodes into our EpisodeCard format
  const allEpisodes = useMemo(() => {
    if (dbEpisodes && dbEpisodes.length > 0) {
      return dbEpisodes.map((ep) => ({
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
    }
    return mockEpisodes;
  }, [dbEpisodes, dbCategories]);

  const filtered = useMemo(() => {
    let result = allEpisodes;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q) || e.hostName.toLowerCase().includes(q));
    }
    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }
    if (sortBy === "popular") {
      result = [...result].sort((a, b) => b.playCount - a.playCount);
    }
    return result;
  }, [search, selectedCategory, sortBy, allEpisodes]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-heading text-3xl font-bold md:text-4xl">Explore</h1>
          <p className="mb-8 text-muted-foreground">Discover stories that move you</p>
        </motion.div>

        {/* Filters */}
        <div className="sticky top-16 z-30 -mx-4 mb-8 flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-md">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search episodes..."
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
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
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ep, i) => (
              <EpisodeCard key={ep.id} episode={ep} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">No episodes found</p>
            <p className="text-sm text-muted-foreground">Try a different filter or search term.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
