import { Link } from "react-router-dom";
import { Heart, Users, Headphones, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageSEO } from "@/components/PageSEO";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-hero paper-texture py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <motion.p {...fadeUp} className="mb-3 font-heading text-xl text-primary/70" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>
              ہماری کہانی
            </motion.p>
            <motion.h1 {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="mb-4 font-heading text-4xl font-bold leading-tight md:text-5xl">
              Our Story
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="text-lg text-muted-foreground">
              Why Awaz exists
            </motion.p>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-[720px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="prose prose-lg"
          >
            <p className="text-lg leading-relaxed text-foreground/80">
              Awaz started as a question: <em>whose voices get to be heard?</em>
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              We noticed that so many stories — about mental health, identity, relationships, and everyday life — were being told in English, for one kind of audience. We wanted to change that. We wanted a space where a grandmother's wisdom in Urdu carried the same weight as a TED talk, where a first-generation immigrant could share their story without code-switching, where silence between words was honored, not edited out.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              <strong>Awaz (آواز)</strong> means "voice" in Urdu. This platform is built on the belief that every voice deserves a stage — in whatever language it speaks, whatever accent it carries, whatever story it holds.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80">
              Inspired by the slow, intentional storytelling of communities like Utar Chadhav, we built a space that values depth over virality, connection over consumption, and stories over statistics. Here, you won't find algorithmic recommendations designed to keep you scrolling. Instead, you'll find carefully crafted episodes meant to be sat with, reflected on, and returned to.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-card py-16">
        <div className="container">
          <h2 className="mb-10 text-center font-heading text-2xl font-bold md:text-3xl">What We Believe</h2>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
            {[
              {
                icon: Heart,
                title: "Slowness",
                titleUrdu: "سست روی",
                desc: "We believe good stories take time. We never rush. Every episode is an invitation to pause, breathe, and truly listen.",
              },
              {
                icon: Users,
                title: "Community",
                titleUrdu: "برادری",
                desc: "Listeners are not users. They are witnesses. Creators are not content machines. They are storytellers. We build for connection, not metrics.",
              },
              {
                icon: Shield,
                title: "Consent & Safety",
                titleUrdu: "رضامندی",
                desc: "Your voice belongs to you, always. Content warnings are not optional. Mental health resources are not afterthoughts. Care is built into every interaction.",
              },
            ].map(({ icon: Icon, title, titleUrdu, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-background p-6 shadow-soft"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-heading text-lg font-semibold">{title}</h3>
                <p className="mb-3 text-sm text-muted-foreground" style={{ fontFamily: '"Noto Nastaliq Urdu", serif', direction: "rtl" }}>
                  {titleUrdu}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold md:text-3xl">Built with Love</h2>
          <p className="mb-10 text-muted-foreground">
            Built by a small team who believes in the power of stories to heal, connect, and transform.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Amara Shah", role: "Founder & Host" },
              { name: "Zain Ahmed", role: "Audio & Production" },
              { name: "Nadia Hussain", role: "Community & Content" },
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {member.name.charAt(0)}
                </div>
                <p className="font-heading text-sm font-semibold">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-gradient-hero paper-texture py-16">
        <div className="container text-center">
          <h2 className="mb-3 font-heading text-2xl font-bold md:text-3xl">
            Whether you listen or create, you are part of this story
          </h2>
          <p className="mb-8 text-muted-foreground">Join a community that values every voice.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Start Listening <Headphones className="h-4 w-4" />
            </Link>
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-7 py-3.5 font-medium transition-colors hover:bg-muted"
            >
              Become a Creator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
