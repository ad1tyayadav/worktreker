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

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `INV-${y}${m}-${rand}`;
};

export const createInvoiceAction = async (formData: FormData): Promise<ActionResult & { invoiceId?: string }> => {
  const customNumber = String(formData.get("invoice_number") || "").trim();
  const invoiceTitle = String(formData.get("title") || "").trim();
  const clientId = String(formData.get("client_id") || "");
  const fromName = String(formData.get("from_name") || "").trim();
  const fromEmail = String(formData.get("from_email") || "").trim();
  const fromAddress = String(formData.get("from_address") || "").trim();
  const toName = String(formData.get("to_name") || "").trim();
  const toEmail = String(formData.get("to_email") || "").trim();
  const toAddress = String(formData.get("to_address") || "").trim();
  const issueDate = String(formData.get("issue_date") || "").trim();
  const dueDate = String(formData.get("due_date") || "").trim();
  const entryIdsRaw = String(formData.get("entry_ids") || "[]");
  const notes = String(formData.get("notes") || "").trim();
  const paymentInfo = String(formData.get("payment_info") || "").trim();
  const taxRate = Number(formData.get("tax_rate")) || 0;
  const discount = Number(formData.get("discount")) || 0;
  const currency = String(formData.get("currency") || "USD").trim() || "USD";

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
    return { error: insertError.message };
  }

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { invoiceId: data.id };
};

export const updateInvoiceAction = async (formData: FormData): Promise<ActionResult> => {
  const invoiceId = String(formData.get("invoice_id") || "");
  const invoiceTitle = String(formData.get("title") || "").trim();
  const clientId = String(formData.get("client_id") || "");
  const fromName = String(formData.get("from_name") || "").trim();
  const fromEmail = String(formData.get("from_email") || "").trim();
  const fromAddress = String(formData.get("from_address") || "").trim();
  const toName = String(formData.get("to_name") || "").trim();
  const toEmail = String(formData.get("to_email") || "").trim();
  const toAddress = String(formData.get("to_address") || "").trim();
  const issueDate = String(formData.get("issue_date") || "").trim();
  const dueDate = String(formData.get("due_date") || "").trim();
  const entryIdsRaw = String(formData.get("entry_ids") || "[]");
  const notes = String(formData.get("notes") || "").trim();
  const paymentInfo = String(formData.get("payment_info") || "").trim();
  const taxRate = Number(formData.get("tax_rate")) || 0;
  const discount = Number(formData.get("discount")) || 0;
  const currency = String(formData.get("currency") || "USD").trim() || "USD";

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
    return { error: updateError.message };
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

  const { error: deleteError } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (deleteError) {
    return { error: deleteError.message };
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

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .eq("user_id", userId);

  if (updateError) {
    return { error: updateError.message };
  }

  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
  return {};
};
