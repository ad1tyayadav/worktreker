import React from "react";
import Link from "next/link";

export const AuthLayout = ({
  children,
  footerLink,
}: {
  children: React.ReactNode;
  footerLink: { href: string; label: string };
}) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-pixel-grid px-4 py-10 sm:px-6">
      <div className="relative z-10 w-full max-w-md animate-page">
        <div className="mb-8 text-center">
          <div className="font-pixel text-[13px] sm:text-[16px] tracking-[0.05em] text-accent pixel-cursor">
            WORK//TRACKER
          </div>
          <div className="mt-3 font-retro text-2xl text-muted">
            Track your hustle. Get paid right.
          </div>
        </div>
        <div className="border-2 border-ink bg-card p-6 shadow-hard-lg rounded-none">
          {children}
        </div>
        <div className="mt-4 text-center">
          <Link
            className="font-retro text-xl text-muted transition-colors hover:text-accent"
            href={footerLink.href}
          >
            {footerLink.label}
          </Link>
        </div>
      </div>
    </div>
  );
};
