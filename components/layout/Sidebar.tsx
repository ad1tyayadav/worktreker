"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "▸", exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: "▸" },
  { href: "/dashboard/settings", label: "Settings", icon: "▸" },
];

export const Sidebar = ({ email }: { email: string }) => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:border-r-2 lg:border-ink bg-card px-5 py-6">
        <div className="font-pixel text-[13px] tracking-[0.05em] text-accent">
          Work//Treker
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-none border-2 px-3 py-3 font-body text-sm font-bold uppercase tracking-wide transition-all min-h-[44px] ${isActive
                    ? "border-ink bg-yellow text-ink shadow-hard-sm"
                    : "border-transparent text-muted hover:border-ink hover:bg-card-hover hover:text-ink hover:shadow-hard-sm"
                  }`}
              >
                <span aria-hidden="true" className="font-retro text-lg text-accent">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t-2 border-dashed border-ink pt-4">
          <div className="max-w-[180px] truncate font-retro text-lg text-muted">{email}</div>
          <form action={logoutAction}>
            <button
              className="font-pixel text-[10px] uppercase tracking-[0.05em] text-muted transition-colors hover:text-accent min-h-[44px]"
              type="submit"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between border-b-2 border-ink bg-card px-4 py-3 lg:hidden transition-shadow ${scrolled ? "shadow-scroll-shadow" : ""
          }`}
      >
        <div className="flex items-center gap-2 font-pixel text-[11px] sm:text-[13px] tracking-[0.05em] text-accent">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm border-2 border-ink bg-paper shadow-hard-sm">
            <Image
              src="/logo.png"
              alt="Work//Treker logo"
              width={20}
              height={20}
              className="h-5 w-5 object-contain"
              priority
            />
          </span>
          Work//Treker
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="flex items-center justify-center rounded-none border-2 border-ink bg-card p-2 min-w-[44px] min-h-[44px] shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-[0.96]"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
        >
          <span className="font-pixel text-[10px] text-ink">{drawerOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-ink/40" />
          <nav
            className="absolute top-0 left-0 right-0 border-b-2 border-ink bg-card animate-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-ink px-4 py-3">
              <div className="font-pixel text-[11px] tracking-[0.05em] text-accent">MENU</div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] font-pixel text-[10px] text-ink"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            {navLinks.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 border-b border-dashed border-border-soft px-4 py-4 font-body text-base font-bold uppercase tracking-wide transition-colors min-h-[44px] ${isActive ? "bg-yellow text-ink" : "text-muted hover:bg-card-hover hover:text-ink"
                    }`}
                >
                  <span className="font-retro text-xl text-accent">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center justify-between border-t-2 border-ink px-4 py-4">
              <span className="truncate font-retro text-lg text-muted">{email}</span>
              <form action={logoutAction}>
                <button
                  className="font-pixel text-[10px] uppercase tracking-[0.05em] text-muted hover:text-accent min-h-[44px]"
                  type="submit"
                >
                  Logout
                </button>
              </form>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
};
