"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  priceId: string;
  highlight: boolean;
  label: string;
}

// Calls /api/checkout, then redirects to the Stripe Checkout page.
export function CheckoutButton({ priceId, highlight, label }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Not signed in — send them to sign up first, then back to pricing
        if (res.status === 401) {
          router.push("/sign-up?redirect=/pricing");
          return;
        }
        alert(data.error ?? "Something went wrong");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 ${
        highlight
          ? "bg-white text-gray-900 hover:bg-gray-100"
          : "bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {label}
    </button>
  );
}
