"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";

interface Props {
  isSignedIn: boolean;
}

// Client component for auth-sensitive nav items.
// The parent Server Component passes isSignedIn to avoid a client-side flash.
export function NavAuth({ isSignedIn }: Props) {
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        className="px-6 py-2 font-semibold text-on-primary text-sm hover:scale-95 transition-transform duration-200"
        style={{
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #a43e24, #ffac98)",
        }}
      >
        Join
      </button>
    </SignInButton>
  );
}
