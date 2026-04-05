import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only /dashboard requires authentication.
// Everything else — homepage, results, API routes — is public.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Next.js 16 uses proxy.ts (not middleware.ts) — export must be named "proxy"
export const proxy = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // redirects to CLERK_SIGN_IN_URL if not signed in
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
