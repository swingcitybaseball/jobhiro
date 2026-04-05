import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe/stripe";
import { supabase } from "@/lib/db/supabase";
import type Stripe from "stripe";

// Stripe sends raw POST bodies — we must NOT parse JSON first.
// Reading as ArrayBuffer preserves the raw bytes needed for signature verification.
export async function POST(req: NextRequest) {
  const body = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("Stripe webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!clerkUserId) {
          console.error("checkout.session.completed: no clerkUserId in metadata");
          break;
        }

        // Retrieve the subscription to get the price ID and period end.
        // Cast needed because SDK v22 types wrap retrieve() in Response<T>.
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const plan = planFromPriceId(priceId);

        await supabase.from("user_subscriptions").upsert(
          {
            user_id: clerkUserId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: "active",
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status === "active" ? "active" : "past_due";
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const plan = planFromPriceId(priceId);

        await supabase
          .from("user_subscriptions")
          .update({ plan, status })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabase
          .from("user_subscriptions")
          .update({ plan: "free", status: "canceled", stripe_subscription_id: null })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        // Unhandled event types — that's fine, just acknowledge receipt
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
