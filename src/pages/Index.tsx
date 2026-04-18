import { Link } from "react-router-dom";
import { Play, ArrowRight, Headphones, Heart, Users, Loader2, Compass, Sparkles, BarChart3, Globe2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDurationLong } from "@/lib/mock-data";
import type { Episode } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { useAudioStore } from "@/stores/audio-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";
import heroIllustration from "@/assets/hero-illustration.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const TESTIMONIALS = [
  {
    quote: "Awaz feels like a quiet evening with a friend who truly listens. The stories stay with me long after I press pause.",
    attribution: "Listener from Karachi",
  },
  {
    quote: "I'd never shared my voice publicly before. Awaz gave me a place where my story didn't have to compete — it just had to be true.",
    attribution: "Storyteller from Lahore",
  },
  {
    quote: "The Urdu episodes feel like home. There's no rush here — just space to feel and reflect.",
    attribution: "Listener from Islamabad",
  },
];

export default function Index() {
  const play = useAudioStore((s) => s.play);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const { data: dbCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("id");
      return data || [];
    },
  });

  const { data: dbEpisodes, isLoading } = useQuery({
    queryKey: ["landing-episodes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("id, slug, title, title_urdu, description, artwork_url, audio_url, duration_seconds, language, play_count, publish_at, created_at, has_content_warning, warning_text, profiles!episodes_creator_id_fkey(display_name)")
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(9);
      return data || [];
    },
  });

  // Plays in last 24h (RPC)
  const { data: playsToday } = useQuery({
    queryKey: ["plays-24h"],
    queryFn: async () => {
      const { data } = await supabase.rpc("plays_last_24h");
      return Number(data) || 0;
    },
    refetchInterval: 60_000,
  });

  // Featured creator (one with is_featured = true)
  const { data: featuredCreator } = useQuery({
    queryKey: ["featured-creator"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .eq("is_featured", true)
        .eq("role", "creator")
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: featuredCreatorEpisodes = [] } = useQuery({
    queryKey: ["featured-creator-episodes", featuredCreator?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("id, slug, title, artwork_url, duration_seconds, publish_at")
        .eq("creator_id", featuredCreator!.id)
        .eq("status", "published")
        .order("publish_at", { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!featuredCreator,
  });

  const episodes: Episode[] = (dbEpisodes || []).map((ep) => ({
    id: ep.id,
    slug: ep.slug,
    title: ep.title,
    titleUrdu: ep.title_urdu || undefined,
    description: ep.description || "",
    hostName: (ep.profiles as any)?.display_name || "Creator",
    artworkUrl: ep.artwork_url || "",
    audioUrl: ep.audio_url || "",
    durationSeconds: ep.duration_seconds || 0,
    category: "Episode",
    categoryColor: "bg-muted text-muted-foreground",
    language: ep.language || "en",
    playCount: ep.play_count || 0,
    likeCount: 0,
    publishedAt: ep.publish_at || ep.created_at || "",
    hasContentWarning: ep.has_content_warning || false,
    warningText: ep.warning_text || undefined,
  }));

  const featured = episodes[0];
  const totalEpisodes = episodes.length;
  const totalCategories = (dbCategories || []).length;

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Awaz — Stories that deserve to be heard"
        description="A podcast platform for storytelling, mental health, and meaningful conversations in Urdu and English."
      />
      <Navbar />

      {/* Hero — full dark with radial violet glow */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-[720px] text-center">
            {/* Pill badge */}
            <motion.div {...fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                Stories that deserve to be heard
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mt-6 font-heading text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="block text-foreground">Listen to stories</span>
              <span className="block text-primary">that move you</span>
            </motion.h1>

            {/* Urdu subline */}
            <motion.p
              {...fadeUp}
              transition={{ delay: 0.18, duration: 0.6 }}
              className="mt-5 text-2xl text-primary/80"
              style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}
            >
              وہ کہانیاں جو سنی جانی چاہیے
            </motion.p>

            {/* Subtext */}
            <motion.p
              {...fadeUp}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mx-auto mt-6 max-w-xl text-lg font-light text-muted-foreground"
            >
              A podcast platform for real voices, mental health, and meaningful conversations — in Urdu and English.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.32, duration: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-heading font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:bg-primary-dim"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Listening
              </Link>
              <Link
                to="/auth/signup?role=creator"
                className="inline-flex items-center gap-2 rounded-full border border-elevated bg-transparent px-6 py-3 font-heading font-semibold text-foreground transition-colors hover:bg-elevated"
              >
                Become a Creator
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground/70"
            >
              <span>Join {(2400 + (playsToday ?? 0)).toLocaleString()}+ listeners</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{totalEpisodes || 5} episodes</span>
              <span className="text-muted-foreground/40">•</span>
              <span>{totalCategories || 7} categories</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Episode */}
      {featured && (
        <section className="container py-16">
          <motion.div {...fadeUp} className="overflow-hidden rounded-3xl bg-card shadow-warm">
            <div className="grid md:grid-cols-2">
              <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/20 md:aspect-auto">
                {featured.artworkUrl ? (
                  <img src={featured.artworkUrl} alt={featured.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-full min-h-[300px] items-center justify-center">
                    <Headphones className="h-24 w-24 text-primary/20" />
                  </div>
                )}
                {featured.audioUrl && (
                  <button
                    onClick={() => play(featured)}
                    className="absolute bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                    aria-label="Play featured episode"
                  >
                    <Play className="h-6 w-6 ml-0.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Featured Episode
                </span>
                <h2 className="mb-2 font-heading text-2xl font-bold md:text-3xl">{featured.title}</h2>
                {featured.titleUrdu && (
                  <p className="mb-4 text-lg text-muted-foreground" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>
                    {featured.titleUrdu}
                  </p>
                )}
                <p className="mb-6 line-clamp-3 text-muted-foreground">{featured.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{featured.hostName}</span>
                  <span>·</span>
                  <span>{formatDurationLong(featured.durationSeconds)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Recent Episodes */}
      <section className="container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold md:text-3xl">Recent Releases</h2>
            <p className="mt-1 text-muted-foreground">Fresh stories from our community</p>
          </div>
          <Link to="/explore" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : episodes.length > 1 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.slice(1, 4).map((ep, i) => (
              <EpisodeCard key={ep.id} episode={ep} index={i} />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="py-16 text-center">
            <Headphones className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="mb-2 text-lg font-medium text-muted-foreground">No stories yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share your voice.</p>
          </div>
        ) : null}
      </section>

      {/* Featured Creator Spotlight */}
      {featuredCreator && (
        <section className="bg-card py-20">
          <div className="container">
            <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
              <div className="mx-auto md:mx-0">
                <div className="h-40 w-40 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-4 ring-background">
                  {featuredCreator.avatar_url ? (
                    <img src={featuredCreator.avatar_url} alt={featuredCreator.display_name || "Creator"} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Users className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <span className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-primary">Featured Creator</span>
                <h2 className="mb-3 font-heading text-3xl font-bold">{featuredCreator.display_name}</h2>
                {featuredCreator.bio && (
                  <blockquote className="mb-6 border-l-4 border-accent pl-4 font-heading text-lg italic text-foreground/80">
                    "{featuredCreator.bio}"
                  </blockquote>
                )}
                <Link
                  to={`/creator/${featuredCreator.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  Visit profile <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {featuredCreatorEpisodes.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {featuredCreatorEpisodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/episode/${ep.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:border-primary/40"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {ep.artwork_url ? (
                        <img src={ep.artwork_url} alt={ep.title} className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Headphones className="h-5 w-5 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{ep.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDurationLong(ep.duration_seconds || 0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="bg-surface py-16">
        <div className="container">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold tracking-tight md:text-4xl">Explore by Category</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {(dbCategories || []).map((cat) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.name}`}
                className="rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-all hover:scale-[1.03] hover:border-primary/50 hover:bg-primary/15"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20">
        <h2 className="mb-12 text-center font-heading text-3xl font-bold">How Awaz works</h2>
        <div className="relative grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Connecting line on desktop */}
          <div className="absolute left-1/6 right-1/6 top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />
          {[
            { icon: Compass, title: "Discover", desc: "Browse stories by topic and mood" },
            { icon: Headphones, title: "Listen", desc: "Stream anywhere, continue where you left off" },
            { icon: Heart, title: "Connect", desc: "Follow creators, save episodes, join the conversation" },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-heading text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-hero paper-texture py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl">
            <div className="relative h-48">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-3xl bg-card p-8 shadow-soft md:p-10"
                >
                  <p className="mb-4 font-heading text-xl italic leading-relaxed text-foreground/80 md:text-2xl">
                    "{TESTIMONIALS[testimonialIdx].quote}"
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">— {TESTIMONIALS[testimonialIdx].attribution}</p>
                </motion.blockquote>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex justify-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === testimonialIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 font-heading text-2xl font-medium italic leading-relaxed text-foreground/80 md:text-3xl"
          >
            "We are in the business of keeping stories alive."
          </motion.blockquote>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Heart, title: "Slowness", desc: "No rush. No metrics. Just presence." },
              { icon: Users, title: "Community", desc: "Stories witnessed, not consumed." },
              { icon: Headphones, title: "Consent", desc: "Safety and care in every word." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-heading text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator CTA — split layout */}
      <section className="bg-card py-20">
        <div className="container">
          <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 p-8 md:grid-cols-2 md:p-12">
            <div className="order-2 md:order-1">
              <span className="mb-2 inline-block text-xs font-medium uppercase tracking-wider text-primary">For storytellers</span>
              <h2 className="mb-3 font-heading text-3xl font-bold md:text-4xl">Are you a storyteller?</h2>
              <p className="mb-6 text-lg text-muted-foreground">Your audience is already listening.</p>
              <ul className="mb-8 space-y-3">
                {[
                  { icon: Sparkles, text: "Free to upload — no fees, ever" },
                  { icon: BarChart3, text: "Full analytics on every episode" },
                  { icon: Heart, text: "Your story, your terms" },
                ].map((b) => (
                  <li key={b.text} className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <b.icon className="h-4 w-4" />
                    </div>
                    {b.text}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/signup?role=creator"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-foreground transition-transform hover:scale-105"
              >
                Start creating — it's free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 flex items-center justify-center md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl" />
                <img
                  src={heroIllustration}
                  alt="Storyteller at a microphone"
                  className="relative w-64 md:w-80"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
