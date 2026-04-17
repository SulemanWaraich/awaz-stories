import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link as LinkIcon, Check, Share2, MessageCircle, Twitter, Instagram } from "lucide-react";
import { toast } from "sonner";

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export function ShareSheet({ open, onClose, url, title }: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(fullUrl);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        onClose();
      } catch {
        /* user cancelled */
      }
    }
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Twitter",
      icon: Twitter,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Instagram",
      icon: Instagram,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
      onClick: () => {
        copyLink();
        toast.message("Link copied — paste it in your Instagram story or DM");
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Share this story</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="line-clamp-2 text-sm text-muted-foreground">{title}</p>

          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((opt) => {
              const Icon = opt.icon;
              const content = (
                <>
                  <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${opt.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{opt.label}</span>
                </>
              );
              return opt.href ? (
                <a
                  key={opt.label}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center rounded-xl p-3 transition-colors hover:bg-muted"
                >
                  {content}
                </a>
              ) : (
                <button
                  key={opt.label}
                  onClick={opt.onClick}
                  className="flex flex-col items-center rounded-xl p-3 transition-colors hover:bg-muted"
                >
                  {content}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-2">
            <span className="flex-1 truncate px-2 text-xs text-muted-foreground">{fullUrl}</span>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={nativeShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Share2 className="h-4 w-4" /> More options
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
