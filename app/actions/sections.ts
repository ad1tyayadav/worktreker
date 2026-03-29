"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { truncateRequired, sanitizeDbError } from "@/lib/sanitize";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type ActionResult = { error?: string };

const getUserId = async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, userId: null, error: error?.message || "Unauthorized" };
  }

  return { supabase, userId: user.id };
};

export const createSectionAction = async (formData: FormData): Promise<ActionResult> => {
  const clientId = String(formData.get("client_id") || "");
  const title = truncateRequired(formData.get("title") as string, 200);

  if (!clientId || !title) {
    return { error: "Client id and title are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`section_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: insertError } = await supabase.from("sections").insert({
    client_id: clientId,
    title,
    user_id: userId,
  });

  if (insertError) {
    return { error: sanitizeDbError(insertError) };
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return {};
};

export const updateSectionAction = async (formData: FormData): Promise<ActionResult> => {
  const sectionId = String(formData.get("section_id") || "");
  const clientId = String(formData.get("client_id") || "");
  const title = truncateRequired(formData.get("title") as string, 200);

  if (!sectionId || !title) {
    return { error: "Section id and title are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`section_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: updateError } = await supabase
    .from("sections")
    .update({ title })
    .eq("id", sectionId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: sanitizeDbError(updateError) };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};

export const deleteSectionAction = async (formData: FormData): Promise<ActionResult> => {
  const sectionId = String(formData.get("section_id") || "");
  const clientId = String(formData.get("client_id") || "");

  if (!sectionId) {
    return { error: "Section id is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`section_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: deleteError } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: sanitizeDbError(deleteError) };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};
