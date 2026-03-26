"use client";

import React, { useRef, useState } from "react";
import { Invoice, Entry } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { InvoicePreview, InvoiceTheme } from "@/components/features/InvoicePreview";
import { generateInvoicePdf } from "@/lib/pdf";

type InvoiceViewModalProps = {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  entries: Entry[];
  clientName: string;
  initialTheme?: InvoiceTheme;
};

export const InvoiceViewModal = ({
  open,
  onClose,
  invoice,
  entries,
  clientName,
  initialTheme = "retro",
}: InvoiceViewModalProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState<InvoiceTheme>(initialTheme);

  if (!invoice) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      generateInvoicePdf({
        invoice,
        entries,
        clientName,
        theme,
      }, `${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error("PDF download failed:", err);
    }
    setDownloading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Invoice ${invoice.invoice_number}`}
      className="max-w-4xl"
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Theme toggle */}
          <div className="flex gap-1 border-2 border-ink">
            <button
              type="button"
              onClick={() => setTheme("retro")}
              className={`px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.05em] transition-all ${
                theme === "retro"
                  ? "bg-accent text-white"
                  : "bg-paper text-muted hover:bg-card-hover"
              }`}
            >
              Retro
            </button>
            <button
              type="button"
              onClick={() => setTheme("classic")}
              className={`px-3 py-2 font-pixel text-[10px] uppercase tracking-[0.05em] transition-all ${
                theme === "classic"
                  ? "bg-accent text-white"
                  : "bg-paper text-muted hover:bg-card-hover"
              }`}
            >
              Classic
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? "Generating PDF..." : "⬇ Download PDF"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <InvoicePreview
            ref={previewRef}
            invoice={invoice}
            entries={entries}
            clientName={clientName}
            theme={theme}
          />
        </div>
      </div>
    </Modal>
  );
};
