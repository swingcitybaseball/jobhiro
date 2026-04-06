"use client";

import { useState } from "react";
import { X, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  show: boolean;
}

export function UpgradeBanner({ show }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 shadow-2xl"
      style={{ background: "linear-gradient(135deg, #a43e24, #943219)" }}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Zap size={18} className="shrink-0" style={{ color: "#ffac98" }} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-on-primary">
            You&apos;ve used your 1 free analysis.
          </p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,247,246,0.7)" }}>
            Upgrade to Pro for 30 analyses/month, saved history, and PDF downloads.
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 px-4 py-2 text-sm font-bold hover:scale-95 transition-transform"
          style={{
            borderRadius: "9999px",
            backgroundColor: "#ffffff",
            color: "#a43e24",
          }}
        >
          Go Pro →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: "rgba(255,247,246,0.6)" }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
