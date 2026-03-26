"use client";

import React, { useState } from "react";
import { Invoice, Entry } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteInvoiceAction, updateInvoiceStatusAction } from "@/app/actions/invoices";

type InvoiceListCardProps = {
  invoices: Invoice[];
  entries: Entry[];
  clientId: string;
  currency?: string;
  onEdit: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
};

export const InvoiceListCard = ({
  invoices,
  entries,
  clientId,
  onEdit,
  onView,
}: InvoiceListCardProps) => {
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const getInvoiceTotal = (invoice: Invoice) => {
    const selected = entries.filter((e) => invoice.entry_ids.includes(e.id));
    const subtotal = selected.reduce(
      (sum, e) => sum + (e.billable_units || 0) * (e.rate_per_unit || 0),
      0
    );
    const tax = subtotal * ((invoice.tax_rate || 0) / 100);
    const disc = subtotal * ((invoice.discount || 0) / 100);
    return subtotal + tax - disc;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const formData = new FormData();
    formData.set("invoice_id", deleteTarget.id);
    formData.set("client_id", clientId);
    await deleteInvoiceAction(formData);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleStatusCycle = async (invoice: Invoice) => {
    setStatusUpdating(invoice.id);
    const nextStatus =
      invoice.status === "draft"
        ? "sent"
        : invoice.status === "sent"
        ? "paid"
        : "draft";
    const formData = new FormData();
    formData.set("invoice_id", invoice.id);
    formData.set("client_id", clientId);
    formData.set("status", nextStatus);
    await updateInvoiceStatusAction(formData);
    setStatusUpdating(null);
  };

  const statusVariant = (status: string): "pending" | "paid" => {
    return status === "paid" ? "paid" : "pending";
  };

  if (invoices.length === 0) return null;

  return (
    <>
      <Card className="p-4 sm:p-6">
        <div className="mb-4 font-retro text-2xl uppercase tracking-[0.15em] text-muted">
          [ INVOICES ]
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body text-sm sm:text-base whitespace-nowrap">
            <thead>
              <tr>
                {["Title / Number", "Date", "Total", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="border-b-2 border-ink px-3 py-3 text-left font-pixel text-[10px] uppercase tracking-[0.05em] text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-dashed border-border-soft transition-colors hover:bg-card-hover"
                >
                  <td className="px-3 py-3">
                    <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                      {inv.title || "INVOICE"}
                    </div>
                    <div className="mt-1 font-body text-xs text-muted">
                      {inv.invoice_number}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-retro text-lg text-muted">
                    {formatDate(inv.issue_date)}
                  </td>
                  <td className="px-3 py-3 font-body font-bold text-ink">
                    {formatCurrency(getInvoiceTotal(inv), inv.currency || "USD")}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleStatusCycle(inv)}
                      disabled={statusUpdating === inv.id}
                      className="cursor-pointer"
                      title="Click to change status"
                    >
                      <Badge variant={statusVariant(inv.status)}>
                        {statusUpdating === inv.id ? "..." : inv.status.toUpperCase()}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="font-retro text-lg text-accent hover:underline"
                        onClick={() => onView(inv)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="font-retro text-lg text-muted hover:text-ink hover:underline"
                        onClick={() => onEdit(inv)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="font-retro text-lg text-muted hover:text-accent hover:underline"
                        onClick={() => setDeleteTarget(inv)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invoice"
      >
        <div className="space-y-4">
          <div className="font-body text-sm text-ink">
            Are you sure you want to delete invoice{" "}
            <span className="font-bold">{deleteTarget?.invoice_number}</span>? This
            action cannot be undone.
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Invoice"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
