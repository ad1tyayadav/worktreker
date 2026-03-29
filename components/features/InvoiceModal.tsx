"use client";

import React, { useState, useMemo } from "react";
import { Section, Entry, Invoice } from "@/lib/types";
import { InvoiceTheme } from "@/components/features/InvoicePreview";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createInvoiceAction, updateInvoiceAction } from "@/app/actions/invoices";
import { generateInvoicePdf } from "@/lib/pdf";
import { CURRENCIES } from "@/lib/format";

type InvoiceModalProps = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  sections: Section[];
  entries: Entry[];
  invoice?: Invoice | null;
  onCreated?: (invoiceId: string, theme: InvoiceTheme) => void;
};

export const InvoiceModal = ({
  open,
  onClose,
  clientId,
  clientName,
  sections,
  entries,
  invoice,
  onCreated,
}: InvoiceModalProps) => {
  const isEdit = !!invoice;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [fromName, setFromName] = useState(invoice?.from_name || "");
  const [fromEmail, setFromEmail] = useState(invoice?.from_email || "");
  const [fromAddress, setFromAddress] = useState(invoice?.from_address || "");
  const [toName, setToName] = useState(invoice?.to_name || clientName);
  const [toEmail, setToEmail] = useState(invoice?.to_email || "");
  const [toAddress, setToAddress] = useState(invoice?.to_address || "");
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(invoice?.due_date || "");
  const [notes, setNotes] = useState(invoice?.notes || "Thank you for your business!");
  const [taxRate, setTaxRate] = useState(String(invoice?.tax_rate || 0));
  const [discount, setDiscount] = useState(String(invoice?.discount || 0));
  const [currency, setCurrency] = useState(invoice?.currency || "USD");
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(
    new Set(invoice?.entry_ids || [])
  );
  const [theme, setTheme] = useState<InvoiceTheme>("retro");
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.invoice_number || "");
  const [invoiceTitle, setInvoiceTitle] = useState(invoice?.title || "INVOICE");
  const [paymentInfo, setPaymentInfo] = useState(invoice?.payment_info || "");
  const [downloadAfterSave, setDownloadAfterSave] = useState(false);

  const entriesBySection = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach((e) => {
      const list = map.get(e.section_id) || [];
      list.push(e);
      map.set(e.section_id, list);
    });
    return map;
  }, [entries]);

  const toggleEntry = (id: string) => {
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (sectionId: string) => {
    const sectionEntries = entriesBySection.get(sectionId) || [];
    const allSelected = sectionEntries.every((e) => selectedEntryIds.has(e.id));
    setSelectedEntryIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        sectionEntries.forEach((e) => next.delete(e.id));
      } else {
        sectionEntries.forEach((e) => next.add(e.id));
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedEntryIds(new Set(entries.map((e) => e.id)));
  };

  const selectNone = () => {
    setSelectedEntryIds(new Set());
  };

  const importNotesFromEntries = () => {
    const selected = entries.filter((e) => selectedEntryIds.has(e.id));
    const entryNotes = selected
      .filter((e) => e.notes && e.notes.trim())
      .map((e) => `• ${e.title}: ${e.notes}`)
      .join("\n");
    if (!entryNotes) return;
    setNotes((prev) => {
      const existing = prev.trim();
      if (existing && existing !== "Thank you for your business!") {
        return `${existing}\n\n${entryNotes}`;
      }
      return entryNotes;
    });
  };

  const selectedHaveNotes = useMemo(() => {
    return entries.some((e) => selectedEntryIds.has(e.id) && e.notes && e.notes.trim());
  }, [entries, selectedEntryIds]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedEntryIds.size === 0) {
      setError("Select at least one entry.");
      return;
    }
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("from_name", fromName);
    formData.set("from_email", fromEmail);
    formData.set("from_address", fromAddress);
    formData.set("to_name", toName);
    formData.set("to_email", toEmail);
    formData.set("to_address", toAddress);
    formData.set("issue_date", issueDate);
    formData.set("due_date", dueDate);
    formData.set("notes", notes);
    formData.set("tax_rate", taxRate);
    formData.set("discount", discount);
    formData.set("currency", currency);
    formData.set("entry_ids", JSON.stringify(Array.from(selectedEntryIds)));
    formData.set("invoice_number", invoiceNumber);
    formData.set("title", invoiceTitle);
    formData.set("payment_info", paymentInfo);

    let finalInvoiceId = invoice?.id;
    if (isEdit && invoice) {
      formData.set("invoice_id", invoice.id);
      const result = await updateInvoiceAction(formData);
      if (result?.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
    } else {
      const result = await createInvoiceAction(formData);
      if (result?.error) {
        setError(result.error);
        setSaving(false);
        return;
      }
      finalInvoiceId = result.invoiceId;
      if (result.invoiceId && onCreated) {
        onCreated(result.invoiceId, theme);
      }
    }

    if (downloadAfterSave && finalInvoiceId) {
      const updatedInvoice: Invoice = {
        ...(invoice || ({} as Invoice)),
        id: finalInvoiceId,
        client_id: clientId,
        user_id: invoice?.user_id || "", 
        invoice_number: invoiceNumber || "DRAFT-NUMBER", 
        title: invoiceTitle || "INVOICE",
        from_name: fromName,
        from_email: fromEmail,
        from_address: fromAddress,
        to_name: toName,
        to_email: toEmail,
        to_address: toAddress,
        issue_date: issueDate,
        due_date: dueDate,
        notes: notes,
        payment_info: paymentInfo,
        tax_rate: Number(taxRate) || 0,
        discount: Number(discount) || 0,
        currency: currency,
        entry_ids: Array.from(selectedEntryIds),
        status: invoice?.status || "draft",
        created_at: invoice?.created_at || new Date().toISOString(),
      };
      generateInvoicePdf({
        invoice: updatedInvoice,
        entries,
        clientName,
        theme,
      });
    }

    setSaving(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Invoice" : "Create Invoice"}
      className="max-w-2xl"
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Theme Selector */}
        <fieldset className="space-y-2 border-2 border-dashed border-ink p-4">
          <legend className="font-pixel text-[10px] uppercase tracking-[0.1em] text-muted px-1">
            Invoice Theme
          </legend>
          <div className="flex gap-3">
            <label
              className={`flex-1 cursor-pointer border-2 px-4 py-3 text-center transition-all ${
                theme === "retro"
                  ? "border-accent bg-accent/10 shadow-hard-sm"
                  : "border-ink bg-paper hover:bg-card-hover"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="retro"
                checked={theme === "retro"}
                onChange={() => setTheme("retro")}
                className="sr-only"
              />
              <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                Retro
              </div>
              <div className="mt-1 font-retro text-sm text-muted">
                Pixel fonts, hard shadows
              </div>
            </label>
            <label
              className={`flex-1 cursor-pointer border-2 px-4 py-3 text-center transition-all ${
                theme === "classic"
                  ? "border-accent bg-accent/10 shadow-hard-sm"
                  : "border-ink bg-paper hover:bg-card-hover"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="classic"
                checked={theme === "classic"}
                onChange={() => setTheme("classic")}
                className="sr-only"
              />
              <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                Classic
              </div>
              <div className="mt-1 font-retro text-sm text-muted">
                Clean, professional look
              </div>
            </label>
          </div>
        </fieldset>

        {/* Invoice Number */}
        <Input
          id="inv-number"
          label="Invoice Number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Leave empty to auto-generate (e.g. INV-2603-0001)"
        />
        <Input
          id="inv-title"
          label="Invoice Title"
          value={invoiceTitle}
          onChange={(e) => setInvoiceTitle(e.target.value)}
          placeholder="e.g. INVOICE, ESTIMATE, RECEIPT"
        />

        {/* From Section */}
        <fieldset className="space-y-3 border-2 border-dashed border-ink p-4">
          <legend className="font-pixel text-[10px] uppercase tracking-[0.1em] text-muted px-1">
            From (Your Details)
          </legend>
          <Input
            id="inv-from-name"
            label="Name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Your name / business"
          />
          <Input
            id="inv-from-email"
            label="Email"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Textarea
            id="inv-from-address"
            label="Address"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder="Street, City, Country"
            rows={2}
          />
        </fieldset>

        {/* To Section */}
        <fieldset className="space-y-3 border-2 border-dashed border-ink p-4">
          <legend className="font-pixel text-[10px] uppercase tracking-[0.1em] text-muted px-1">
            Bill To (Client)
          </legend>
          <Input
            id="inv-to-name"
            label="Name"
            value={toName}
            onChange={(e) => setToName(e.target.value)}
            placeholder="Client name"
          />
          <Input
            id="inv-to-email"
            label="Email"
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="client@example.com"
          />
          <Textarea
            id="inv-to-address"
            label="Address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Client address"
            rows={2}
          />
        </fieldset>

        {/* Dates & Currency */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            id="inv-issue-date"
            label="Issue Date"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
          <Input
            id="inv-due-date"
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            id="inv-currency"
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            {CURRENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Entry Selection */}
        <fieldset className="space-y-3 border-2 border-dashed border-ink p-4">
          <legend className="font-pixel text-[10px] uppercase tracking-[0.1em] text-muted px-1">
            Line Items — Select Entries
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              className="font-retro text-lg text-accent hover:underline"
              onClick={selectAll}
            >
              Select All
            </button>
            <span className="text-muted">|</span>
            <button
              type="button"
              className="font-retro text-lg text-accent hover:underline"
              onClick={selectNone}
            >
              Select None
            </button>
            <span className="text-muted ml-auto font-retro text-lg">
              {selectedEntryIds.size} selected
            </span>
          </div>

          {sections.length === 0 ? (
            <div className="text-center font-retro text-lg text-muted py-4">
              No sections to display
            </div>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {sections.map((section) => {
                const sEntries = entriesBySection.get(section.id) || [];
                const allChecked = sEntries.length > 0 && sEntries.every((e) => selectedEntryIds.has(e.id));
                return (
                  <div key={section.id} className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={() => toggleSection(section.id)}
                        className="accent-accent w-4 h-4"
                      />
                      <span className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                        {section.title}
                      </span>
                    </label>
                    <div className="ml-6 space-y-1">
                      {sEntries.map((entry) => (
                        <label
                          key={entry.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedEntryIds.has(entry.id)}
                            onChange={() => toggleEntry(entry.id)}
                            className="accent-accent w-4 h-4"
                          />
                          <span className="font-body text-sm text-ink">{entry.title}</span>
                          <span className="text-xs text-muted ml-auto">
                            {entry.billable_units} × {entry.rate_per_unit || 0}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* Tax & Discount */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="inv-tax"
            label="Tax Rate (%)"
            type="number"
            step="0.01"
            min="0"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
          <Input
            id="inv-discount"
            label="Discount (%)"
            type="number"
            step="0.01"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        {/* Notes with Import */}
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-1">
            <Textarea
              id="inv-payment"
              label="Payment / Bank Details"
              value={paymentInfo}
              onChange={(e) => setPaymentInfo(e.target.value)}
              rows={3}
              placeholder="Bank details, wire instructions, etc."
            />
            <Textarea
              id="inv-notes"
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Thank you for your business!"
            />
          </div>
          {selectedHaveNotes && (
            <button
              type="button"
              onClick={importNotesFromEntries}
              className="inline-flex items-center gap-1.5 border-2 border-dashed border-ink bg-paper px-3 py-2 font-retro text-lg text-accent hover:bg-card-hover hover:shadow-hard-sm transition-all"
            >
              ↓ Import notes from selected entries
            </button>
          )}
        </div>

        {error && (
          <div className="font-retro text-lg text-accent">{error}</div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={saving}
              onClick={() => setDownloadAfterSave(true)}
            >
              {saving && downloadAfterSave ? "Saving..." : "Save & Download PDF"}
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={saving}
              onClick={() => setDownloadAfterSave(false)}
            >
              {saving && !downloadAfterSave
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                ? "Save Invoice"
                : "Create Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
