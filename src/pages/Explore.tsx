import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { episodes, categories } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const filtered = useMemo(() => {
    let result = episodes;
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
  }, [search, selectedCategory, sortBy]);

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
            {["All", ...categories.map((c) => c.name)].map((cat) => (
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
        {filtered.length > 0 ? (
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
