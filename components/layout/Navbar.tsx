import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
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
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="https://github.com/ad1tyayadav/worktreker"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-2 sm:px-4 sm:py-2.5 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-ink shadow-hard-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-yellow-50 active:scale-[0.96]"
          >
            <span className="text-sm leading-none">⭐</span>
            Give a Star
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center border-2 border-ink bg-accent px-3 py-2 sm:px-4 sm:py-2.5 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-white shadow-hard-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.96]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              {/* <Link
                href="/auth/login"
                className="font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-ink transition-colors hover:text-accent"
              >
                Login
              </Link> */}
              <Link
                href="/auth/signup"
                className="inline-flex items-center border-2 border-ink bg-accent px-3 py-2 sm:px-4 sm:py-2.5 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-white shadow-hard-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-[0.96]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
