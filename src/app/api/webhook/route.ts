import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe/stripe";
import { supabase } from "@/lib/db/supabase";
import type Stripe from "stripe";

// Stripe requires the raw POST body for signature verification.
// Do NOT use Next.js automatic body parsing here.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = Buffer.from(await req.arrayBuffer());
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[webhook] signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log("[webhook] received event:", event.type);

  try {
    switch (event.type) {
      // ── New subscription after checkout ─────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId = session.metadata?.clerkUserId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!clerkUserId) {
          console.error("[webhook] checkout.session.completed: no clerkUserId in metadata");
          break;
        }

        // Retrieve the subscription to get the price ID (and confirm it's active)
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as unknown as Stripe.Subscription;

        const priceId = subscription.items.data[0]?.price.id ?? "";
        const plan = planFromPriceId(priceId);

        const { error } = await supabase.from("user_subscriptions").upsert(
          {
            user_id: clerkUserId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: "active",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (error) console.error("[webhook] checkout.session.completed upsert failed:", error.message);
        else console.log(`[webhook] activated ${plan} for user ${clerkUserId}`);
        break;
      }

      // ── Plan change or renewal ───────────────────────────────────────────
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id ?? "";
        const plan = planFromPriceId(priceId);

        // Map Stripe subscription statuses to our internal values
        let status: string;
        switch (subscription.status) {
          case "active":
            status = "active";
            break;
          case "past_due":
            status = "past_due";
            break;
          case "canceled":
          case "unpaid":
            status = "canceled";
            break;
          default:
            status = subscription.status;
        }

        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            plan,
            status,
            // Clear the subscription ID when the sub is canceled via this event
            // (mirrors the behavior in subscription.deleted)
            ...(status === "canceled" ? { stripe_subscription_id: null } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("[webhook] subscription.updated failed:", error.message);
        else console.log(`[webhook] updated customer ${customerId} → plan:${plan} status:${status}`);
        break;
      }

      // ── Cancellation ─────────────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabase
          .from("user_subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("[webhook] subscription.deleted failed:", error.message);
        else console.log(`[webhook] deactivated customer ${customerId} → free/canceled`);
        break;
      }

      // ── Payment failure ──────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Flag the account as past_due so the dashboard can surface a warning.
        // We do NOT downgrade the plan — Stripe's dunning will handle retries
        // and fire subscription.deleted if the grace period expires.
        const { error } = await supabase
          .from("user_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_customer_id", customerId);

        if (error) console.error("[webhook] invoice.payment_failed update failed:", error.message);
        else console.log(`[webhook] flagged customer ${customerId} as past_due`);
        break;
      }

      default:
        // Unhandled event — acknowledge receipt so Stripe doesn't retry
        console.log("[webhook] unhandled event type:", event.type);
        break;
    }
  } catch (err) {
    console.error("[webhook] handler threw:", err);
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
