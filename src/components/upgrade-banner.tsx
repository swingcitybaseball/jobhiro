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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white px-6 py-4 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Zap size={18} className="text-yellow-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">You&apos;ve used your 1 free analysis.</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Create an account and upgrade to Pro for unlimited analyses, saved history, and PDF downloads.
          </p>
        </div>
        <Link
          href="/pricing"
          className="shrink-0 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Go Pro →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
