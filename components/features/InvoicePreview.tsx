"use client";

import React, { forwardRef } from "react";
import { Entry, Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

export type InvoiceTheme = "retro" | "classic";

type InvoicePreviewProps = {
  invoice: Invoice;
  entries: Entry[];
  clientName?: string;
  theme?: InvoiceTheme;
};

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ invoice, entries, clientName, theme = "retro" }, ref) => {
    const selectedEntries = entries.filter((e) =>
      invoice.entry_ids.includes(e.id)
    );

    const subtotal = selectedEntries.reduce(
      (sum, e) => sum + (e.billable_units || 0) * (e.rate_per_unit || 0),
      0
    );

    const taxAmount = subtotal * ((invoice.tax_rate || 0) / 100);
    const discountAmount = subtotal * ((invoice.discount || 0) / 100);
    const grandTotal = subtotal + taxAmount - discountAmount;
    const cur = invoice.currency || "USD";

    const isRetro = theme === "retro";

    // Theme-based classes
    const heading = isRetro
      ? "font-pixel uppercase tracking-[0.05em]"
      : "font-sans font-bold tracking-tight";
    const label = isRetro
      ? "font-pixel text-[10px] uppercase tracking-[0.1em] text-muted"
      : "font-sans text-[11px] font-semibold uppercase tracking-wider text-gray-400";
    const body = isRetro ? "font-body" : "font-sans";
    const borderStyle = isRetro ? "border-ink" : "border-gray-200";
    const borderDashed = isRetro
      ? "border-dashed border-ink"
      : "border-gray-100";
    const bgCard = isRetro ? "bg-white" : "bg-white";
    const shadowStyle = isRetro ? "shadow-hard-lg border-2 border-ink" : "shadow-lg border border-gray-200 rounded-lg";

    return (
      <div
        ref={ref}
        className={`${bgCard} ${shadowStyle}`}
        style={{ minWidth: 600, maxWidth: 800, margin: "0 auto" }}
      >
        {/* Header */}
        <div className={`flex flex-wrap items-start justify-between gap-4 border-b-2 ${borderStyle} p-6 sm:p-8`}>
          <div>
            <div className={`${heading} ${isRetro ? "text-[16px] sm:text-[20px] text-accent" : "text-2xl text-gray-800"}`}>
              {invoice.title || "INVOICE"}
            </div>
            <div className={`mt-1 ${isRetro ? "font-retro text-xl text-muted" : "text-sm text-gray-400"}`}>
              {invoice.invoice_number}
            </div>
          </div>
        </div>

        {/* From / To / Dates */}
        <div className={`grid gap-6 border-b-2 ${borderDashed} p-6 sm:p-8 sm:grid-cols-3`}>
          <div>
            <div className={`${label} mb-2`}>From</div>
            <div className={`${body} text-sm space-y-0.5`}>
              {invoice.from_name && <div className="font-bold text-ink">{invoice.from_name}</div>}
              {invoice.from_email && <div className="text-muted">{invoice.from_email}</div>}
              {invoice.from_address && (
                <div className="text-muted whitespace-pre-line">{invoice.from_address}</div>
              )}
            </div>
          </div>
          <div>
            <div className={`${label} mb-2`}>Bill To</div>
            <div className={`${body} text-sm space-y-0.5`}>
              {(invoice.to_name || clientName) && (
                <div className="font-bold text-ink">{invoice.to_name || clientName}</div>
              )}
              {invoice.to_email && <div className="text-muted">{invoice.to_email}</div>}
              {invoice.to_address && (
                <div className="text-muted whitespace-pre-line">{invoice.to_address}</div>
              )}
            </div>
          </div>
          <div>
            <div className={`${label} mb-2`}>Details</div>
            <div className={`${body} text-sm space-y-1`}>
              <div>
                <span className="text-muted">Issued: </span>
                {invoice.issue_date ? formatDate(invoice.issue_date) : "-"}
              </div>
              {invoice.due_date && (
                <div>
                  <span className="text-muted">Due: </span>
                  {formatDate(invoice.due_date)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 sm:p-8">
          <table className={`w-full border-collapse ${body} text-sm`}>
            <thead>
              <tr>
                {["Item", "Qty", "Rate", "Total"].map((h) => (
                  <th
                    key={h}
                    className={`border-b-2 ${borderStyle} px-3 py-2 ${label} ${
                      h === "Item" ? "text-left" : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedEntries.length > 0 ? (
                selectedEntries.map((entry) => {
                  const lineTotal =
                    (entry.billable_units || 0) * (entry.rate_per_unit || 0);
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b ${borderDashed}`}
                    >
                      <td className="px-3 py-3">
                        <div className="font-bold text-ink">{entry.title}</div>
                        <div className="text-xs text-muted">
                          {entry.unit_count} {entry.unit_type}
                        </div>
                        {entry.reference_url && (
                          <a
                            href={entry.reference_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs ${isRetro ? "text-blue" : "text-blue-500"} hover:underline`}
                          >
                            {entry.reference_url.length > 40
                              ? entry.reference_url.substring(0, 40) + "..."
                              : entry.reference_url}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right text-muted">
                        {entry.billable_units}
                      </td>
                      <td className="px-3 py-3 text-right text-muted">
                        {formatCurrency(entry.rate_per_unit || 0, cur)}
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-ink">
                        {formatCurrency(lineTotal, cur)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-muted">
                    No items selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Payment & Totals */}
        <div className={`border-t-2 ${borderStyle} p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-6`}>
          <div className="w-full sm:w-1/2">
            {invoice.payment_info && (
              <div>
                <div className={`${label} mb-2`}>Payment Details</div>
                <div className={`${body} text-sm text-muted whitespace-pre-line`}>
                  {invoice.payment_info}
                </div>
              </div>
            )}
          </div>
          <div className="w-full sm:w-64 space-y-2 shrink-0">
            <div className={`flex justify-between ${body} text-sm`}>
              <span className="text-muted">Subtotal</span>
              <span className="text-ink">{formatCurrency(subtotal, cur)}</span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className={`flex justify-between ${body} text-sm`}>
                <span className="text-muted">Tax ({invoice.tax_rate}%)</span>
                <span className="text-ink">{formatCurrency(taxAmount, cur)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className={`flex justify-between ${body} text-sm`}>
                <span className="text-muted">Discount ({invoice.discount}%)</span>
                <span className="text-green">-{formatCurrency(discountAmount, cur)}</span>
              </div>
            )}
            <div className={`flex justify-between border-t-2 ${borderStyle} pt-2`}>
              <span className={`${heading} ${isRetro ? "text-[11px] text-ink" : "text-sm text-gray-800"}`}>
                Total
              </span>
              <span className={`${heading} ${isRetro ? "text-[13px] text-accent" : "text-lg text-gray-900"}`}>
                {formatCurrency(grandTotal, cur)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className={`border-t-2 ${borderDashed} p-6 sm:p-8`}>
            <div className={`${label} mb-2`}>Notes</div>
            <div className={`${body} text-sm text-muted whitespace-pre-line`}>
              {invoice.notes}
            </div>
          </div>
        )}
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
