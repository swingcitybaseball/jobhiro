import Stripe from "stripe";

// Lazy singleton — only instantiated when first called, not at module load.
// This prevents build-time crashes when STRIPE_SECRET_KEY is not yet set.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

// Convenience alias — same as getStripe() but named for import compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

// Map Stripe price IDs to plan names — used in the webhook
export function planFromPriceId(priceId: string): "pro" | "premium" {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID) return "premium";
  return "pro";
}
