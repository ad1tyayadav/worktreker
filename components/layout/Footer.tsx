"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function Footer() {
  const [foodModalOpen, setFoodModalOpen] = useState(false);

  return (
    <footer className="border-t-2 border-ink px-5 py-6 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 font-pixel text-[11px] sm:text-[13px] tracking-[0.05em] text-accent select-none"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-sm border-2 border-ink bg-paper shadow-hard-sm">
            <Image
              src="/logo.png"
              alt="Work//Treker logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          Work//Treker
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="text-[9px] sm:text-[10px] px-4 sm:px-5"
          onClick={() => setFoodModalOpen(true)}
        >
          I want some good food
        </Button>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.linkedin.com/in/aditya-yadav-39b20529a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ghost transition-colors hover:text-[#0A66C2]"
            aria-label="LinkedIn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </Link>
          <Link
            href="https://x.com/_its_Adi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ghost transition-colors hover:text-ink"
            aria-label="X"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
          <Link
            href="https://github.com/ad1tyayadav"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ghost transition-colors hover:text-[#6e40c9]"
            aria-label="GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Link>
        </div>
      </div>
      <Modal
        open={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        title="Built with coffee and pixels"
        className="max-w-xl max-h-[85vh] overflow-hidden"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="font-retro text-lg text-muted">
            If this app helps, consider fueling the next sprint.
          </p>
          <div className="rounded-none border-2 border-ink bg-paper p-3 shadow-hard-sm">
            <Image
              src="/Gareeb.png"
              alt="Retro food meme"
              width={720}
              height={420}
              className="h-auto w-full max-h-64 sm:max-h-72 object-contain"
              priority
            />
          </div>
          <div className="rounded-none border-2 border-dashed border-ink bg-paper p-4 text-center">
            <div className="mb-3 font-pixel text-[10px] uppercase tracking-[0.05em] text-muted">
              Scan my QR to donate
            </div>
            <Image
              src="/qr.png"
              alt="Donate QR code"
              width={280}
              height={280}
              className="mx-auto h-auto w-44 sm:w-52"
            />
          </div>
          <Link
            href="https://www.paypal.com/paypalme/adity4yadav"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-accent px-4 py-3 font-pixel text-[10px] uppercase tracking-[0.05em] text-white shadow-hard transition-all duration-150 rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:scale-[0.96] min-h-[44px]"
          >
            Donate via PayPal
          </Link>
        </div>
      </Modal>
    </footer>
  );
}
