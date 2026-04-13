import { Link } from "react-router-dom";
import { Play, ArrowRight, Headphones, Heart, Users } from "lucide-react";
import { motion } from "framer-motion";
import { episodes, categories, formatDurationLong } from "@/lib/mock-data";
import { EpisodeCard } from "@/components/EpisodeCard";
import { useAudioStore } from "@/stores/audio-store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import heroIllustration from "@/assets/hero-illustration.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function Index() {
  const play = useAudioStore((s) => s.play);
  const featured = episodes[0];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero paper-texture">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p {...fadeUp} className="mb-4 font-heading text-2xl text-primary/70 md:text-3xl" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>
              وہ کہانیاں جو سنی جانی چاہیے
            </motion.p>
            <motion.h1 {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="mb-6 font-heading text-4xl font-bold leading-tight md:text-6xl">
              Stories that deserve{" "}
              <span className="text-gradient-warm">to be heard</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              A slow, intentional space for real voices, mental health, and meaningful conversations.
            </motion.p>
            <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.6 }} className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-105"
              >
                Start Listening <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 font-medium text-foreground transition-colors hover:bg-muted">
                Become a Creator
              </button>
            </motion.div>
            <motion.img
              {...fadeUp}
              transition={{ delay: 0.4, duration: 0.6 }}
              src={heroIllustration}
              alt="Person listening peacefully with headphones"
              className="mx-auto mt-12 w-64 md:w-80"
              width={1024}
              height={1024}
            />
          </div>
        </div>
        {/* Decorative bottom wave */}
        <svg className="absolute bottom-0 left-0 right-0 text-background" viewBox="0 0 1440 60" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,40 C480,80 960,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </section>

      {/* Featured Episode */}
      <section className="container py-16">
        <motion.div {...fadeUp} className="overflow-hidden rounded-3xl bg-card shadow-warm">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/20 md:aspect-auto">
              {featured.artworkUrl ? (
                <img src={featured.artworkUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center">
                  <Headphones className="h-24 w-24 text-primary/20" />
                </div>
              )}
              <button
                onClick={() => play(featured)}
                className="absolute bottom-6 left-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
              >
                <Play className="h-6 w-6 ml-0.5" />
              </button>
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Featured Episode
              </span>
              <span className={`mb-4 w-fit rounded-full px-3 py-1 text-xs font-medium ${featured.categoryColor}`}>
                {featured.category}
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
                <span>·</span>
                <span>{new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.slice(1, 4).map((ep, i) => (
            <EpisodeCard key={ep.id} episode={ep} index={i} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card py-16">
        <div className="container">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold md:text-3xl">Explore by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.name}`}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:scale-105 ${cat.color}`}
              >
                {cat.name}
              </Link>
            ))}
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

      {/* Creator CTA */}
      <section className="bg-gradient-hero paper-texture py-20">
        <div className="container text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">Have a story to tell?</h2>
          <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
            Join our community of storytellers. Share your voice with listeners who truly want to hear it.
          </p>
          <button className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-foreground transition-transform hover:scale-105">
            Apply as Creator <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
