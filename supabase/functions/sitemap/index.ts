// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const origin = req.headers.get("x-forwarded-host")
      ? `https://${req.headers.get("x-forwarded-host")}`
      : url.origin;

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const [episodes, series, creators] = await Promise.all([
      supabase.from("episodes").select("slug, updated_at").eq("status", "published").limit(5000),
      supabase.from("series").select("slug, created_at").limit(2000),
      supabase.from("profiles").select("id, updated_at").eq("role", "creator").limit(2000),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const urls: string[] = [
      `<url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${origin}/explore</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
      `<url><loc>${origin}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    ];

    for (const e of episodes.data ?? []) {
      const lastmod = (e.updated_at ?? today).split("T")[0];
      urls.push(
        `<url><loc>${origin}/episode/${escapeXml(e.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`
      );
    }
    for (const s of series.data ?? []) {
      urls.push(
        `<url><loc>${origin}/series/${escapeXml(s.slug)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
      );
    }
    for (const c of creators.data ?? []) {
      urls.push(
        `<url><loc>${origin}/creator/${c.id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("sitemap error", err);
    return new Response(`<?xml version="1.0"?><error>${(err as Error).message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
