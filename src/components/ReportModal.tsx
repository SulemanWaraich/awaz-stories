import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const REASONS = ["Harmful content", "Spam", "Misinformation", "Other"];

interface Props {
  open: boolean;
  onClose: () => void;
  contentType: "episode" | "comment" | "creator";
  contentId: string;
}

export function ReportModal({ open, onClose, contentType, contentId }: Props) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted — thank you");
      onClose();
      setReason("");
      setDetails("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-card p-6 shadow-warm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                <h3 className="font-heading text-lg font-semibold">Report {contentType}</h3>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 space-y-2">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    reason === r ? "border-primary bg-primary/5 font-medium text-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Additional details (optional)"
              rows={3}
              className="mb-4 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />

            <button
              onClick={handleSubmit}
              disabled={!reason || submitting}
              className="w-full rounded-xl bg-destructive py-3 text-sm font-medium text-destructive-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
