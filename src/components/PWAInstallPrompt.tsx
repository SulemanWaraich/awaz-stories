import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "awaz_pwa_dismissed";
const VISIT_KEY = "awaz_visit_count";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") return;
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (visits >= 3) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  const onDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-30 mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-warm md:bottom-28"
          role="dialog"
          aria-label="Install Awaz"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Add Awaz to your home screen</p>
              <p className="mt-0.5 text-xs text-muted-foreground">For the best listening experience.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={onInstall} className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">
                  Install
                </button>
                <button onClick={onDismiss} className="rounded-full border border-border px-4 py-1.5 text-xs">
                  Maybe later
                </button>
              </div>
            </div>
            <button onClick={onDismiss} aria-label="Close" className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
