import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { stripe, planFromPriceId } from "@/lib/stripe/stripe";
import { supabase } from "@/lib/db/supabase";

const TAG = "[verify-subscription]";

export async function GET() {
  console.log(`${TAG} ── route called ──`);

  // ── 1. Auth ───────────────────────────────────────────────────────────
  const { userId } = await auth();
  console.log(`${TAG} userId:`, userId ?? "NOT SIGNED IN");
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // ── 2. Get user's email addresses from Clerk ──────────────────────────
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const emails = user.emailAddresses.map((e) => e.emailAddress);
  console.log(`${TAG} Clerk emails:`, emails);

  if (!emails.length) {
    console.log(`${TAG} no emails on Clerk account — returning free`);
    return NextResponse.json({ plan: "free", synced: false });
  }

  // ── 3. Search Stripe for a customer with one of these emails ──────────
  let stripeCustomerId: string | null = null;
  let activePriceId: string | null = null;

  for (const email of emails) {
    console.log(`${TAG} searching Stripe customers for email: ${email}`);
    const customers = await stripe.customers.list({ email, limit: 5 });
    console.log(`${TAG} Stripe customers found: ${customers.data.length}`);

    for (const customer of customers.data) {
      if (customer.deleted) {
        console.log(`${TAG} customer ${customer.id} is deleted, skipping`);
        continue;
      }

      console.log(`${TAG} checking subscriptions for customer: ${customer.id}`);
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 5,
      });

      // Cast needed — Stripe SDK v22 wraps responses
      const subList = (
        subs as unknown as {
          data: {
            id: string;
            items: { data: { price: { id: string } }[] };
          }[];
        }
      ).data;

      console.log(`${TAG} active subscriptions on ${customer.id}: ${subList.length}`);

      if (subList.length > 0) {
        stripeCustomerId = customer.id;
        activePriceId = subList[0].items.data[0]?.price?.id ?? null;
        console.log(`${TAG} found active sub — customer: ${stripeCustomerId}, priceId: ${activePriceId}`);
        break;
      }
    }

    if (stripeCustomerId) break;
  }

  // ── 4. Sync to Supabase ───────────────────────────────────────────────
  if (stripeCustomerId && activePriceId) {
    const plan = planFromPriceId(activePriceId);
    console.log(`${TAG} price ${activePriceId} → plan: ${plan}`);
    console.log(`${TAG} env PRO_PRICE_ID:`, process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID);
    console.log(`${TAG} env PREMIUM_PRICE_ID:`, process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID);

    const { error: upsertError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          plan,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error(`${TAG} Supabase upsert FAILED:`, upsertError.message, upsertError.details);
      return NextResponse.json({ error: "Failed to sync subscription", plan: "free", synced: false }, { status: 500 });
    }

    console.log(`${TAG} Supabase upsert succeeded — returning plan: ${plan}`);
    return NextResponse.json({ plan, synced: true });
  }

  console.log(`${TAG} no active Stripe subscription found — returning free`);
  return NextResponse.json({ plan: "free", synced: false });
}
