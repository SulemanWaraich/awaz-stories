import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mic2, FileText, Image, Send, ArrowLeft, ArrowRight, Loader2, Upload, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Audio", "Details", "Artwork", "Publish"];

export default function DashboardUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1: Audio
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Step 2: Details
  const [title, setTitle] = useState("");
  const [titleUrdu, setTitleUrdu] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [language, setLanguage] = useState<"en" | "ur" | "both">("en");
  const [hasWarning, setHasWarning] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [allowDownload, setAllowDownload] = useState(false);
  const [seriesId, setSeriesId] = useState<string | null>(null);

  // Step 3: Artwork
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUrl, setArtworkUrl] = useState("");
  const [uploadingArtwork, setUploadingArtwork] = useState(false);

  // Step 4: Publish
  const [publishOption, setPublishOption] = useState<"now" | "schedule" | "draft">("now");
  const [publishDate, setPublishDate] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("id");
      return data || [];
    },
  });

  const { data: series } = useQuery({
    queryKey: ["creator-series", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("series").select("*").eq("creator_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const handleAudioUpload = async (file: File) => {
    setAudioFile(file);
    setUploadingAudio(true);
    setAudioProgress(0);

    // Detect duration
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => setAudioDuration(Math.floor(audio.duration));

    // Simulate progress (Supabase doesn't expose upload progress natively)
    const interval = setInterval(() => {
      setAudioProgress((p) => Math.min(p + 15, 90));
    }, 200);

    try {
      const path = `${user!.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("episode-audio").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("episode-audio").getPublicUrl(path);
      setAudioUrl(urlData.publicUrl);
      setAudioProgress(100);
      toast.success("Audio uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setAudioFile(null);
    } finally {
      clearInterval(interval);
      setUploadingAudio(false);
    }
  };

  const handleArtworkUpload = async (file: File) => {
    setArtworkFile(file);
    setUploadingArtwork(true);
    try {
      const path = `${user!.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("episode-artwork").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("episode-artwork").getPublicUrl(path);
      setArtworkUrl(urlData.publicUrl);
      toast.success("Artwork uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
      setArtworkFile(null);
    } finally {
      setUploadingArtwork(false);
    }
  };

  const publishMutation = useMutation({
    mutationFn: async () => {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
      const status = publishOption === "now" ? "published" : publishOption === "schedule" ? "scheduled" : "draft";
      const { error } = await supabase.from("episodes").insert({
        creator_id: user!.id,
        title,
        title_urdu: titleUrdu || null,
        description,
        audio_url: audioUrl,
        artwork_url: artworkUrl || null,
        duration_seconds: audioDuration,
        category_ids: selectedCategories,
        language,
        has_content_warning: hasWarning,
        warning_text: hasWarning ? warningText : null,
        allow_download: allowDownload,
        status,
        publish_at: publishOption === "schedule" ? publishDate : publishOption === "now" ? new Date().toISOString() : null,
        series_id: seriesId,
        slug,
      });
      if (error) throw error;
      return slug;
    },
    onSuccess: (slug) => {
      toast.success(publishOption === "draft" ? "Saved as draft!" : "Episode published! 🎉");
      navigate("/dashboard/episodes");
    },
    onError: (err: any) => toast.error(err.message || "Failed to publish"),
  });

  const canProceed = () => {
    if (step === 0) return !!audioFile && !uploadingAudio;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  const onDrop = useCallback((e: React.DragEvent, handler: (f: File) => void, accept: string[]) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && accept.some((t) => file.type.includes(t))) handler(file);
    else toast.error("Invalid file type");
  }, []);

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold">Upload Episode</h1>
      <p className="mb-8 text-muted-foreground">Share your story with the world</p>

      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-sm sm:block ${i <= step ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className={`hidden h-px w-8 sm:block ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="rounded-2xl bg-card p-6 shadow-soft md:p-8"
        >
          {/* STEP 0: Audio */}
          {step === 0 && (
            <div>
              <h2 className="mb-4 font-heading text-xl font-semibold">Upload Audio</h2>
              {!audioFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, handleAudioUpload, ["audio"])}
                  className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "audio/*";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleAudioUpload(f);
                    };
                    input.click();
                  }}
                >
                  <Mic2 className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="mb-1 font-medium">Drag & drop your audio file</p>
                  <p className="text-sm text-muted-foreground">MP3, WAV, OGG — max 500MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{audioFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(audioFile.size / 1024 / 1024).toFixed(1)}MB
                        {audioDuration > 0 && ` · ${Math.floor(audioDuration / 60)}m ${audioDuration % 60}s`}
                      </p>
                    </div>
                    <button onClick={() => { setAudioFile(null); setAudioUrl(""); }} className="p-1 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {uploadingAudio && (
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary transition-all" style={{ width: `${audioProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="mb-4 font-heading text-xl font-semibold">Episode Details</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Episode title" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Urdu Title</label>
                <input value={titleUrdu} onChange={(e) => setTitleUrdu(e.target.value)} dir="rtl" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="اردو عنوان" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Tell listeners what this episode is about..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategories((prev) =>
                        prev.includes(cat.id) ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                      )}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCategories.includes(cat.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Language</label>
                <div className="flex gap-3">
                  {([["en", "English"], ["ur", "Urdu"], ["both", "Both"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setLanguage(val)}
                      className={`rounded-full px-4 py-2 text-sm font-medium ${language === val ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {series && series.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Series</label>
                  <select
                    value={seriesId || ""}
                    onChange={(e) => setSeriesId(e.target.value || null)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">No series</option>
                    {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div>
                  <p className="text-sm font-medium">Content Warning</p>
                  <p className="text-xs text-muted-foreground">Flag sensitive topics</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHasWarning(!hasWarning)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${hasWarning ? "bg-primary" : "bg-border"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${hasWarning ? "translate-x-5" : ""}`} />
                </button>
              </div>
              {hasWarning && (
                <textarea value={warningText} onChange={(e) => setWarningText(e.target.value)} rows={2} className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Describe the content warning..." />
              )}
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div>
                  <p className="text-sm font-medium">Allow Download</p>
                  <p className="text-xs text-muted-foreground">Let listeners save this episode</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDownload(!allowDownload)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${allowDownload ? "bg-primary" : "bg-border"}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${allowDownload ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Artwork */}
          {step === 2 && (
            <div>
              <h2 className="mb-4 font-heading text-xl font-semibold">Episode Artwork</h2>
              {!artworkFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, handleArtworkUpload, ["image"])}
                  className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border transition-colors hover:border-primary hover:bg-primary/5"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) handleArtworkUpload(f);
                    };
                    input.click();
                  }}
                >
                  <Image className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="mb-1 font-medium">Drag & drop artwork</p>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WebP — 1:1 ratio — max 10MB</p>
                </div>
              ) : (
                <div className="flex items-start gap-6">
                  <img src={artworkUrl || URL.createObjectURL(artworkFile)} alt="" className="h-48 w-48 rounded-2xl object-cover shadow-soft" />
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-medium">{artworkFile.name}</p>
                    <p className="mb-3 text-xs text-muted-foreground">{(artworkFile.size / 1024 / 1024).toFixed(1)}MB</p>
                    <button onClick={() => { setArtworkFile(null); setArtworkUrl(""); }} className="text-sm text-destructive hover:underline">Remove</button>
                  </div>
                </div>
              )}
              <p className="mt-4 text-sm text-muted-foreground">Skip this step to use a default artwork.</p>
            </div>
          )}

          {/* STEP 3: Publish */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="mb-4 font-heading text-xl font-semibold">Publish Settings</h2>
              <div className="space-y-3">
                {([["now", "Publish now"], ["schedule", "Schedule for later"], ["draft", "Save as draft"]] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPublishOption(val)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                      publishOption === val ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 ${publishOption === val ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {publishOption === val && <div className="m-0.5 h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              {publishOption === "schedule" && (
                <input
                  type="datetime-local"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < 3 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105 disabled:opacity-60"
          >
            {publishMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {publishOption === "draft" ? "Save Draft" : "Publish Episode"}
          </button>
        )}
      </div>
    </div>
  );
}
