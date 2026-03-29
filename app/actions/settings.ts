"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { truncate, sanitizeDbError } from "@/lib/sanitize";

export type ActionResult = { error?: string };

export const updateProfileAction = async (formData: FormData): Promise<ActionResult> => {
  const fullName = truncate(formData.get("full_name") as string, 200) || "";

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: error?.message || "Unauthorized" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: fullName || null })
    .eq("id", user.id);

  if (updateError) {
    return { error: sanitizeDbError(updateError) };
  }

  revalidatePath("/dashboard/settings");
  return {};
};

export const changePasswordAction = async (formData: FormData): Promise<ActionResult> => {
  const password = String(formData.get("password") || "").trim();

  if (!password) {
    return { error: "Password is required." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return {};
};

export const deleteAccountAction = async (): Promise<ActionResult> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: error?.message || "Unauthorized" };
  }

  try {
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return { error: sanitizeDbError(deleteError) };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delete failed" };
  }

  await supabase.auth.signOut();
  redirect("/auth/signup");
};
