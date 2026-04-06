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
        if (res.status === 401) {
          router.push("/sign-up?redirect=/pricing");
          return;
        }
        alert(data.error ?? "Something went wrong");
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-95 transition-transform"
      style={
        highlight
          ? {
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #a43e24, #ffac98)",
              color: "#fff7f6",
            }
          : {
              borderRadius: "9999px",
              border: "2px solid #b1b2af",
              background: "transparent",
              color: "#303330",
            }
      }
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : null}
      {label}
    </button>
  );
}
