"use client";

import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction, AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  return (
    <form action={formAction} className="space-y-4">
      <Input id="full_name" name="full_name" type="text" label="Full Name" required />
      <Input id="email" name="email" type="email" label="Email" required />
      <Input id="password" name="password" type="password" label="Password" required />
      {state?.error ? <div className="font-retro text-lg text-accent">{state.error}</div> : null}
      <SubmitButton label="Create Account" />
    </form>
  );
};
