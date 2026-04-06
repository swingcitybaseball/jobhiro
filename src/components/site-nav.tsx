import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NavAuth } from "./nav-auth";

/**
 * Shared floating pill nav used across all public pages.
 * Server component — calls auth() internally so pages don't need to pass it.
 */
export async function SiteNav() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 flex justify-between items-center px-8 py-3"
      style={{
        borderRadius: "9999px",
        background: "rgba(250, 249, 246, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0px 20px 40px rgba(48, 51, 48, 0.08)",
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        className="text-2xl font-bold text-on-surface"
        style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
      >
        JobHiro
      </Link>

      {/* Links */}
      <div className="hidden md:flex gap-8 items-center">
        <a
          href="/#features"
          className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium text-sm"
        >
          Features
        </a>
        <a
          href="/#pricing"
          className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium text-sm"
        >
          Pricing
        </a>
        <Link
          href="/blog"
          className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium text-sm"
        >
          Blog
        </Link>
        {isSignedIn && (
          <Link
            href="/dashboard"
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-medium text-sm"
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* Auth */}
      <NavAuth isSignedIn={isSignedIn} />
    </nav>
  );
}
