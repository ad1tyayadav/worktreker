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

const numberOrNull = (value: FormDataEntryValue | null) => {
  if (value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const createEntryAction = async (formData: FormData): Promise<ActionResult> => {
  const sectionId = String(formData.get("section_id") || "");
  const clientId = String(formData.get("client_id") || "");
  const title = String(formData.get("title") || "").trim();
  const unitType = String(formData.get("unit_type") || "").trim();
  const unitCount = numberOrNull(formData.get("unit_count"));
  const billableUnits = numberOrNull(formData.get("billable_units"));
  const ratePerUnit = numberOrNull(formData.get("rate_per_unit"));
  const currency = String(formData.get("currency") || "USD").trim() || "USD";
  const notes = String(formData.get("notes") || "").trim();
  const referenceUrl = String(formData.get("reference_url") || "").trim();
  const status = String(formData.get("status") || "pending");

  if (!sectionId || !title || !unitType) {
    return { error: "Title, unit type, and section are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: insertError } = await supabase.from("entries").insert({
    section_id: sectionId,
    user_id: userId,
    title,
    unit_type: unitType,
    unit_count: unitCount ?? 1,
    billable_units: billableUnits ?? 1,
    rate_per_unit: ratePerUnit,
    currency,
    notes: notes || null,
    reference_url: referenceUrl || null,
    status: status === "paid" ? "paid" : "pending",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  revalidatePath("/dashboard");
  return {};
};

export const updateEntryAction = async (formData: FormData): Promise<ActionResult> => {
  const entryId = String(formData.get("entry_id") || "");
  const clientId = String(formData.get("client_id") || "");
  const title = String(formData.get("title") || "").trim();
  const unitType = String(formData.get("unit_type") || "").trim();
  const unitCount = numberOrNull(formData.get("unit_count"));
  const billableUnits = numberOrNull(formData.get("billable_units"));
  const ratePerUnit = numberOrNull(formData.get("rate_per_unit"));
  const currency = String(formData.get("currency") || "USD").trim() || "USD";
  const notes = String(formData.get("notes") || "").trim();
  const referenceUrl = String(formData.get("reference_url") || "").trim();
  const status = String(formData.get("status") || "pending");

  if (!entryId || !title || !unitType) {
    return { error: "Entry id, title, and unit type are required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("entries")
    .update({
      title,
      unit_type: unitType,
      unit_count: unitCount ?? 1,
      billable_units: billableUnits ?? 1,
      rate_per_unit: ratePerUnit,
      currency,
      notes: notes || null,
      reference_url: referenceUrl || null,
      status: status === "paid" ? "paid" : "pending",
    })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  revalidatePath("/dashboard");
  return {};
};

export const deleteEntryAction = async (formData: FormData): Promise<ActionResult> => {
  const entryId = String(formData.get("entry_id") || "");
  const clientId = String(formData.get("client_id") || "");

  if (!entryId) {
    return { error: "Entry id is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: deleteError } = await supabase
    .from("entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  revalidatePath("/dashboard");
  return {};
};

export const toggleEntryStatusAction = async (formData: FormData): Promise<ActionResult> => {
  const entryId = String(formData.get("entry_id") || "");
  const clientId = String(formData.get("client_id") || "");
  const nextStatus = String(formData.get("status") || "pending");

  if (!entryId) {
    return { error: "Entry id is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const { error: updateError } = await supabase
    .from("entries")
    .update({ status: nextStatus === "paid" ? "paid" : "pending" })
    .eq("id", entryId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  revalidatePath("/dashboard");
  return {};
};
