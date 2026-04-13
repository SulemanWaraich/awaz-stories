import episodeArt1 from "@/assets/episode-art-1.jpg";
import episodeArt2 from "@/assets/episode-art-2.jpg";
import episodeArt3 from "@/assets/episode-art-3.jpg";
import episodeArt4 from "@/assets/episode-art-4.jpg";
import episodeArt5 from "@/assets/episode-art-5.jpg";
import episodeArt6 from "@/assets/episode-art-6.jpg";

export interface Episode {
  id: string;
  slug: string;
  title: string;
  titleUrdu?: string;
  description: string;
  hostName: string;
  artworkUrl: string;
  audioUrl: string;
  durationSeconds: number;
  category: string;
  categoryColor: string;
  language: string;
  playCount: number;
  likeCount: number;
  publishedAt: string;
  hasContentWarning: boolean;
  warningText?: string;
  seriesTitle?: string;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu: string;
  color: string;
}

export const categories: Category[] = [
  { id: "1", name: "Mental Health", nameUrdu: "ذہنی صحت", color: "bg-emerald-100 text-emerald-800" },
  { id: "2", name: "Stories", nameUrdu: "کہانیاں", color: "bg-amber-100 text-amber-800" },
  { id: "3", name: "Relationships", nameUrdu: "رشتے", color: "bg-rose-100 text-rose-800" },
  { id: "4", name: "Identity", nameUrdu: "شناخت", color: "bg-violet-100 text-violet-800" },
  { id: "5", name: "Work & Life", nameUrdu: "کام اور زندگی", color: "bg-sky-100 text-sky-800" },
  { id: "6", name: "Society", nameUrdu: "معاشرہ", color: "bg-orange-100 text-orange-800" },
  { id: "7", name: "Urdu Originals", nameUrdu: "اردو اصل", color: "bg-teal-100 text-teal-800" },
];

// Free sample audio for demo
const SAMPLE_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const episodes: Episode[] = [
  {
    id: "1",
    slug: "finding-home-within",
    title: "Finding Home Within",
    titleUrdu: "اپنے اندر گھر ڈھونڈنا",
    description: "A deeply personal conversation about what it means to feel at home — not in a place, but within yourself. We explore the journey of self-acceptance, the weight of displacement, and the quiet courage it takes to build a sense of belonging from the inside out.\n\nOur guest shares their experience of leaving behind everything familiar and discovering that home was never a location — it was a feeling they had to learn to carry with them.\n\n> \"I spent years searching for a place that felt right, until I realized the feeling I was chasing lived inside me all along.\"\n\nThis episode touches on themes of migration, identity, and the slow, beautiful work of becoming whole.",
    hostName: "Amara Shah",
    artworkUrl: episodeArt1,
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 2340,
    category: "Identity",
    categoryColor: "bg-violet-100 text-violet-800",
    language: "Bilingual",
    playCount: 1243,
    likeCount: 89,
    publishedAt: "2025-03-15",
    hasContentWarning: false,
    seriesTitle: "Inner Landscapes",
  },
  {
    id: "2",
    slug: "grief-is-not-linear",
    title: "Grief is Not Linear",
    titleUrdu: "غم ایک سیدھی لکیر نہیں",
    description: "We sit with grief in this episode — not to fix it, but to witness it. Our guest speaks about losing a parent and learning that grief doesn't follow stages or timelines. It arrives in waves, sometimes years later, in the middle of ordinary moments.\n\nA tender, honest conversation about what it means to carry loss while still choosing to live fully.",
    hostName: "Zain Ahmed",
    artworkUrl: episodeArt2,
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 1890,
    category: "Mental Health",
    categoryColor: "bg-emerald-100 text-emerald-800",
    language: "Urdu",
    playCount: 2105,
    likeCount: 156,
    publishedAt: "2025-03-08",
    hasContentWarning: true,
    warningText: "This episode discusses grief, loss, and death. Please listen with care.",
    seriesTitle: "Unspoken",
  },
  {
    id: "3",
    slug: "love-languages-across-cultures",
    title: "Love Languages Across Cultures",
    titleUrdu: "مختلف ثقافتوں میں محبت کی زبانیں",
    description: "How do we express love when our cultures have different vocabularies for it? This episode explores the gap between how South Asian families show care — through food, sacrifice, and silence — and how the next generation learns to speak love in new ways.",
    hostName: "Nadia Hussain",
    artworkUrl: episodeArt3,
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 2760,
    category: "Relationships",
    categoryColor: "bg-rose-100 text-rose-800",
    language: "English",
    playCount: 987,
    likeCount: 72,
    publishedAt: "2025-02-28",
    hasContentWarning: false,
    seriesTitle: "Between Us",
  },
  {
    id: "4",
    slug: "the-weight-of-silence",
    title: "The Weight of Silence",
    titleUrdu: "خاموشی کا بوجھ",
    description: "What happens when entire families are built on things left unsaid? This episode dives into generational silence — the secrets, the unspoken rules, and the emotional labor of being the one who finally breaks the pattern.",
    hostName: "Amara Shah",
    artworkUrl: "",
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 2100,
    category: "Stories",
    categoryColor: "bg-amber-100 text-amber-800",
    language: "Bilingual",
    playCount: 1567,
    likeCount: 134,
    publishedAt: "2025-02-20",
    hasContentWarning: true,
    warningText: "This episode discusses family trauma and emotional neglect.",
    seriesTitle: "Unspoken",
  },
  {
    id: "5",
    slug: "burnout-and-the-myth-of-productivity",
    title: "Burnout & The Myth of Productivity",
    titleUrdu: "تھکاوٹ اور پیداواری صلاحیت کا فسانہ",
    description: "We've been told that our worth is measured by our output. But what happens when the machine breaks down? A conversation about burnout, rest as resistance, and reclaiming time from capitalism.",
    hostName: "Farhan Malik",
    artworkUrl: "",
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 1980,
    category: "Work & Life",
    categoryColor: "bg-sky-100 text-sky-800",
    language: "English",
    playCount: 845,
    likeCount: 63,
    publishedAt: "2025-02-10",
    hasContentWarning: false,
    seriesTitle: "Slow Down",
  },
  {
    id: "6",
    slug: "reclaiming-our-stories",
    title: "Reclaiming Our Stories",
    titleUrdu: "اپنی کہانیوں کو واپس لینا",
    description: "Who gets to tell our stories? This episode explores narrative justice — the power dynamics of storytelling, the importance of owning your narrative, and why community-told stories matter more than ever.",
    hostName: "Zain Ahmed",
    artworkUrl: "",
    audioUrl: SAMPLE_AUDIO,
    durationSeconds: 2520,
    category: "Society",
    categoryColor: "bg-orange-100 text-orange-800",
    language: "Urdu",
    playCount: 1876,
    likeCount: 201,
    publishedAt: "2025-01-30",
    hasContentWarning: false,
    seriesTitle: "Inner Landscapes",
  },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDurationLong(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}
