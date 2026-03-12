"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createShareLinkAction(formData: FormData) {
  const user = await requireUser();
  const clientId = formData.get("client_id") as string;
  const showNotes = formData.get("show_notes") === "true";
  const showReferences = formData.get("show_references") === "true";
  const showRates = formData.get("show_rates") === "true";
  const showStatus = formData.get("show_status") === "true";

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
    return { error: `Failed to create share link: ${error.message}` };
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

  const supabase = await createClient();

  const { error } = await supabase
    .from("share_links")
    .update({ is_active: false })
    .eq("client_id", clientId)
    .eq("is_active", true);

  if (error) {
    return { error: `Failed to revoke share link: ${error.message}` };
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
    return { error: `Failed to fetch share link: ${error.message}` };
  }

  return { shareLink: data };
}
