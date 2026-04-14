import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Trash2, Copy, Archive, ExternalLink, Loader2, Headphones } from "lucide-react";
import { toast } from "sonner";
import { formatDurationLong } from "@/lib/mock-data";

export default function DashboardEpisodes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: episodes, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("episodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-episodes"] });
      toast.success("Episode deleted");
    },
    onError: () => toast.error("Failed to delete episode"),
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("episodes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-episodes"] });
      toast.success("Episode updated");
    },
  });

  const filtered = episodes?.filter((ep) => {
    if (statusFilter !== "all" && ep.status !== statusFilter) return false;
    if (search && !ep.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold">My Episodes</h1>
        <Link
          to="/dashboard/upload"
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" /> New Episode
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search episodes..."
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        {["all", "published", "draft", "scheduled", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !filtered?.length ? (
        <div className="rounded-2xl bg-card py-16 text-center shadow-soft">
          <Headphones className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="mb-2 text-muted-foreground">No episodes found</p>
          <Link to="/dashboard/upload" className="text-sm font-medium text-primary hover:underline">Upload your first →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Episode</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Date</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Plays</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ep) => (
                <tr key={ep.id} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {ep.artwork_url ? (
                          <img src={ep.artwork_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><Headphones className="h-4 w-4 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{ep.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDurationLong(ep.duration_seconds || 0)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      ep.status === "published" ? "bg-emerald-100 text-emerald-700" :
                      ep.status === "draft" ? "bg-muted text-muted-foreground" :
                      ep.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>{ep.status}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {new Date(ep.created_at!).toLocaleDateString()}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{ep.play_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === ep.id ? null : ep.id)}
                        className="rounded-lg p-1.5 transition-colors hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenu === ep.id && (
                        <div className="absolute right-0 top-8 z-10 w-44 rounded-xl border border-border bg-card py-1 shadow-warm">
                          {ep.status === "published" && (
                            <a
                              href={`/episode/${ep.slug}`}
                              target="_blank"
                              rel="noopener"
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                              onClick={() => setOpenMenu(null)}
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> View
                            </a>
                          )}
                          <button
                            onClick={() => {
                              archiveMutation.mutate({
                                id: ep.id,
                                status: ep.status === "archived" ? "draft" : "archived",
                              });
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            {ep.status === "archived" ? "Unarchive" : "Archive"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this episode? This cannot be undone.")) {
                                deleteMutation.mutate(ep.id);
                              }
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
