"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { truncateRequired, truncate, sanitizeDbError } from "@/lib/sanitize";
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

export const createClientAction = async (formData: FormData): Promise<ActionResult> => {
  const name = truncateRequired(formData.get("name") as string, 200);
  const description = truncate(formData.get("description") as string, 5000);
  const color = truncateRequired(formData.get("color") as string, 20);

  if (!name) {
    return { error: "Client name is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`client_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: insertError } = await supabase.from("clients").insert({
    name,
    description: description || null,
    color: color || "#2D5BE3",
    user_id: userId,
  });

  if (insertError) {
    return { error: sanitizeDbError(insertError) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return {};
};

export const updateClientAction = async (formData: FormData): Promise<ActionResult> => {
  const id = String(formData.get("id") || "");
  const name = truncateRequired(formData.get("name") as string, 200);
  const description = truncate(formData.get("description") as string, 5000);
  const color = truncateRequired(formData.get("color") as string, 20);

  if (!id || !name) {
    return { error: "Client id and name are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`client_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({ name, description: description || null, color: color || "#2D5BE3" })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) {
    return { error: sanitizeDbError(updateError) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  return {};
};

export const deleteClientAction = async (formData: FormData): Promise<ActionResult> => {
  const id = String(formData.get("id") || "");
  if (!id) {
    return { error: "Client id is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`client_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: deleteError } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: sanitizeDbError(deleteError) };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return {};
};
