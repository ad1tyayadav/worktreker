"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction, AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthState = {};

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" disabled={pending} className="w-full">
      {pending ? "Creating..." : label}
    </Button>
  );
};

export const SignupForm = () => {
  const [state, formAction] = useFormState(signupAction, initialState);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `https://worktreker.online`,
        },
      });
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <Input id="full_name" name="full_name" type="text" label="Full Name" required />
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="password" name="password" type="password" label="Password" required />
        {state?.error ? <div className="font-retro text-lg text-accent">{state.error}</div> : null}
        <SubmitButton label="Create Account" />
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t-2 border-ink/20" />
        <span className="font-pixel text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-muted">
          or
        </span>
        <div className="flex-1 border-t-2 border-ink/20" />
      </div>

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 border-2 border-ink bg-card px-4 py-3 font-pixel text-[9px] sm:text-[10px] uppercase tracking-[0.05em] text-ink shadow-hard-sm transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-card-hover active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        {googleLoading ? "Signing in..." : "Sign up with Google"}
      </button>
    </div>
  );
};
