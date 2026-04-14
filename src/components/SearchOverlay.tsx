import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Clock, Headphones, User, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDurationLong } from "@/lib/mock-data";

interface SearchResult {
  episodes: any[];
  creators: any[];
  series: any[];
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ episodes: [], creators: [], series: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const stored = localStorage.getItem("awaz-recent-searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else { setQuery(""); setResults({ episodes: [], creators: [], series: [] }); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults({ episodes: [], creators: [], series: [] }); return; }
    setLoading(true);
    const pattern = `%${q}%`;
    const [epRes, crRes, seRes] = await Promise.all([
      supabase.from("episodes").select("id, slug, title, artwork_url, duration_seconds, profiles!episodes_creator_id_fkey(display_name)").eq("status", "published").ilike("title", pattern).limit(5),
      supabase.from("profiles").select("id, display_name, avatar_url, role").eq("role", "creator").ilike("display_name", pattern).limit(3),
      supabase.from("series").select("id, slug, title, artwork_url").ilike("title", pattern).limit(3),
    ]);
    setResults({
      episodes: epRes.data || [],
      creators: crRes.data || [],
      series: seRes.data || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("awaz-recent-searches", JSON.stringify(updated));
  };

  const goTo = (path: string) => {
    if (query.trim()) saveSearch(query.trim());
    onClose();
    navigate(path);
  };

  const hasResults = results.episodes.length > 0 || results.creators.length > 0 || results.series.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="mt-[10vh] w-full max-w-2xl rounded-3xl bg-card shadow-warm"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border p-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && query.trim()) goTo(`/explore?q=${encodeURIComponent(query.trim())}`); }}
                placeholder="Search episodes, creators, series..."
                className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded-lg border border-border px-2 py-0.5 text-xs text-muted-foreground sm:block">ESC</kbd>
              <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground sm:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {/* Recent searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent searches</p>
                  {recentSearches.map(s => (
                    <button key={s} onClick={() => setQuery(s)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                      <Clock className="h-3.5 w-3.5" /> {s}
                    </button>
                  ))}
                </div>
              )}

              {loading && <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}

              {!loading && query && !hasResults && (
                <div className="py-8 text-center text-sm text-muted-foreground">No results found for "{query}"</div>
              )}

              {!loading && hasResults && (
                <>
                  {results.episodes.length > 0 && (
                    <div className="p-2">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Episodes</p>
                      {results.episodes.map((ep: any) => (
                        <button key={ep.id} onClick={() => goTo(`/episode/${ep.slug}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted">
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                            {ep.artwork_url ? <img src={ep.artwork_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{ep.title}</p>
                            <p className="text-xs text-muted-foreground">{(ep.profiles as any)?.display_name} • {formatDurationLong(ep.duration_seconds || 0)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.creators.length > 0 && (
                    <div className="p-2">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Creators</p>
                      {results.creators.map((cr: any) => (
                        <button key={cr.id} onClick={() => goTo(`/creator/${cr.id}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            {cr.avatar_url ? <img src={cr.avatar_url} alt="" className="h-full w-full rounded-full object-cover" /> : <User className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm font-medium">{cr.display_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.series.length > 0 && (
                    <div className="p-2">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Series</p>
                      {results.series.map((s: any) => (
                        <button key={s.id} onClick={() => goTo(`/series/${s.slug}`)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-muted">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            {s.artwork_url ? <img src={s.artwork_url} alt="" className="h-full w-full rounded-lg object-cover" /> : <Layers className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <p className="text-sm font-medium">{s.title}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {query.trim() && (
                    <button onClick={() => goTo(`/explore?q=${encodeURIComponent(query.trim())}`)} className="mx-2 mb-2 block w-[calc(100%-1rem)] rounded-xl py-3 text-center text-sm font-medium text-primary hover:bg-primary/5">
                      See all results →
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
