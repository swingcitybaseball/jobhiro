"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

// Redirects the user to the Stripe Customer Portal to manage their subscription.
export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors flex items-center gap-2"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      Manage Subscription
    </button>
  );
}
