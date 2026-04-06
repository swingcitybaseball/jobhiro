import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { JobInputForm } from "@/components/job-input-form";
import { CheckoutButton } from "@/components/checkout-button";

/* ─── Pricing data (mirrors /pricing page) ─────────────────── */
const PRO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "";
const PREMIUM_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? "";

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#faf9f6", color: "#303330" }}>
      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <header className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <h1
            className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Stop sending the same resume to every job.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
            JobHiro tailors your entire application in 30 seconds. Build confidence and land interviews with AI-driven personalization.
          </p>
          <a
            href="#analysis"
            className="inline-block px-8 py-4 font-bold text-lg text-on-primary shadow-lg hover:shadow-xl transition-all"
            style={{
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #a43e24, #ffac98)",
            }}
          >
            Try your first analysis free
          </a>
        </div>

        {/* Score Ring Demo */}
        <div className="flex-1 relative w-full flex justify-center">
          <div
            className="w-full max-w-md aspect-square bg-surface-container-lowest p-10 flex flex-col items-center justify-center relative"
            style={{
              borderRadius: "3rem",
              boxShadow: "0px 40px 80px rgba(48, 51, 48, 0.08)",
            }}
          >
            {/* Decorative blob */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 bg-secondary-container opacity-50"
              style={{ borderRadius: "9999px", filter: "blur(24px)" }}
            />

            {/* SVG Ring */}
            <div className="relative w-64 h-64">
              <svg className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="128" cy="128" r="110" fill="transparent" stroke="#eeeeea" strokeWidth="12" />
                <circle
                  cx="128" cy="128" r="110"
                  fill="transparent"
                  stroke="#44683b"
                  strokeWidth="12"
                  strokeDasharray="691.15"
                  strokeDashoffset="89.85"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-6xl font-bold text-on-surface"
                  style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
                >
                  87%
                </span>
                <span className="text-on-surface-variant font-medium tracking-wide text-sm">Match Score</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-2">
              <div
                className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container text-sm font-semibold"
                style={{ borderRadius: "9999px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                ATS Highly Optimized
              </div>
              <p className="text-sm text-on-surface-variant italic mt-2">Analyzed against Senior Product Designer role</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Social Proof Strip ───────────────────────────────── */}
      <section className="bg-surface-container-low py-8 mb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-70">
          <span
            className="font-semibold text-on-surface-variant uppercase tracking-widest text-sm"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Helping job seekers land interviews faster
          </span>
          <div className="flex flex-wrap justify-center gap-12 text-on-surface font-semibold text-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>auto_awesome</span>
              5 AI-powered outputs
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>description</span>
              ATS-optimized resumes
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>forum</span>
              Interview prep included
            </div>
          </div>
        </div>
      </section>

      {/* ── Analysis Form ────────────────────────────────────── */}
      <section id="analysis" className="max-w-2xl mx-auto px-6 mb-32 scroll-mt-24">
        <div className="text-center mb-10">
          <h2
            className="text-4xl font-bold text-on-surface mb-3"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Analyze your application
          </h2>
          <p className="text-on-surface-variant">
            1 free analysis — no sign-up required.{" "}
            <Link href="/pricing" className="underline hover:text-primary">
              See plans →
            </Link>
          </p>
        </div>
        <div
          className="bg-surface-container-lowest p-8"
          style={{
            borderRadius: "2rem",
            boxShadow: "0px 20px 40px rgba(48, 51, 48, 0.06)",
          }}
        >
          <JobInputForm />
        </div>
      </section>

      {/* ── 5 Outputs ────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 mb-32 scroll-mt-24">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-on-surface mb-4"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Complete Application Intelligence
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            One upload, five tailored assets to help you dominate the hiring process from application to offer.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { icon: "analytics", bg: "bg-primary-container", color: "text-on-primary-container", title: "Match Score", desc: "Instantly see how well your experience aligns with any JD." },
            { icon: "edit_note", bg: "bg-secondary-container", color: "text-on-secondary-container", title: "Tailored Resume", desc: "Bullet points rewritten with the perfect keywords." },
            { icon: "mail", bg: "bg-tertiary-container", color: "text-on-tertiary-container", title: "Cover Letter", desc: "Narratives that connect your past to their future." },
            { icon: "question_answer", bg: "bg-primary-container/40", color: "text-primary", title: "Interview Prep", desc: "Predicted questions and STAR-method responses." },
            { icon: "corporate_fare", bg: "bg-surface-variant", color: "text-on-surface", title: "Company Intel", desc: "Deep dives into culture, mission, and current trends." },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-surface-container-lowest p-8 flex flex-col gap-4 hover:shadow-md transition-shadow"
              style={{
                borderRadius: "1.5rem",
                boxShadow: "0px 2px 8px rgba(48, 51, 48, 0.04)",
              }}
            >
              <div
                className={`w-12 h-12 ${card.bg} ${card.color} flex items-center justify-center`}
                style={{ borderRadius: "9999px" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{card.icon}</span>
              </div>
              <h3
                className="font-bold text-xl text-on-surface"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                {card.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-32 flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 space-y-12">
          <h2
            className="text-4xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Simple, but powerful.
          </h2>
          <div className="space-y-10 relative">
            {/* Vertical dotted line */}
            <div className="absolute left-6 top-4 bottom-4 w-px border-l-2 border-dotted border-outline-variant opacity-50" />
            {[
              { n: "1", title: "Upload your Base Resume", desc: "The source of truth for your professional journey. We parse your experience in detail." },
              { n: "2", title: "Paste the Job Description", desc: "Tell us what you're aiming for. Our AI analyzes the nuance behind every requirement." },
              { n: "3", title: "Get Your Analysis", desc: "Download your optimized materials and step-by-step interview strategy guide." },
            ].map((step) => (
              <div key={step.n} className="flex gap-8 relative z-10">
                <div
                  className="w-12 h-12 bg-surface-container-high flex items-center justify-center font-bold text-primary shrink-0"
                  style={{ borderRadius: "9999px" }}
                >
                  {step.n}
                </div>
                <div>
                  <h4
                    className="text-xl font-bold mb-2 text-on-surface"
                    style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
                  >
                    {step.title}
                  </h4>
                  <p className="text-on-surface-variant">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard mockup placeholder */}
        <div className="flex-1 w-full">
          <div
            className="bg-surface-container-low p-10 relative overflow-hidden"
            style={{ borderRadius: "1.5rem" }}
          >
            {/* Stylized mockup instead of external image */}
            <div className="bg-surface-container-lowest rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-on-surface"
                  style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
                >
                  Analysis Results
                </span>
                <span
                  className="text-xs px-3 py-1 bg-secondary-container text-on-secondary-container font-semibold"
                  style={{ borderRadius: "9999px" }}
                >
                  87% Match
                </span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: "87%" }} />
              </div>
              <div className="space-y-2 pt-2">
                {["Tailored Resume", "Cover Letter", "Interview Prep", "Company Intel"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-on-surface-variant">{item} ready</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/60 to-transparent pointer-events-none" style={{ borderRadius: "1.5rem" }} />
          </div>
        </div>
      </section>

      {/* ── Before / After ───────────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-6 mb-32 bg-surface-container p-10 md:p-16"
        style={{ borderRadius: "1.5rem" }}
      >
        <h2
          className="text-3xl font-bold text-center mb-16 text-on-surface"
          style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
        >
          The Difference is Data
        </h2>
        <div className="flex flex-col md:flex-row gap-12">
          {/* Without */}
          <div
            className="flex-1 bg-surface p-10 shadow-sm opacity-80"
            style={{ borderRadius: "1rem", borderLeft: "4px solid #aa371c" }}
          >
            <div className="flex justify-between items-start mb-8">
              <h4
                className="font-bold text-2xl text-on-surface-variant"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                Without JobHiro
              </h4>
              <span
                className="text-4xl font-bold text-error"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                23%
              </span>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-error" style={{ width: "23%" }} />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Generic phrasing, missing critical ATS keywords, and an unfocused narrative that makes recruiters pass.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: "14px" }}>close</span>
                  High rejection rate
                </li>
                <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: "14px" }}>close</span>
                  Invisible to ATS
                </li>
              </ul>
            </div>
          </div>
          {/* With */}
          <div
            className="flex-1 bg-surface-container-lowest p-10 shadow-xl"
            style={{ borderRadius: "1rem", borderLeft: "4px solid #44683b", outline: "1px solid rgba(68,104,59,0.1)" }}
          >
            <div className="flex justify-between items-start mb-8">
              <h4
                className="font-bold text-2xl text-on-surface"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                With JobHiro
              </h4>
              <span
                className="text-4xl font-bold text-secondary"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                87%
              </span>
            </div>
            <div className="space-y-4">
              <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: "87%" }} />
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Perfectly mapped experience, keyword-rich summaries, and a compelling story that demands an interview.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  3x more interview callbacks
                </li>
                <li className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Seamless ATS optimization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              quote: "I was stuck for months. After using JobHiro for two weeks, I had four interviews lined up. The interview prep was scarily accurate.",
              name: "Sarah J.", role: "Senior UX Researcher",
              initials: "SJ", avatarBg: "bg-primary-container", avatarColor: "text-on-primary-container",
              iconColor: "text-primary-container",
            },
            {
              quote: "The company intel alone is worth the price. I went into my final round knowing more about their challenges than the interviewer expected.",
              name: "Marcus T.", role: "Product Lead",
              initials: "MT", avatarBg: "bg-secondary-container", avatarColor: "text-on-secondary-container",
              iconColor: "text-secondary-container",
            },
            {
              quote: "Finally, an AI tool that doesn't sound like a robot. The resume bullets feel human, punchy, and genuinely authentic to my voice.",
              name: "Elena V.", role: "Marketing Director",
              initials: "EV", avatarBg: "bg-tertiary-container", avatarColor: "text-on-tertiary-container",
              iconColor: "text-tertiary-container",
            },
          ].map((t) => (
            <div key={t.name} className="space-y-6">
              <span className={`material-symbols-outlined ${t.iconColor}`} style={{ fontSize: "56px" }}>format_quote</span>
              <p
                className="text-xl italic leading-relaxed text-on-surface"
                style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div
                  className={`w-10 h-10 ${t.avatarBg} ${t.avatarColor} flex items-center justify-center text-sm font-bold`}
                  style={{ borderRadius: "9999px" }}
                >
                  {t.initials}
                </div>
                <div>
                  <h5 className="font-bold text-on-surface">{t.name}</h5>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wide">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 mb-32 scroll-mt-24">
        <div className="text-center mb-16">
          <h2
            className="text-4xl font-bold text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Invest in your career
          </h2>
          <p className="text-on-surface-variant mt-4">One interview callback pays for the tool a hundred times over.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free */}
          <div
            className="bg-surface-container-low p-10 flex flex-col"
            style={{ borderRadius: "1.5rem" }}
          >
            <h3 className="text-xl font-bold mb-2 text-on-surface">Free</h3>
            <div
              className="text-4xl font-bold mb-6 text-on-surface"
              style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
            >
              $0
            </div>
            <ul className="space-y-4 mb-10 flex-grow text-sm">
              {["1 job analysis", "Match score breakdown", "Tailored resume", "Cover letter", "Interview prep kit", "Company intel brief"].map((f) => (
                <li key={f} className="flex gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>check</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#analysis"
              className="block text-center w-full py-3 font-bold text-on-surface hover:bg-surface-container-highest transition-colors"
              style={{ borderRadius: "9999px", border: "2px solid #b1b2af" }}
            >
              Start Free
            </a>
          </div>

          {/* Pro */}
          <div
            className="bg-surface-container-lowest p-10 flex flex-col relative overflow-hidden z-10"
            style={{
              borderRadius: "1.5rem",
              outline: "2px solid #a43e24",
              boxShadow: "0px 24px 48px rgba(48, 51, 48, 0.12)",
              transform: "scale(1.03)",
            }}
          >
            <div
              className="absolute top-0 right-0 bg-primary text-on-primary px-4 py-1 text-xs font-bold"
              style={{ borderBottomLeftRadius: "0.75rem" }}
            >
              POPULAR
            </div>
            <h3 className="text-xl font-bold mb-2 text-on-surface">Pro</h3>
            <div
              className="text-4xl font-bold mb-6 text-on-surface"
              style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
            >
              $29<span className="text-sm font-normal text-on-surface-variant" style={{ fontFamily: "var(--font-inter), sans-serif" }}>/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow text-sm">
              {["30 analyses per month", "Everything in Free", "PDF downloads", "Saved analysis history", "Dashboard", "Priority processing"].map((f) => (
                <li key={f} className="flex gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>check</span>
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton priceId={PRO_PRICE_ID} highlight={true} label="Get Pro" />
          </div>

          {/* Premium */}
          <div
            className="bg-surface-container-low p-10 flex flex-col"
            style={{ borderRadius: "1.5rem" }}
          >
            <h3 className="text-xl font-bold mb-2 text-on-surface">Premium</h3>
            <div
              className="text-4xl font-bold mb-6 text-on-surface"
              style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
            >
              $79<span className="text-sm font-normal text-on-surface-variant" style={{ fontFamily: "var(--font-inter), sans-serif" }}>/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow text-sm">
              {["Unlimited analyses", "Everything in Pro", "AI mock interview chat", "Bulk analysis (up to 10 jobs)", "Priority support", "Early access to new features"].map((f) => (
                <li key={f} className="flex gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>check</span>
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton priceId={PREMIUM_PRICE_ID} highlight={false} label="Get Premium" />
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="mx-6 max-w-7xl md:mx-auto mb-20">
        <div
          className="p-12 md:p-20 text-center space-y-8 shadow-2xl relative overflow-hidden"
          style={{
            borderRadius: "3rem",
            background: "linear-gradient(135deg, #a43e24, #ff8162)",
          }}
        >
          {/* Decorative watermark */}
          <div
            className="absolute -top-10 -left-10 pointer-events-none select-none"
            style={{
              fontSize: "10rem",
              fontFamily: "var(--font-noto-serif), Georgia, serif",
              fontWeight: 800,
              color: "rgba(255,255,255,0.05)",
              lineHeight: 1,
            }}
          >
            Hiro
          </div>
          <h2
            className="text-4xl md:text-6xl font-bold text-on-primary max-w-3xl mx-auto leading-tight relative z-10"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            Your dream role is waiting. Don&apos;t leave it to chance.
          </h2>
          <p className="text-xl max-w-xl mx-auto relative z-10" style={{ color: "rgba(255,247,246,0.8)" }}>
            Join 10,000+ applicants who have bypassed the bots and landed their next big opportunity.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 pt-6 relative z-10">
            <a
              href="#analysis"
              className="bg-surface-container-lowest text-primary px-10 py-5 font-bold text-xl shadow-lg hover:scale-105 transition-transform"
              style={{ borderRadius: "9999px" }}
            >
              Start Your Analysis
            </a>
            <Link
              href="/pricing"
              className="font-bold text-xl hover:bg-white/20 transition-colors text-on-primary"
              style={{
                borderRadius: "9999px",
                padding: "1.25rem 2.5rem",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        className="bg-surface-container-low w-full flex flex-col md:flex-row justify-between items-center px-12 py-16 mt-20"
        style={{ borderRadius: "3rem 3rem 0 0" }}
      >
        <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
          <div
            className="font-bold text-3xl text-on-surface"
            style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
          >
            JobHiro
          </div>
          <p className="text-sm text-on-surface-variant max-w-xs text-center md:text-left leading-relaxed">
            © 2026 JobHiro. Crafted for the modern applicant. Empowering careers through ethical AI.
          </p>
        </div>
        <div className="flex gap-10">
          <div className="flex flex-col gap-3">
            <span
              className="font-bold text-on-surface"
              style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
            >
              Product
            </span>
            <a href="/#features" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Features</a>
            <Link href="/pricing" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Pricing</Link>
            <Link href="/blog" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Blog</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span
              className="font-bold text-on-surface"
              style={{ fontFamily: "var(--font-noto-serif), Georgia, serif" }}
            >
              Company
            </span>
            <Link href="/dashboard" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Dashboard</Link>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Privacy</a>
            <a href="#" className="text-on-surface-variant hover:text-on-surface transition-all text-sm">Terms</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
