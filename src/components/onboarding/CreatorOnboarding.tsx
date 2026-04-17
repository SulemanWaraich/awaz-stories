import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CreatorOnboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && profile.role === "creator" && profile.onboarding_complete === false) {
      setOpen(true);
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const markComplete = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user.id);
    await refreshProfile();
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, bio: bio.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save profile");
      return;
    }
    setStep(3);
  };

  const finishAndUpload = async () => {
    await markComplete();
    setOpen(false);
    navigate("/dashboard/upload");
  };

  const finishAndExplore = async () => {
    await markComplete();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && finishAndExplore()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mb-2 text-center font-heading text-2xl font-bold">Welcome, storyteller.</h2>
                <p className="mb-8 text-center text-muted-foreground">Your voice belongs here.</p>
                <button
                  onClick={() => setStep(2)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  I'm ready <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-2 font-heading text-xl font-bold">Set up your profile</h2>
                <p className="mb-6 text-sm text-muted-foreground">Tell us who you are — listeners will see this on your profile.</p>
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium">Display name</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={60}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-1.5 block text-sm font-medium">Short bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={300}
                    placeholder="What stories do you want to share?"
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{bio.length}/300</p>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={saving || !displayName.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  Save & continue <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/15">
                  <Sparkles className="h-10 w-10 text-accent" />
                </div>
                <h2 className="mb-2 text-center font-heading text-xl font-bold">Your platform is ready</h2>
                <p className="mb-8 text-center text-muted-foreground">Upload your first episode whenever you are.</p>
                <div className="space-y-2">
                  <button
                    onClick={finishAndUpload}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                  >
                    Go to dashboard <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={finishAndExplore}
                    className="w-full rounded-xl border border-border py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Explore first
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
