"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const color = String(formData.get("color") || "").trim();

  if (!name) {
    return { error: "Client name is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: insertError } = await supabase.from("clients").insert({
    name,
    description: description || null,
    color: color || "#2D5BE3",
    user_id: userId,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return {};
};

export const updateClientAction = async (formData: FormData): Promise<ActionResult> => {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const color = String(formData.get("color") || "").trim();

  if (!id || !name) {
    return { error: "Client id and name are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("clients")
    .update({ name, description: description || null, color: color || "#2D5BE3" })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) {
    return { error: updateError.message };
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

  const { error: deleteError } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return {};
};
