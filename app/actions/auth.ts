"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthState = {
  error?: string;
};

const ensureProfile = async (userId: string, fullName?: string | null) => {
  const admin = createAdminClient();
  await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName || null,
  });
};

export const loginAction = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    try {
      await ensureProfile(data.user.id, data.user.user_metadata?.full_name ?? null);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to sync profile." };
    }
  }

  redirect("/dashboard");
};

export const signupAction = async (
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> => {
  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!fullName || !email || !password) {
    return { error: "Full name, email, and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    try {
      await ensureProfile(data.user.id, fullName);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to create profile." };
    }
  }

  redirect("/dashboard");
};

export const logoutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
};
