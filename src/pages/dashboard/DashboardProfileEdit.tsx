import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

export default function DashboardProfile() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const socialLinks = (profile?.social_links as Record<string, string>) || {};
  const [spotify, setSpotify] = useState(socialLinks.spotify || "");
  const [instagram, setInstagram] = useState(socialLinks.instagram || "");
  const [youtube, setYoutube] = useState(socialLinks.youtube || "");
  const [twitter, setTwitter] = useState(socialLinks.twitter || "");

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        social_links: { spotify, instagram, youtube, twitter },
      }).eq("id", profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      refreshProfile();
      toast.success("Profile saved!");
    },
    onError: () => toast.error("Failed to save"),
  });

  const handleAvatarUpload = async (file: File) => {
    const path = `${profile!.id}/${Date.now()}-avatar`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) { toast.error("Upload failed"); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast.success("Avatar uploaded!");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 font-heading text-2xl font-bold">My Profile</h1>
      <p className="mb-8 text-muted-foreground">How listeners see you</p>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-6">
        <div className="relative">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {displayName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleAvatarUpload(f);
              };
              input.click();
            }}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <p className="font-medium">{displayName || "Your Name"}</p>
          <p className="text-sm text-muted-foreground">Creator</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Display Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 280))} rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Tell listeners about yourself..." />
          <p className="mt-1 text-right text-xs text-muted-foreground">{bio.length}/280</p>
        </div>

        <h3 className="font-heading text-sm font-semibold">Social Links</h3>
        {[
          ["Spotify", spotify, setSpotify],
          ["Instagram", instagram, setInstagram],
          ["YouTube", youtube, setYoutube],
          ["Twitter / X", twitter, setTwitter],
        ].map(([label, val, setter]) => (
          <div key={label as string}>
            <label className="mb-1.5 block text-sm font-medium">{label as string}</label>
            <input value={val as string} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder={`https://...`} />
          </div>
        ))}

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
