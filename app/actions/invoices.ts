"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { truncate, sanitizeDbError } from "@/lib/sanitize";
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

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${y}${m}-${rand}`;
};

export const createInvoiceAction = async (formData: FormData): Promise<ActionResult & { invoiceId?: string }> => {
  const customNumber = truncate(formData.get("invoice_number") as string, 50) || "";
  const invoiceTitle = truncate(formData.get("title") as string, 200) || "";
  const clientId = String(formData.get("client_id") || "");
  const fromName = truncate(formData.get("from_name") as string, 200) || "";
  const fromEmail = truncate(formData.get("from_email") as string, 200) || "";
  const fromAddress = truncate(formData.get("from_address") as string, 500) || "";
  const toName = truncate(formData.get("to_name") as string, 200) || "";
  const toEmail = truncate(formData.get("to_email") as string, 200) || "";
  const toAddress = truncate(formData.get("to_address") as string, 500) || "";
  const issueDate = String(formData.get("issue_date") || "").trim();
  const dueDate = String(formData.get("due_date") || "").trim();
  const entryIdsRaw = String(formData.get("entry_ids") || "[]");
  const notes = truncate(formData.get("notes") as string, 5000) || "";
  const paymentInfo = truncate(formData.get("payment_info") as string, 5000) || "";
  const taxRate = Number(formData.get("tax_rate")) || 0;
  const discount = Number(formData.get("discount")) || 0;
  const currency = truncate((formData.get("currency") as string) || "USD", 10) || "USD";

  if (!clientId) {
    return { error: "Client is required." };
  }

  let entryIds: string[] = [];
  try {
    entryIds = JSON.parse(entryIdsRaw);
  } catch {
    return { error: "Invalid entry IDs." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`invoice_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const invoiceNumber = customNumber || generateInvoiceNumber();

  const { data, error: insertError } = await supabase
    .from("invoices")
    .insert({
      client_id: clientId,
      user_id: userId,
      invoice_number: invoiceNumber,
      title: invoiceTitle || "INVOICE",
      from_name: fromName || null,
      from_email: fromEmail || null,
      from_address: fromAddress || null,
      to_name: toName || null,
      to_email: toEmail || null,
      to_address: toAddress || null,
      issue_date: issueDate || new Date().toISOString().split("T")[0],
      due_date: dueDate || null,
      entry_ids: entryIds,
      notes: notes || null,
      payment_info: paymentInfo || null,
      tax_rate: taxRate,
      discount,
      currency,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError) {
    return { error: sanitizeDbError(insertError) };
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { invoiceId: data.id };
};

export const updateInvoiceAction = async (formData: FormData): Promise<ActionResult> => {
  const invoiceId = String(formData.get("invoice_id") || "");
  const invoiceTitle = truncate(formData.get("title") as string, 200) || "";
  const clientId = String(formData.get("client_id") || "");
  const fromName = truncate(formData.get("from_name") as string, 200) || "";
  const fromEmail = truncate(formData.get("from_email") as string, 200) || "";
  const fromAddress = truncate(formData.get("from_address") as string, 500) || "";
  const toName = truncate(formData.get("to_name") as string, 200) || "";
  const toEmail = truncate(formData.get("to_email") as string, 200) || "";
  const toAddress = truncate(formData.get("to_address") as string, 500) || "";
  const issueDate = String(formData.get("issue_date") || "").trim();
  const dueDate = String(formData.get("due_date") || "").trim();
  const entryIdsRaw = String(formData.get("entry_ids") || "[]");
  const notes = truncate(formData.get("notes") as string, 5000) || "";
  const paymentInfo = truncate(formData.get("payment_info") as string, 5000) || "";
  const taxRate = Number(formData.get("tax_rate")) || 0;
  const discount = Number(formData.get("discount")) || 0;
  const currency = truncate((formData.get("currency") as string) || "USD", 10) || "USD";

  if (!invoiceId) {
    return { error: "Invoice id is required." };
  }

  let entryIds: string[] = [];
  try {
    entryIds = JSON.parse(entryIdsRaw);
  } catch {
    return { error: "Invalid entry IDs." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`invoice_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const invoiceNumber = String(formData.get("invoice_number") || "").trim();

  const updatePayload: Record<string, unknown> = {
    title: invoiceTitle || "INVOICE",
    from_name: fromName || null,
    from_email: fromEmail || null,
    from_address: fromAddress || null,
    to_name: toName || null,
    to_email: toEmail || null,
    to_address: toAddress || null,
    issue_date: issueDate || new Date().toISOString().split("T")[0],
    due_date: dueDate || null,
    entry_ids: entryIds,
    notes: notes || null,
    payment_info: paymentInfo || null,
    tax_rate: taxRate,
    discount,
    currency,
  };

  if (invoiceNumber) {
    updatePayload.invoice_number = invoiceNumber;
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update(updatePayload)
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: sanitizeDbError(updateError) };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};

export const deleteInvoiceAction = async (formData: FormData): Promise<ActionResult> => {
  const invoiceId = String(formData.get("invoice_id") || "");
  const clientId = String(formData.get("client_id") || "");

  if (!invoiceId) {
    return { error: "Invoice id is required." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`invoice_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: deleteError } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: sanitizeDbError(deleteError) };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};

export const updateInvoiceStatusAction = async (formData: FormData): Promise<ActionResult> => {
  const invoiceId = String(formData.get("invoice_id") || "");
  const clientId = String(formData.get("client_id") || "");
  const status = String(formData.get("status") || "draft");

  if (!invoiceId) {
    return { error: "Invoice id is required." };
  }

  const validStatuses = ["draft", "sent", "paid"];
  if (!validStatuses.includes(status)) {
    return { error: "Invalid status." };
  }

  const { supabase, userId, error } = await getUserId();
  if (!userId) {
    return { error };
  }

  const ip = await getClientIp();
  if (!rateLimit(`invoice_mutate_${ip}`, 30, 60000).success) {
    return { error: "Too many actions. Please try again later." };
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: sanitizeDbError(updateError) };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};
