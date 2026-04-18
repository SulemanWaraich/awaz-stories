import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Heart, Play, Bookmark, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function ListenerOnboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("id");
      return data || [];
    },
  });

  useEffect(() => {
    if (profile && profile.role === "listener" && profile.onboarding_complete === false) {
      setOpen(true);
    }
  }, [profile]);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        onboarding_complete: true,
        preferred_categories: selected.length > 0 ? selected : null,
      })
      .eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    setOpen(false);
  };

  const toggle = (id: number) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const name = profile?.display_name?.split(" ")[0] || "friend";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && finish()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                  <Headphones className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mb-2 text-center font-heading text-2xl font-bold">Welcome to Awaz, {name}</h2>
                <p className="mb-8 text-center text-muted-foreground">A slow, intentional space for stories that matter.</p>
                <button
                  onClick={() => setStep(2)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Let's begin <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-2 font-heading text-xl font-bold">What kind of stories speak to you?</h2>
                <p className="mb-6 text-sm text-muted-foreground">Pick a few topics. We'll surface stories you'll love.</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = selected.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggle(cat.id)}
                        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/40"
                        }`}
                      >
                        {active && <Check className="h-3.5 w-3.5" />}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="mb-6 text-center font-heading text-xl font-bold">How Awaz works</h2>
                <div className="mb-8 space-y-5">
                  {[
                    { icon: Play, title: "Browse and discover", desc: "Find episodes that match your mood" },
                    { icon: Headphones, title: "Press play", desc: "Audio follows you everywhere on the site" },
                    { icon: Bookmark, title: "Save stories", desc: "Keep favorites to revisit anytime" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={finish}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
                >
                  Start exploring <ArrowRight className="h-4 w-4" />
                </button>
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
