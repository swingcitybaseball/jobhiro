import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/stripe";
import { supabase } from "@/lib/db/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No subscription found. Please subscribe first.", redirect: "/pricing" },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Stripe throws if the customer ID was deleted from the Stripe dashboard
    const message = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[portal] Stripe error:", message);
    return NextResponse.json(
      { error: "No subscription found. Please subscribe first.", redirect: "/pricing" },
      { status: 400 }
    );
  }
}
