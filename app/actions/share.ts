"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanitizeDbError } from "@/lib/sanitize";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function createShareLinkAction(formData: FormData) {
  const user = await requireUser();
  const clientId = formData.get("client_id") as string;
  const showNotes = formData.get("show_notes") === "true";
  const showReferences = formData.get("show_references") === "true";
  const showRates = formData.get("show_rates") === "true";
  const showStatus = formData.get("show_status") === "true";

  const ip = await getClientIp();
  if (!rateLimit(`share_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  if (!clientId) {
    return { error: "Client ID is required." };
  }

  const supabase = await createClient();

  // Deactivate any existing active link first (so new preferences take effect)
  await supabase
    .from("share_links")
    .update({ is_active: false })
    .eq("client_id", clientId)
    .eq("is_active", true);

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      client_id: clientId,
      user_id: user.id,
      show_notes: showNotes,
      show_references: showReferences,
      show_rates: showRates,
      show_status: showStatus,
    })
    .select("token")
    .single();

  if (error) {
    return { error: sanitizeDbError(error) };
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { token: data.token };
}

export async function deleteShareLinkAction(formData: FormData) {
  await requireUser();
  const clientId = formData.get("client_id") as string;

  if (!clientId) {
    return { error: "Client ID is required." };
  }

  const ip = await getClientIp();
  if (!rateLimit(`share_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("share_links")
    .update({ is_active: false })
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (error) {
    return { error: sanitizeDbError(error) };
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { success: true };
}

export async function getShareLinkAction(clientId: string) {
  await requireUser();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("share_links")
    .select("id, token, show_notes, show_references, show_rates, show_status, created_at")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return { error: sanitizeDbError(error) };
  }

  return { shareLink: data };
}
