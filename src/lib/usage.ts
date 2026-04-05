// Server-side usage tracking helpers for the free tier gate.
// All functions use the service-role Supabase client.

import { createHash } from "crypto";
import { supabase } from "@/lib/db/supabase";
import type { SubscriptionPlan } from "@/types";

// One-way hash of an IP address for anonymous usage tracking.
// We never store raw IPs.
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

// Returns how many analyses this IP hash has run.
export async function getAnonymousUsageCount(ipHash: string): Promise<number> {
  const { data } = await supabase
    .from("anonymous_usage")
    .select("count")
    .eq("ip_hash", ipHash)
    .maybeSingle();
  return data?.count ?? 0;
}

// Increments (or creates) the usage record for this IP hash.
export async function incrementAnonymousUsage(ipHash: string): Promise<void> {
  await supabase.rpc("increment_anonymous_usage", { p_ip_hash: ipHash });
}

// Returns the user's subscription plan, or null if no subscription row exists (= free).
export async function getUserSubscription(
  userId: string
): Promise<{ plan: SubscriptionPlan; status: string } | null> {
  const { data } = await supabase
    .from("user_subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();
  return data as { plan: SubscriptionPlan; status: string } | null;
}

// How many analyses an authenticated user has saved.
export async function getAuthenticatedAnalysisCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
