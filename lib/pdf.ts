"use client";

import jsPDF from "jspdf";
import { Entry, Invoice } from "@/lib/types";

type Theme = "retro" | "classic";

type PdfOptions = {
  invoice: Invoice;
  entries: Entry[];
  clientName?: string;
  theme?: Theme;
};

const COLORS = {
  ink: [26, 26, 46] as [number, number, number],
  muted: [90, 90, 122] as [number, number, number],
  accent: [232, 49, 42] as [number, number, number],
  border: [26, 26, 46] as [number, number, number],
  borderLight: [200, 200, 210] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  paper: [250, 250, 247] as [number, number, number],
  green: [76, 175, 80] as [number, number, number],
  blue: [91, 184, 245] as [number, number, number],
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - MARGIN * 2;

const ensureSpace = (pdf: jsPDF, y: number, needed: number): number => {
  if (y + needed > PAGE_H - MARGIN) {
    pdf.addPage();
    return MARGIN;
  }
  return y;
};

const drawLine = (pdf: jsPDF, x1: number, y: number, x2: number, color: [number, number, number] = COLORS.border, width = 0.5) => {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(width);
  pdf.line(x1, y, x2, y);
};

const drawDashedLine = (pdf: jsPDF, x1: number, y: number, x2: number, color: [number, number, number] = COLORS.borderLight) => {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(0.3);
  const dashLen = 3;
  const gapLen = 2;
  let x = x1;
  while (x < x2) {
    const end = Math.min(x + dashLen, x2);
    pdf.line(x, y, end, y);
    x = end + gapLen;
  }
};

export const downloadInvoicePdf = async (
  _element: HTMLElement, // kept for backward compat, no longer used
  filename: string = "invoice.pdf",
  options?: PdfOptions
) => {
  if (!options) return;
  generateTextPdf(options, filename);
};

export const generateInvoicePdf = (options: PdfOptions, filename?: string) => {
  generateTextPdf(options, filename || `${options.invoice.invoice_number}.pdf`);
};

function generateTextPdf(options: PdfOptions, filename: string) {
  const { invoice, entries, clientName, theme = "retro" } = options;
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const selectedEntries = entries.filter((e) => invoice.entry_ids.includes(e.id));
  const subtotal = selectedEntries.reduce((s, e) => s + (e.billable_units || 0) * (e.rate_per_unit || 0), 0);
  const taxAmt = subtotal * ((invoice.tax_rate || 0) / 100);
  const discAmt = subtotal * ((invoice.discount || 0) / 100);
  const grandTotal = subtotal + taxAmt - discAmt;
  const cur = invoice.currency || "USD";

  const fmt = (v: number) => {
    try {
      const num = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
      return `${cur} ${num}`;
    } catch {
      return `${cur} ${v.toFixed(2)}`;
    }
  };

  const isRetro = theme === "retro";
  const headingFont = isRetro ? "courier" : "helvetica";
  const bodyFont = "helvetica";

  let y = MARGIN;

  // ── Background ──
  if (isRetro) {
    pdf.setFillColor(...COLORS.paper);
    pdf.rect(0, 0, PAGE_W, PAGE_H, "F");
  }

  // ═══════════════════════════════════
  //  HEADER
  // ═══════════════════════════════════
  pdf.setFont(headingFont, "bold");
  pdf.setFontSize(isRetro ? 22 : 26);
  pdf.setTextColor(...(isRetro ? COLORS.accent : COLORS.ink));
  const docTitle = (invoice.title || "INVOICE").toUpperCase();
  pdf.text(docTitle, MARGIN, y + 8);

  pdf.setFont(bodyFont, "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(...COLORS.muted);
  pdf.text(invoice.invoice_number, MARGIN, y + 14);

  pdf.text(invoice.invoice_number, MARGIN, y + 14);

  y += 22;
  drawLine(pdf, MARGIN, y, PAGE_W - MARGIN, COLORS.border, 0.8);
  y += 6;

  // ═══════════════════════════════════
  //  FROM / TO / DETAILS
  // ═══════════════════════════════════
  const colW = CONTENT_W / 3;

  const renderInfoBlock = (label: string, lines: (string | null)[], startX: number) => {
    let localY = y;
    pdf.setFont(headingFont, "bold");
    pdf.setFontSize(isRetro ? 8 : 7);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(label.toUpperCase(), startX, localY);
    localY += 5;

    pdf.setFont(bodyFont, "normal");
    pdf.setFontSize(9);
    let first = true;
    for (const line of lines) {
      if (!line) continue;
      if (first) {
        pdf.setFont(bodyFont, "bold");
        pdf.setTextColor(...COLORS.ink);
        first = false;
      } else {
        pdf.setFont(bodyFont, "normal");
        pdf.setTextColor(...COLORS.muted);
      }
      // Wrap long lines
      const wrapped = pdf.splitTextToSize(line, colW - 5);
      for (const wl of wrapped) {
        localY = ensureSpace(pdf, localY, 5);
        pdf.text(wl, startX, localY);
        localY += 4;
      }
    }
    return localY;
  };

  const y1 = renderInfoBlock("From", [invoice.from_name, invoice.from_email, invoice.from_address], MARGIN);
  const y2 = renderInfoBlock("Bill To", [invoice.to_name || clientName || null, invoice.to_email, invoice.to_address], MARGIN + colW);

  // Details column
  let detY = y;
  const detX = MARGIN + colW * 2;
  pdf.setFont(headingFont, "bold");
  pdf.setFontSize(isRetro ? 8 : 7);
  pdf.setTextColor(...COLORS.muted);
  pdf.text("DETAILS", detX, detY);
  detY += 5;

  pdf.setFont(bodyFont, "normal");
  pdf.setFontSize(9);
  if (invoice.issue_date) {
    pdf.setTextColor(...COLORS.muted);
    pdf.text("Issued: ", detX, detY);
    pdf.setTextColor(...COLORS.ink);
    pdf.text(formatDateStr(invoice.issue_date), detX + 16, detY);
    detY += 5;
  }
  if (invoice.due_date) {
    pdf.setTextColor(...COLORS.muted);
    pdf.text("Due: ", detX, detY);
    pdf.setTextColor(...COLORS.ink);
    pdf.text(formatDateStr(invoice.due_date), detX + 16, detY);
    detY += 5;
  }

  y = Math.max(y1, y2, detY) + 4;
  drawDashedLine(pdf, MARGIN, y, PAGE_W - MARGIN);
  y += 6;

  // ═══════════════════════════════════
  //  LINE ITEMS TABLE
  // ═══════════════════════════════════
  const cols = [
    { label: "Item", x: MARGIN, w: CONTENT_W * 0.42 },
    { label: "Qty", x: MARGIN + CONTENT_W * 0.42, w: CONTENT_W * 0.13 },
    { label: "Rate", x: MARGIN + CONTENT_W * 0.55, w: CONTENT_W * 0.2 },
    { label: "Total", x: MARGIN + CONTENT_W * 0.75, w: CONTENT_W * 0.25 },
  ];

  // Table header
  y = ensureSpace(pdf, y, 10);
  if (isRetro) {
    pdf.setFillColor(245, 245, 240);
    pdf.rect(MARGIN, y - 2, CONTENT_W, 8, "F");
  }
  pdf.setFont(headingFont, "bold");
  pdf.setFontSize(isRetro ? 8 : 7);
  pdf.setTextColor(...COLORS.muted);
  for (const col of cols) {
    const align = col.label === "Item" ? "left" : "right";
    const tx = align === "right" ? col.x + col.w - 2 : col.x;
    pdf.text(col.label.toUpperCase(), tx, y + 3, { align });
  }
  y += 8;
  drawLine(pdf, MARGIN, y - 2, PAGE_W - MARGIN, COLORS.border, 0.6);

  // Table rows
  if (selectedEntries.length === 0) {
    y = ensureSpace(pdf, y, 10);
    pdf.setFont(bodyFont, "italic");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("No items selected", MARGIN + CONTENT_W / 2, y + 4, { align: "center" });
    y += 12;
  } else {
    for (const entry of selectedEntries) {
      y = ensureSpace(pdf, y, 14);
      const lineTotal = (entry.billable_units || 0) * (entry.rate_per_unit || 0);

      // Title
      pdf.setFont(bodyFont, "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.ink);
      const titleLines = pdf.splitTextToSize(entry.title, cols[0].w - 4);
      pdf.text(titleLines[0], cols[0].x, y + 4);

      // Subtitle (unit info)
      pdf.setFont(bodyFont, "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(`${entry.unit_count} ${entry.unit_type}`, cols[0].x, y + 8.5);

      // Reference URL (clickable)
      if (entry.reference_url) {
        pdf.setTextColor(...COLORS.blue);
        pdf.setFontSize(7);
        const urlText = entry.reference_url.length > 35
          ? entry.reference_url.substring(0, 35) + "..."
          : entry.reference_url;
        pdf.textWithLink(urlText, cols[0].x, y + 12, { url: entry.reference_url });
      }

      // Qty
      pdf.setFont(bodyFont, "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...COLORS.muted);
      pdf.text(String(entry.billable_units || 0), cols[1].x + cols[1].w - 2, y + 4, { align: "right" });

      // Rate
      pdf.text(fmt(entry.rate_per_unit || 0), cols[2].x + cols[2].w - 2, y + 4, { align: "right" });

      // Total
      pdf.setFont(bodyFont, "bold");
      pdf.setTextColor(...COLORS.ink);
      pdf.text(fmt(lineTotal), cols[3].x + cols[3].w - 2, y + 4, { align: "right" });

      const rowH = entry.reference_url ? 16 : 12;
      y += rowH;
      drawDashedLine(pdf, MARGIN, y - 1, PAGE_W - MARGIN);
    }
  }

  y += 4;

  // ═══════════════════════════════════
  //  TOTALS
  // ═══════════════════════════════════
  y = ensureSpace(pdf, y, 30);
  drawLine(pdf, MARGIN, y, PAGE_W - MARGIN, COLORS.border, 0.6);
  y += 6;

  const totalLabelX = PAGE_W - MARGIN - 70;
  const totalValueX = PAGE_W - MARGIN;

  let pY = y;
  let tY = y;

  if (invoice.payment_info) {
    pdf.setFont(headingFont, "bold");
    pdf.setFontSize(isRetro ? 8 : 7);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("PAYMENT DETAILS", MARGIN, pY);
    pY += 5;

    pdf.setFont(bodyFont, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.muted);
    const pLines = pdf.splitTextToSize(invoice.payment_info, CONTENT_W / 2 - 10);
    for (const pl of pLines) {
      pY = ensureSpace(pdf, pY, 5);
      pdf.text(pl, MARGIN, pY);
      pY += 4;
    }
  }

  const renderTotalRow = (label: string, value: string, bold = false, color: [number, number, number] = COLORS.ink) => {
    tY = ensureSpace(pdf, tY, 7);
    pdf.setFont(bodyFont, bold ? "bold" : "normal");
    pdf.setFontSize(bold ? 10 : 9);
    pdf.setTextColor(...COLORS.muted);
    pdf.text(label, totalLabelX, tY);
    pdf.setTextColor(...color);
    pdf.text(value, totalValueX, tY, { align: "right" });
    tY += 6;
  };

  renderTotalRow("Subtotal", fmt(subtotal));
  if (invoice.tax_rate > 0) renderTotalRow(`Tax (${invoice.tax_rate}%)`, fmt(taxAmt));
  if (invoice.discount > 0) renderTotalRow(`Discount (${invoice.discount}%)`, `-${fmt(discAmt)}`, false, COLORS.green);

  drawLine(pdf, totalLabelX, tY - 1, PAGE_W - MARGIN, COLORS.border, 0.6);
  tY += 3;

  pdf.setFont(isRetro ? headingFont : bodyFont, "bold");
  pdf.setFontSize(isRetro ? 11 : 12);
  pdf.setTextColor(...COLORS.muted);
  pdf.text("TOTAL", totalLabelX, tY + 1);
  pdf.setTextColor(...(isRetro ? COLORS.accent : COLORS.ink));
  pdf.text(fmt(grandTotal), totalValueX, tY + 1, { align: "right" });
  tY += 10;

  y = Math.max(pY, tY);

  // ═══════════════════════════════════
  //  NOTES
  // ═══════════════════════════════════
  if (invoice.notes) {
    y = ensureSpace(pdf, y, 20);
    drawDashedLine(pdf, MARGIN, y, PAGE_W - MARGIN);
    y += 6;

    pdf.setFont(headingFont, "bold");
    pdf.setFontSize(isRetro ? 8 : 7);
    pdf.setTextColor(...COLORS.muted);
    pdf.text("NOTES", MARGIN, y);
    y += 5;

    pdf.setFont(bodyFont, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...COLORS.muted);
    const noteLines = pdf.splitTextToSize(invoice.notes, CONTENT_W);
    for (const nl of noteLines) {
      y = ensureSpace(pdf, y, 5);
      pdf.text(nl, MARGIN, y);
      y += 4;
    }
  }

  // ── Footer ──
  y = ensureSpace(pdf, y, 15);
  y += 8;
  drawDashedLine(pdf, MARGIN, y, PAGE_W - MARGIN);
  y += 5;
  pdf.setFont(bodyFont, "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...COLORS.muted);
  pdf.text("Generated by Work//Treker", PAGE_W / 2, y, { align: "center" });

  pdf.save(filename);
}

function formatDateStr(val: string): string {
  try {
    const d = new Date(val);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(d);
  } catch {
    return val;
  }
}
