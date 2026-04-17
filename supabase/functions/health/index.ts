import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const start = Date.now();
  let dbOk = false;
  let storageOk = false;

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const dbCheck = await supabase.from("categories").select("id", { head: true, count: "exact" });
    dbOk = !dbCheck.error;
    const buckets = await supabase.storage.listBuckets();
    storageOk = !buckets.error;
  } catch (e) {
    console.error("health error", e);
  }

  const status = dbOk && storageOk ? "ok" : "degraded";
  return new Response(
    JSON.stringify({
      status,
      db: dbOk,
      storage: storageOk,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
