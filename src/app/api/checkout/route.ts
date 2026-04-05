import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe/stripe";
import { supabase } from "@/lib/db/supabase";

// Only these two price IDs are valid — prevents spoofed requests from
// creating sessions with arbitrary Stripe prices.
function getAllowedPriceIds(): string[] {
  return [
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
  ].filter((id): id is string => !!id);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Must be signed in to subscribe" }, { status: 401 });
  }

  const { priceId } = await req.json();
  if (!priceId) {
    return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
  }

  // Validate that the priceId is one of our known plans
  const allowed = getAllowedPriceIds();
  if (!allowed.includes(priceId)) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 });
  }

  // Reuse existing Stripe customer if we have one
  const { data: sub } = await supabase
    .from("user_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    // Pass Clerk user ID in metadata so the webhook can link back
    metadata: { clerkUserId: userId },
    client_reference_id: userId,
    // Reuse existing customer or let Stripe create a new one
    ...(sub?.stripe_customer_id ? { customer: sub.stripe_customer_id } : {}),
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
