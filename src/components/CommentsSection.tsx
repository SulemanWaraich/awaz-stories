import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Reply, MoreHorizontal, Loader2, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  episode_id: string;
  parent_id: string | null;
  body: string;
  display_name: string | null;
  is_anonymous: boolean | null;
  deleted_at: string | null;
  created_at: string | null;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export function CommentsSection({ episodeId }: { episodeId: string }) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", episodeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles!comments_user_id_fkey(display_name, avatar_url)")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });
      return (data || []) as Comment[];
    },
  });

  const topLevel = useMemo(() => comments?.filter(c => !c.parent_id) || [], [comments]);
  const repliesMap = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    comments?.filter(c => c.parent_id).forEach(c => {
      if (!map[c.parent_id!]) map[c.parent_id!] = [];
      map[c.parent_id!].push(c);
    });
    // Sort replies oldest first
    Object.values(map).forEach(arr => arr.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()));
    return map;
  }, [comments]);

  const totalCount = comments?.length || 0;

  const postMutation = useMutation({
    mutationFn: async ({ parentId, text, isAnon }: { parentId?: string; text: string; isAnon: boolean }) => {
      const { error } = await supabase.from("comments").insert({
        user_id: user!.id,
        episode_id: episodeId,
        parent_id: parentId || null,
        body: text.trim(),
        display_name: isAnon ? "Anonymous Listener" : (profile?.display_name || "User"),
        is_anonymous: isAnon,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });
      setBody("");
      setReplyBody("");
      setReplyTo(null);
      toast.success("Comment posted");
    },
    onError: () => toast.error("Failed to post comment"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });
      toast.success("Comment removed");
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase.from("comments").update({ body: text.trim() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });
      setEditingId(null);
      toast.success("Comment updated");
    },
  });

  const renderComment = (comment: Comment, isReply = false) => {
    const isDeleted = !!comment.deleted_at;
    const isOwn = user?.id === comment.user_id;
    const displayName = isDeleted ? "Deleted" : (comment.display_name || (comment.profiles as any)?.display_name || "User");
    const avatar = comment.is_anonymous ? null : (comment.profiles as any)?.avatar_url;
    const replies = repliesMap[comment.id] || [];
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 border-l-2 border-accent/30 pl-4" : ""}`}>
        <div className="mb-4 rounded-2xl bg-card p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                {avatar ? (
                  <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium">{displayName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  • {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : ""}
                </span>
              </div>
            </div>
            {isOwn && !isDeleted && (
              <div className="relative">
                <button onClick={() => setMenuOpen(menuOpen === comment.id ? null : comment.id)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen === comment.id && (
                  <div className="absolute right-0 z-10 mt-1 w-32 rounded-xl border border-border bg-card py-1 shadow-warm">
                    <button onClick={() => { setEditingId(comment.id); setEditBody(comment.body); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">Edit</button>
                    <button onClick={() => { deleteMutation.mutate(comment.id); setMenuOpen(null); }} className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted">Delete</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isDeleted ? (
            <p className="text-sm italic text-muted-foreground">This comment was removed</p>
          ) : editingId === comment.id ? (
            <div className="space-y-2">
              <textarea value={editBody} onChange={e => setEditBody(e.target.value)} className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" rows={3} />
              <div className="flex gap-2">
                <button onClick={() => editMutation.mutate({ id: comment.id, text: editBody })} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
                <button onClick={() => setEditingId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm text-foreground/80">{comment.body}</p>
          )}

          {!isDeleted && !isReply && user && (
            <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
              <Reply className="h-3 w-3" /> Reply
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyTo === comment.id && (
          <div className="mb-4 ml-8 border-l-2 border-accent/30 pl-4">
            <textarea
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              placeholder="Write a reply..."
              maxLength={500}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              rows={2}
            />
            <div className="mt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={replyAnonymous} onChange={e => setReplyAnonymous(e.target.checked)} className="rounded accent-primary" />
                Post anonymously
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{replyBody.length}/500</span>
                <button
                  onClick={() => replyBody.trim() && postMutation.mutate({ parentId: comment.id, text: replyBody, isAnon: replyAnonymous })}
                  disabled={!replyBody.trim() || postMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Threaded replies */}
        {replies.length > 0 && !isReply && (
          <>
            {!isExpanded ? (
              <button
                onClick={() => setExpandedReplies(prev => { const n = new Set(prev); n.add(comment.id); return n; })}
                className="mb-4 ml-8 flex items-center gap-1 text-xs font-medium text-primary"
              >
                <ChevronDown className="h-3 w-3" /> View {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            ) : (
              replies.map(r => renderComment(r, true))
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <section className="mt-12">
      <h3 className="mb-6 font-heading text-xl font-semibold">{totalCount} {totalCount === 1 ? "Conversation" : "Conversations"}</h3>

      {/* Comment input */}
      {user ? (
        <div className="mb-8">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Share your thoughts..."
            maxLength={500}
            rows={3}
            onFocus={e => (e.target.rows = 6)}
            onBlur={e => { if (!e.target.value) e.target.rows = 3; }}
            className="w-full rounded-2xl border border-input bg-background p-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} className="rounded accent-primary" />
              Post anonymously
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{body.length}/500</span>
              <button
                onClick={() => body.trim() && postMutation.mutate({ text: body, isAnon: anonymous })}
                disabled={!body.trim() || postMutation.isPending}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Link
          to="/auth/login"
          className="mb-8 block rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft transition-shadow hover:shadow-warm"
        >
          Sign in to join the conversation →
        </Link>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {topLevel.slice(0, visibleCount).map(c => renderComment(c))}
          {visibleCount < topLevel.length && (
            <button
              onClick={() => setVisibleCount(v => v + 10)}
              className="mx-auto mt-4 block rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Load more conversations
            </button>
          )}
        </>
      )}
    </section>
  );
}
