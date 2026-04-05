export const dynamic = "force-dynamic";

import Link from "next/link";
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
    ctaHref: "/",
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
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-lg font-bold text-gray-900">JobHiro</Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Back</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">Simple pricing</h1>
          <p className="text-lg text-gray-500">
            One free analysis, then Pro for unlimited. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border flex flex-col ${
                tier.highlight
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-bold ${tier.highlight ? "text-white" : "text-gray-900"}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`text-sm ${tier.highlight ? "text-gray-400" : "text-gray-500"}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className={`text-xl font-semibold ${tier.highlight ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </p>
                <p className={`text-sm mt-1 ${tier.highlight ? "text-gray-400" : "text-gray-500"}`}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={tier.highlight ? "text-green-400" : "text-emerald-600"}>✓</span>
                    <span className={tier.highlight ? "text-gray-300" : "text-gray-700"}>{f}</span>
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
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    tier.highlight
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans billed monthly. Cancel anytime. Payments processed securely by Stripe.
        </p>
      </div>
    </main>
  );
}
