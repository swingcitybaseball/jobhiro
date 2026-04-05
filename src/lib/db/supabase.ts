import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton — only instantiated on first use, not at module load.
// Prevents build-time crashes when Supabase env vars aren't set yet.
let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error("Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY) are not set");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Proxy so callers can write `supabase.from(...)` without calling getSupabase() explicitly
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});
