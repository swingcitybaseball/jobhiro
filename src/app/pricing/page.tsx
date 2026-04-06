export const dynamic = "force-dynamic";

import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { CheckoutButton } from "@/components/checkout-button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try it once, no strings attached.",
    features: [
      "1 job analysis",
      "Match score breakdown",
      "Tailored resume",
      "Cover letter",
      "Interview prep kit",
      "Company intel brief",
    ],
    cta: "Start Free",
    ctaHref: "/#analysis",
    priceId: null,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For active job seekers running multiple applications.",
    features: [
      "30 analyses per month",
      "Everything in Free",
      "PDF downloads",
      "Saved analysis history",
      "Dashboard",
      "Priority processing",
    ],
    cta: "Get Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "",
    highlight: true,
  },
  {
    name: "Premium",
    price: "$79",
    period: "/month",
    description: "For career coaches and serious candidates.",
    features: [
      "Unlimited analyses",
      "Everything in Pro",
      "AI mock interview chat",
      "Bulk analysis (up to 10 jobs)",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Get Premium",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? "",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      <SiteNav />

      <div className="max-w-5xl mx-auto px-6 pt-36 pb-20">
        <div className="text-center mb-16 space-y-3">
          <h1
            className="text-5xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Invest in your career
          </h1>
          <p className="text-lg text-on-surface-variant">
            One interview callback pays for the tool a hundred times over.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className="flex flex-col p-10"
              style={{
                borderRadius: "1.5rem",
                background: tier.highlight ? "#ffffff" : "#f4f4f0",
                boxShadow: tier.highlight
                  ? "0px 24px 48px rgba(48, 51, 48, 0.12)"
                  : "none",
                outline: tier.highlight ? "2px solid #a43e24" : "none",
                transform: tier.highlight ? "scale(1.03)" : "none",
                position: "relative",
                overflow: "hidden",
                zIndex: tier.highlight ? 10 : 1,
              }}
            >
              {tier.highlight && (
                <div
                  className="absolute top-0 right-0 bg-primary text-on-primary px-4 py-1 text-xs font-bold"
                  style={{ borderBottomLeftRadius: "0.75rem" }}
                >
                  POPULAR
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className="text-4xl font-bold text-on-surface"
                    style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-on-surface-variant">{tier.period}</span>
                  )}
                </div>
                <p className="text-xl font-bold text-on-surface">{tier.name}</p>
                <p className="text-sm mt-1 text-on-surface-variant">{tier.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>check</span>
                    {f}
                  </li>
                ))}
              </ul>

              {tier.priceId ? (
                <CheckoutButton
                  priceId={tier.priceId}
                  highlight={tier.highlight}
                  label={tier.cta}
                />
              ) : (
                <Link
                  href={tier.ctaHref!}
                  className="block text-center py-3 font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                  style={{ borderRadius: "9999px", border: "2px solid #b1b2af" }}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-10">
          All plans billed monthly. Cancel anytime. Payments processed securely by Stripe.
        </p>
      </div>
    </main>
  );
}
