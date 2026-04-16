<div align="center">

<img src="https://img.shields.io/badge/Awaz-آواز-2C5F4A?style=for-the-badge&labelColor=0F1511" alt="Awaz" height="60"/>

# آواز · Awaz

### *Stories that deserve to be heard*

A full-stack, bilingual (Urdu + English) podcast streaming platform for storytelling, mental health, and meaningful conversations.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-awaz.fm-2C5F4A?style=flat-square&logo=netlify&logoColor=white)](https://awaz.fm)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-E8A87C?style=flat-square)](LICENSE)

<br/>

![Awaz Platform Preview](https://placehold.co/1200x600/FDFAF5/2C5F4A?text=Awaz+Platform+Screenshot&font=playfair-display)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Supabase Setup](#supabase-setup)
  - [Running Locally](#running-locally)
- [Deployment on Netlify](#-deployment-on-netlify)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API & Edge Functions](#-api--edge-functions)
- [PWA Support](#-pwa-support)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🎙 About the Project

**Awaz (آواز)** means *voice* in Urdu. This platform was built on one belief: every voice deserves a stage — in whatever language it speaks, whatever accent it carries, whatever story it holds.

Inspired by the slow, intentional storytelling philosophy of community podcasts like [Utar Chadhav](https://www.utarchadhav.com/), Awaz is a **SaaS podcast platform** that values depth over virality, connection over consumption, and stories over statistics.

It is **not** a generic podcast aggregator. It is a curated, community-first space focused on:

- 🧠 Mental health conversations
- 🫂 Relationships and identity
- 🌍 South Asian stories in Urdu + English
- 🎨 Independent creators without algorithmic pressure

> *"We are in the business of keeping stories alive."*

---

## ✨ Features

### For Listeners
- 🎧 **Stream podcasts** with a persistent, Spotify-style audio player
- 🔍 **Discover episodes** via search, category filters, and curated sections
- ❤️ **Like & bookmark** episodes to build a personal library
- 💬 **Comment & reply** with optional anonymous posting
- 📋 **Queue management** — build your listening queue, drag to reorder
- 🕐 **Recently played** — continue where you left off
- 🔔 **Notifications** — get notified when creators you follow publish
- 👤 **Listener profile** with saved, liked, and following tabs
- 🌙 **Dark mode** — system preference + manual toggle

### For Creators
- ⬆️ **Upload episodes** — MP3/WAV/OGG up to 500MB with a 4-step wizard
- 🖼️ **Custom artwork** — drag-and-drop image upload with live card preview
- 📝 **Rich descriptions** — full rich text editor with Urdu RTL support
- 📅 **Schedule publishing** — publish now or schedule for a future date
- 📚 **Series / Seasons** — organize episodes into series with dedicated pages
- ⚠️ **Content warnings** — flag mental health and sensitive episodes
- 📊 **Analytics dashboard** — plays, likes, comments, completion rate
- 🔗 **Embed player** — shareable iframe for any website
- 🧩 **Creator profile** — public page with bio, social links, and all episodes

### Platform
- 🔐 **Role-based auth** — Listener and Creator roles with Supabase Auth
- 📱 **PWA** — installable on Android and iOS, works offline
- ⌨️ **Cmd+K search** — full-screen overlay searching episodes, creators, series
- 🌍 **SEO-optimized** — meta tags, OG images, JSON-LD structured data, sitemap
- 🛡️ **Admin panel** — manage users, episodes, reports, and categories
- 🚨 **Content moderation** — report system for episodes and comments
- 📬 **Email notifications** — new episode alerts and welcome emails via Edge Functions
- 🔒 **Row Level Security** — all Supabase tables protected with RLS policies

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + CSS Variables |
| **Animations** | Framer Motion |
| **Routing** | React Router v6 |
| **State Management** | Zustand (audio player + queue) |
| **Forms** | React Hook Form + Zod |
| **Rich Text** | TipTap |
| **Audio** | HTML5 Audio API / Howler.js |
| **Charts** | Recharts |
| **File Uploads** | React Dropzone |
| **Backend** | Supabase (Auth + Postgres + Storage + Realtime) |
| **Edge Functions** | Supabase Edge Functions (Deno) |
| **Email** | Resend API (via Edge Functions) |
| **PWA** | vite-plugin-pwa + Workbox |
| **SEO** | react-helmet-async |
| **Fonts** | Lora (serif headings) · DM Sans (body) · Noto Nastaliq Urdu |
| **Deployment** | Netlify (frontend) + Supabase Cloud (backend) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│                                                         │
│   React 18 + TypeScript + Vite                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│   │  Pages   │ │Components│ │  Zustand │ │  Hooks   │  │
│   │ /explore │ │ Player   │ │  Audio   │ │useEpisode│  │
│   │ /episode │ │ Cards    │ │  Store   │ │useAuth   │  │
│   │/dashboard│ │ Forms    │ │  Queue   │ │useSearch │  │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS / WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                      SUPABASE                           │
│                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│  │   Auth    │ │ Postgres  │ │  Storage  │             │
│  │  (JWT)    │ │ + RLS     │ │  Buckets  │             │
│  └───────────┘ └───────────┘ └───────────┘             │
│  ┌───────────┐ ┌───────────┐                           │
│  │ Realtime  │ │  Edge     │                           │
│  │(WebSocket)│ │Functions  │──► Resend (Email)         │
│  └───────────┘ └───────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

```sql
profiles          -- extends auth.users (role, bio, avatar, social links)
categories        -- Mental Health, Stories, Relationships, etc.
series            -- podcast series / seasons
episodes          -- audio episodes (core content table)
likes             -- user ↔ episode likes
bookmarks         -- user ↔ episode saves
comments          -- threaded comments with anonymous support
play_events       -- analytics: every play logged here
subscriptions     -- listeners follow creators
notifications     -- in-app notification feed
reports           -- content moderation reports
```

<details>
<summary>View full schema SQL</summary>

```sql
-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'listener' CHECK (role IN ('listener', 'creator', 'admin')),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  preferred_categories INTEGER[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_urdu TEXT,
  color_hex TEXT DEFAULT '#2C5F4A',
  slug TEXT UNIQUE NOT NULL
);

-- SERIES
CREATE TABLE public.series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_urdu TEXT,
  description TEXT,
  artwork_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EPISODES
CREATE TABLE public.episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_urdu TEXT,
  description TEXT,
  audio_url TEXT,
  artwork_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  transcript_url TEXT,
  category_ids INTEGER[] DEFAULT '{}',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur', 'both')),
  has_content_warning BOOLEAN DEFAULT FALSE,
  warning_text TEXT,
  allow_download BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','archived')),
  publish_at TIMESTAMPTZ,
  play_count INTEGER DEFAULT 0,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LIKES
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- BOOKMARKS
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- COMMENTS
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  display_name TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAY EVENTS
CREATE TABLE public.play_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  duration_played_seconds INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listener_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listener_id, creator_id)
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REPORTS
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id),
  content_type TEXT CHECK (content_type IN ('episode', 'comment', 'creator')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLAY COUNT INCREMENT (atomic, race-condition safe)
CREATE OR REPLACE FUNCTION increment_play_count(episode_uuid UUID)
RETURNS void LANGUAGE sql AS $$
  UPDATE episodes SET play_count = play_count + 1 WHERE id = episode_uuid;
$$;
```

</details>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9+ or **yarn** v1.22+
- **Git** — [git-scm.com](https://git-scm.com)
- A **Supabase** account — [supabase.com](https://supabase.com) (free tier works)

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/awaz.git

# 2. Navigate into the project
cd awaz

# 3. Install dependencies
npm install

# 4. Copy the environment variables template
cp .env.example .env.local
```

---

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# ─── Supabase ───────────────────────────────────────────
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ─── App ────────────────────────────────────────────────
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Awaz

# ─── Email (Resend) — for Edge Functions only ───────────
# Set these in Supabase Dashboard → Edge Functions → Secrets
# RESEND_API_KEY=re_xxxxxxxx
# FROM_EMAIL=hello@awaz.fm
```

> **Never commit `.env.local` to Git.** It is already in `.gitignore`.

To get your Supabase credentials:
1. Go to [supabase.com](https://supabase.com) → your project
2. Settings → API
3. Copy **Project URL** and **anon public** key

---

### Supabase Setup

**Step 1 — Create a new Supabase project**

Go to [app.supabase.com](https://app.supabase.com) → New Project → fill in name and password → Create.

**Step 2 — Run the database schema**

In your Supabase project: SQL Editor → New Query → paste the full schema SQL from the [Database Schema](#-database-schema) section above → Run.

**Step 3 — Create Storage Buckets**

Go to Storage → New Bucket for each:

| Bucket Name | Public | Max File Size | Allowed MIME Types |
|---|---|---|---|
| `episode-audio` | ✅ Yes | 500 MB | `audio/mpeg, audio/wav, audio/ogg` |
| `episode-artwork` | ✅ Yes | 10 MB | `image/jpeg, image/png, image/webp` |
| `avatars` | ✅ Yes | 5 MB | `image/jpeg, image/png, image/webp` |

**Step 4 — Enable RLS + Policies**

In SQL Editor, run:

```sql
-- Allow public read on all published episodes
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published episodes"
  ON episodes FOR SELECT USING (status = 'published');
CREATE POLICY "Creators manage own episodes"
  ON episodes FOR ALL USING (auth.uid() = creator_id);

-- Profiles: public read, own update
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Likes: auth users only
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth users manage own likes"
  ON likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read likes"
  ON likes FOR SELECT USING (true);

-- Bookmarks: private to user
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks"
  ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Comments: public read, auth write
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read comments"
  ON comments FOR SELECT USING (true);
CREATE POLICY "Auth users post comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Public read audio"
  ON storage.objects FOR SELECT USING (bucket_id = 'episode-audio');
CREATE POLICY "Auth users upload audio"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'episode-audio' AND auth.role() = 'authenticated'
  );
CREATE POLICY "Public read artwork"
  ON storage.objects FOR SELECT USING (bucket_id = 'episode-artwork');
CREATE POLICY "Auth users upload artwork"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'episode-artwork' AND auth.role() = 'authenticated'
  );
```

**Step 5 — Create the auto-profile trigger**

```sql
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'listener')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Step 6 — Seed categories**

```sql
INSERT INTO categories (name, name_urdu, color_hex, slug) VALUES
  ('Mental Health',  'ذہنی صحت',    '#7FB5A0', 'mental-health'),
  ('Stories',        'کہانیاں',      '#E8A87C', 'stories'),
  ('Relationships',  'تعلقات',       '#C9A0DC', 'relationships'),
  ('Identity',       'شناخت',        '#F4A261', 'identity'),
  ('Work & Life',    'کام اور زندگی', '#6B9BC3', 'work-life'),
  ('Society',        'معاشرہ',       '#E76F51', 'society'),
  ('Urdu Originals', 'اردو اصل',     '#2C5F4A', 'urdu-originals');
```

**Step 7 — Configure Auth**

In Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:5173` (change to your production URL later)
- Redirect URLs: add `http://localhost:5173/**` and `https://yourdomain.com/**`

---

### Running Locally

```bash
# Start the development server
npm run dev

# App will be available at:
# http://localhost:5173
```

Other useful commands:

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview

# Run TypeScript type checking
npm run typecheck

# Lint the codebase
npm run lint

# Analyze bundle size
npm run build -- --mode analyze
```

---

## 🌐 Deployment on Netlify

Awaz deploys to Netlify in under 5 minutes. Follow these steps exactly.

### Step 1 — Push to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "feat: initial Awaz platform"

# Create a new repo on github.com, then:
git remote add origin https://github.com/yourusername/awaz.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Go to [netlify.com](https://netlify.com) → Log in → **Add new site**
2. Click **Import an existing project**
3. Click **Deploy with GitHub**
4. Authorize Netlify to access your GitHub
5. Select your `awaz` repository

### Step 3 — Configure Build Settings

In the Netlify deployment screen, set:

| Setting | Value |
|---|---|
| **Base directory** | *(leave empty)* |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Node version** | `18` |

### Step 4 — Add Environment Variables

In Netlify → Site settings → **Environment variables** → Add variable:

```
VITE_SUPABASE_URL          = https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY     = your-supabase-anon-key
VITE_APP_URL               = https://your-netlify-domain.netlify.app
VITE_APP_NAME              = Awaz
```

> Replace `VITE_APP_URL` with your actual Netlify URL (you get this after the first deploy).

### Step 5 — Add the `_redirects` File

React Router requires this for client-side routing to work on Netlify.

Create a file at `public/_redirects`:

```
/*    /index.html   200
```

Commit and push:

```bash
git add public/_redirects
git commit -m "fix: add Netlify redirects for client-side routing"
git push
```

### Step 6 — Deploy

Click **Deploy site** in Netlify. Your first build will take 1–2 minutes.

Once deployed, you'll get a URL like `https://awaz-xyz123.netlify.app`.

### Step 7 — Update Supabase Auth URLs

Go back to Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-netlify-domain.netlify.app`
- **Redirect URLs**: add `https://your-netlify-domain.netlify.app/**`

### Step 8 — Custom Domain (Optional)

In Netlify → Domain management → Add custom domain:

1. Enter your domain (e.g., `awaz.fm`)
2. Netlify will give you nameservers or a CNAME record
3. Update your domain registrar's DNS settings
4. Netlify provisions an SSL certificate automatically (Let's Encrypt)
5. Update `VITE_APP_URL` environment variable to `https://awaz.fm`
6. Update Supabase Site URL and Redirect URLs to match

### Automatic Deploys

After setup, every `git push` to `main` automatically triggers a new Netlify deploy. No manual steps needed.

```bash
# Make changes, then:
git add .
git commit -m "feat: add new feature"
git push   # ← Netlify auto-deploys
```

---

## 📁 Project Structure

```
awaz/
├── public/
│   ├── _redirects              # Netlify client-side routing fix
│   ├── robots.txt              # SEO crawler rules
│   ├── sitemap.xml             # Dynamic sitemap (generated via Edge Function)
│   ├── icons/                  # PWA icons (72, 96, 128, 192, 512px)
│   └── og-default.png          # Default Open Graph image (1200x630)
│
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable primitives (Button, Card, Badge, Toast)
│   │   ├── layout/             # Navbar, Footer, Sidebar, AudioPlayer
│   │   ├── episodes/           # EpisodeCard, EpisodeGrid, EpisodeRow
│   │   ├── player/             # PersistentPlayer, MobilePlayer, QueueDrawer
│   │   ├── search/             # CmdKOverlay, SearchResults
│   │   ├── auth/               # SignupForm, LoginForm, RoleSelector
│   │   ├── dashboard/          # UploadWizard, AnalyticsCharts, EpisodeTable
│   │   └── seo/                # PageSEO, StructuredData
│   │
│   ├── pages/
│   │   ├── Landing.tsx         # Homepage
│   │   ├── Explore.tsx         # Discovery page
│   │   ├── EpisodeDetail.tsx   # Episode + player + comments
│   │   ├── SeriesDetail.tsx    # Series page
│   │   ├── CreatorProfile.tsx  # Public creator page
│   │   ├── ListenerProfile.tsx # Listener profile + tabs
│   │   ├── About.tsx           # Our story page
│   │   ├── Notifications.tsx   # Notification feed
│   │   ├── dashboard/
│   │   │   ├── Overview.tsx
│   │   │   ├── MyEpisodes.tsx
│   │   │   ├── Upload.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── admin/
│   │   │   ├── AdminOverview.tsx
│   │   │   ├── AdminEpisodes.tsx
│   │   │   ├── AdminUsers.tsx
│   │   │   └── AdminReports.tsx
│   │   └── auth/
│   │       ├── Signup.tsx
│   │       ├── Login.tsx
│   │       ├── ForgotPassword.tsx
│   │       └── ResetPassword.tsx
│   │
│   ├── stores/
│   │   ├── audioStore.ts       # Zustand: player state, queue, recently played
│   │   └── authStore.ts        # Zustand: current user, role
│   │
│   ├── hooks/
│   │   ├── useEpisodes.ts      # Fetch + filter episodes from Supabase
│   │   ├── useAudio.ts         # Audio playback controls
│   │   ├── useSearch.ts        # Debounced search logic
│   │   ├── useDarkMode.ts      # Dark mode toggle + persistence
│   │   └── useNotifications.ts # Realtime notification subscription
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client initialization
│   │   ├── utils.ts            # Helpers (formatDuration, slugify, etc.)
│   │   └── constants.ts        # App-wide constants
│   │
│   ├── styles/
│   │   ├── globals.css         # CSS variables, dark mode tokens, base styles
│   │   └── fonts.css           # Font-face declarations
│   │
│   ├── types/
│   │   └── database.ts         # TypeScript types matching Supabase schema
│   │
│   ├── App.tsx                 # Router + providers
│   └── main.tsx                # Entry point
│
├── supabase/
│   └── functions/
│       ├── new-episode-notification/   # Email when episode published
│       ├── welcome-email/              # Welcome email on signup
│       ├── increment-play-count/       # Atomic play counter
│       └── sitemap/                    # Dynamic sitemap.xml generator
│
├── .env.example                # Environment variable template
├── .env.local                  # Local secrets (gitignored)
├── .gitignore
├── index.html
├── netlify.toml                # Netlify build configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Visitor** (unauthenticated) | Browse and read. Cannot play, like, or comment. |
| **Listener** | Full playback, likes, bookmarks, comments, queue, profile. |
| **Creator** | Everything listeners can do + full creator dashboard, uploads, analytics. |
| **Admin** | Full platform access + admin panel for moderation. |

To promote a user to admin, run in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-uuid-here';
```

---

## ⚡ API & Edge Functions

Edge Functions live in `/supabase/functions/` and are deployed to Supabase.

| Function | Trigger | Description |
|---|---|---|
| `new-episode-notification` | Episode published | Emails all creator's subscribers |
| `welcome-email` | New user signup | Sends role-specific welcome email |
| `increment-play-count` | Audio play event | Atomically increments play_count |
| `sitemap` | HTTP GET /api/sitemap | Generates dynamic sitemap.xml |
| `health` | HTTP GET /api/health | Platform health check for uptime monitors |

Deploy edge functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy

# Set secrets for email
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set FROM_EMAIL=hello@awaz.fm
```

---

## 📱 PWA Support

Awaz is a fully installable Progressive Web App.

**Features:**
- ✅ Installable on Android (Chrome) and iOS (Safari — Add to Home Screen)
- ✅ App shell cached for instant load (CacheFirst)
- ✅ Episode artwork cached (100 entries, 30-day expiry)
- ✅ Supabase API: NetworkFirst with cache fallback
- ✅ Offline fallback page
- ✅ Install prompt after 3rd visit or first episode play

**To test PWA locally:**

```bash
npm run build
npm run preview
# Open http://localhost:4173 in Chrome
# DevTools → Application → Service Workers
```

---

## 🤝 Contributing

Contributions are welcome! This is an open platform for storytellers.

```bash
# Fork the repo, then:
git clone https://github.com/yourusername/awaz.git
cd awaz
git checkout -b feature/your-feature-name
npm install
npm run dev
```

**Guidelines:**
- Follow the existing code style (ESLint + Prettier configured)
- Write meaningful commit messages (`feat:`, `fix:`, `docs:`, `refactor:`)
- Test your changes on both mobile (375px) and desktop (1280px)
- Ensure dark mode works for any new UI you add
- Do not introduce new hardcoded colors — always use CSS variables

Open a Pull Request against the `main` branch with a clear description of what you changed and why.

---

## 🗺 Roadmap

- [ ] **Mobile App** — React Native with Expo (iOS + Android)
- [ ] **Transcript Search** — full-text search inside episode transcripts
- [ ] **AI Episode Summary** — auto-generated summaries via Claude API
- [ ] **Chapters** — timestamp-based chapter markers in episodes
- [ ] **Playlist** — community-curated playlists
- [ ] **Live Recording** — in-browser podcast recording for creators
- [ ] **Subscription Tiers** — paid creator subscriptions (Stripe)
- [ ] **Multi-language** — Hindi, Punjabi, Bengali support
- [ ] **Spotify/Apple RSS** — RSS feed export for distribution to other platforms
- [ ] **Studio Mode** — collaborative multi-host recording sessions

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for full text.

```
MIT License — Copyright (c) 2026 Awaz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Acknowledgements

- **[Utar Chadhav](https://www.utarchadhav.com/)** — the storytelling philosophy and community spirit that inspired this platform. Their commitment to slow, intentional, consent-based storytelling shaped everything here.
- **[Supabase](https://supabase.com)** — for making a full backend accessible to indie developers
- **[Netlify](https://netlify.com)** — for frictionless frontend deployment
- **[Framer Motion](https://www.framer.com/motion/)** — for the gentle animations that give the platform its calm feel
- **[Recharts](https://recharts.org)** — for the creator analytics visualizations
- **[TipTap](https://tiptap.dev)** — for the rich text editor with Urdu support
- Custom full-stack architecture (React + TypeScript) — built and structured the application using React with TypeScript, implementing modular component architecture, Context API for        state management, RESTful API integration, and optimized rendering for performance and scalability]
- Every storyteller who believes their voice matters 🎙

---

<div align="center">

**آواز** · Built with ❤️ for storytellers everywhere

[Website](https://awaz.fm) · [Report Bug](https://github.com/yourusername/awaz/issues) · [Request Feature](https://github.com/yourusername/awaz/issues)

*"We are in the business of keeping stories alive."*

</div>
