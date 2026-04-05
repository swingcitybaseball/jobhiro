"use client";

import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";

interface Props {
  isSignedIn: boolean;
}

// Client component for auth-sensitive nav items.
// The parent Server Component passes isSignedIn so we avoid a client-side flash.
export function NavAuth({ isSignedIn }: Props) {
  if (isSignedIn) {
    return (
      <>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          Dashboard
        </Link>
        <UserButton />
      </>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
        Sign in
      </button>
    </SignInButton>
  );
}
