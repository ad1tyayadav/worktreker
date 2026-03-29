import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const ip = await getClientIp();
  const limitResult = rateLimit(`oauth_${ip}`, 10, 60000);

  if (!limitResult.success) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("error", "Too many attempts");
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = next;
      redirectUrl.searchParams.delete("code");
      redirectUrl.searchParams.delete("next");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If no code or error, redirect to login
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/login";
  return NextResponse.redirect(redirectUrl);
}
