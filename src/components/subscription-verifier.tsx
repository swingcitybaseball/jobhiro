"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Silently calls /api/verify-subscription on mount.
// If Stripe shows an active plan that Supabase doesn't have yet (e.g. webhook
// missed in local dev), the API syncs Supabase and returns synced:true, which
// triggers a router.refresh() so the dashboard re-renders with the correct plan.
export function SubscriptionVerifier() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/verify-subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data.synced) {
          // Plan was just updated in Supabase — re-render the server component
          router.refresh();
        }
      })
      .catch(() => {
        // Non-critical — don't surface errors to the user
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // renders nothing
}
