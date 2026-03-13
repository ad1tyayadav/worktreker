import Link from "next/link";
import { Card } from "@/components/ui/Card";

const features = [
  {
    emoji: "📋",
    title: "Track Work",
    description: "Log hours, units, deliveries — whatever you bill for.",
  },
  {
    emoji: "💰",
    title: "Invoice Clients",
    description: "Auto-calculate totals. Multi-currency ready.",
  },
  {
    emoji: "🔗",
    title: "Share Reports",
    description: "Generate public links for clients to view.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="font-pixel text-[11px] sm:text-[13px] tracking-[0.05em] text-accent select-none"
          >
            WORK//TRACKER
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/auth/login"
              className="font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-ink transition-colors hover:text-accent"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center border-2 border-ink bg-accent px-3 py-2 sm:px-4 sm:py-2.5 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-white shadow-hard-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.96]"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col items-center justify-center px-5 py-20 sm:px-8 sm:py-28 text-center">
          <div className="landing-hero-fade-in">
            <h1 className="font-pixel text-[14px] sm:text-[20px] md:text-[26px] leading-[2.2] uppercase tracking-[0.05em] text-ink">
              Track Right.
              <br />
              <span className="text-accent pixel-cursor">Don{"'"}t Lose Trust</span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto font-retro text-2xl sm:text-3xl text-muted leading-relaxed">
              Every hour logged, every unit billed — accurate and transparent.
              Because trust is built on the details.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center border-2 border-ink bg-accent px-5 py-3 sm:px-6 sm:py-3.5 font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-white shadow-hard transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:scale-[0.96]"
              >
                Get Started →
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

        {/* ── Features ── */}
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

      {/* ── Footer ── */}
      <footer className="border-t-2 border-ink px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="font-retro text-lg sm:text-xl text-ghost">
            Built with ☕ and pixels
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/in/aditya-yadav-39b20529a/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost transition-colors hover:text-[#0A66C2]"
              aria-label="LinkedIn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href="https://x.com/_its_Adi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost transition-colors hover:text-ink"
              aria-label="X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://github.com/ad1tyayadav"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ghost transition-colors hover:text-[#6e40c9]"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
