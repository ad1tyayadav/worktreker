import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

const features = [
  {
    emoji: "[]",
    title: "Track Work",
    description: "Log hours, units, deliveries -- whatever you bill for.",
  },
  {
    emoji: "$",
    title: "Invoice Clients",
    description: "Auto-calculate totals. Multi-currency ready.",
  },
  {
    emoji: "->",
    title: "Share Reports",
    description: "Generate public links for clients to view.",
  },
];

export default function LandingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Work//Treker",
    description: "Track your hustle. Get paid right.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    image: siteUrl + "/logo.png",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-5 py-20 sm:px-8 sm:py-28 text-center">
          <div className="landing-hero-fade-in">
            <h1 className="font-pixel text-[14px] sm:text-[20px] md:text-[26px] leading-[2.2] uppercase tracking-[0.05em] text-ink">
              Track Right.
              <br />
              <span className="text-accent pixel-cursor">Don{"'"}t Lose Trust</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto font-retro text-2xl sm:text-3xl text-muted leading-relaxed">
              Every hour logged, every unit billed -- accurate and transparent.
              Because trust is built on the details.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center border-2 border-ink bg-accent px-5 py-3 sm:px-6 sm:py-3.5 font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-white shadow-hard transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:scale-[0.96]"
              >
                Get Started &rarr;
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center border-2 border-ink bg-card px-5 py-3 sm:px-6 sm:py-3.5 font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink shadow-hard transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm hover:bg-card-hover active:scale-[0.96]"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-5xl px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mb-10 text-center">
            <span className="section-label font-retro text-xl sm:text-2xl">
              [ WHAT YOU GET ]
            </span>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className="p-5 sm:p-6 landing-card-stagger"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="text-3xl sm:text-4xl leading-none">{f.emoji}</div>
                <h3 className="mt-3 font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 font-retro text-lg sm:text-xl text-muted leading-snug">
                  {f.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
