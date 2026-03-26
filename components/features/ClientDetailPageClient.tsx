"use client";

import React, { useMemo, useState } from "react";
import { Client, Section, Entry, Invoice } from "@/lib/types";
import { InvoiceTheme } from "@/components/features/InvoicePreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SectionPanel } from "@/components/features/SectionPanel";
import { NewClientModal } from "@/components/features/NewClientModal";
import { ShareLinkModal } from "@/components/features/ShareLinkModal";
import { InvoiceModal } from "@/components/features/InvoiceModal";
import { InvoiceListCard } from "@/components/features/InvoiceListCard";
import { InvoiceViewModal } from "@/components/features/InvoiceViewModal";
import { createSectionAction } from "@/app/actions/sections";
import { formatCurrency } from "@/lib/format";

export const ClientDetailPageClient = ({
  client,
  sections,
  entries,
  invoices,
}: {
  client: Client;
  sections: Section[];
  entries: Entry[];
  invoices: Invoice[];
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [newSectionOpen, setNewSectionOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [sectionSaving, setSectionSaving] = useState(false);

  // Invoice state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewTheme, setViewTheme] = useState<InvoiceTheme>("retro");

  const entryMap = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach((entry) => {
      const current = map.get(entry.section_id) || [];
      current.push(entry);
      map.set(entry.section_id, current);
    });
    return map;
  }, [entries]);

  const summary = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        const total = (entry.billable_units || 0) * (entry.rate_per_unit || 0);
        const currency = entry.currency || "USD";
        if (entry.status === "paid") {
          acc.paid += total;
          acc.paidCurrencies.add(currency);
        } else {
          acc.pending += total;
          acc.pendingCurrencies.add(currency);
        }
        acc.totalEntries += 1;
        return acc;
      },
      {
        totalEntries: 0,
        pending: 0,
        paid: 0,
        pendingCurrencies: new Set<string>(),
        paidCurrencies: new Set<string>(),
      }
    );
  }, [entries]);

  const formatTotal = (amount: number, currencies: Set<string>) => {
    if (currencies.size === 0) return formatCurrency(0, "USD");
    if (currencies.size === 1) return formatCurrency(amount, Array.from(currencies)[0]);
    return "Mixed";
  };

  const handleCreateSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSectionSaving(true);
    setSectionError(null);
    const formData = new FormData();
    formData.set("client_id", client.id);
    formData.set("title", sectionTitle);
    const result = await createSectionAction(formData);
    if (result?.error) {
      setSectionError(result.error);
      setSectionSaving(false);
      return;
    }
    setSectionTitle("");
    setNewSectionOpen(false);
    setSectionSaving(false);
  };

  const handleOpenCreateInvoice = () => {
    setEditingInvoice(null);
    setInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] lg:text-[20px] uppercase tracking-[0.05em] text-ink">
            {client.name}
          </div>
          {client.description ? (
            <div className="mt-2 font-body text-sm sm:text-base text-muted">{client.description}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="primary" onClick={handleOpenCreateInvoice}>
            ✎ Invoice
          </Button>
          <Button type="button" variant="secondary" onClick={() => setShareOpen(true)}>
            Share Link
          </Button>
          <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
            Edit Client
          </Button>
          <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete Client
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card className="p-4">
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
            {summary.totalEntries}
          </div>
          <div className="mt-1 font-retro text-lg text-muted">Total Entries</div>
        </Card>
        <Card className="p-4">
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
            {formatTotal(summary.pending, summary.pendingCurrencies)}
          </div>
          <div className="mt-1 font-retro text-lg text-muted">Pending</div>
        </Card>
        <Card className="p-4">
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
            {formatTotal(summary.paid, summary.paidCurrencies)}
          </div>
          <div className="mt-1 font-retro text-lg text-muted">Paid</div>
        </Card>
      </div>

      {/* Invoices List */}
      <InvoiceListCard
        invoices={invoices}
        entries={entries}
        clientId={client.id}
        onEdit={handleEditInvoice}
        onView={handleViewInvoice}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="font-retro text-2xl uppercase tracking-[0.15em] text-muted">
          [ SECTIONS ]
        </div>
        <Button type="button" variant="primary" onClick={() => setNewSectionOpen(true)}>
          + New Section
        </Button>
      </div>

      {newSectionOpen ? (
        <Card className="p-4">
          <form onSubmit={handleCreateSection} className="space-y-3">
            <Input
              id="section-title"
              label="Section Title"
              value={sectionTitle}
              onChange={(event) => setSectionTitle(event.target.value)}
              required
            />
            {sectionError ? <div className="font-retro text-lg text-accent">{sectionError}</div> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="ghost" onClick={() => setNewSectionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={sectionSaving}>
                {sectionSaving ? "Creating..." : "Create Section"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {sections.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-ink bg-card px-6 py-10 text-center">
          <h3 className="font-pixel text-[11px] sm:text-[13px] uppercase tracking-[0.05em] text-ink">
            No Sections
          </h3>
          <p className="mt-2 font-retro text-xl text-muted">Create a section to organize your work</p>
          <div className="mt-4">
            <Button type="button" variant="primary" onClick={() => setNewSectionOpen(true)}>
              Create Section
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 min-w-0 w-full">
          {sections.map((section) => (
            <SectionPanel
              key={section.id}
              section={section}
              entries={entryMap.get(section.id) || []}
              clientId={client.id}
              accentColor={client.color}
            />
          ))}
        </div>
      )}

      <NewClientModal open={editOpen} onClose={() => setEditOpen(false)} client={client} />
      <NewClientModal open={deleteOpen} onClose={() => setDeleteOpen(false)} client={client} startDelete />
      <ShareLinkModal open={shareOpen} onClose={() => setShareOpen(false)} clientId={client.id} clientName={client.name} />

      {/* Invoice Modals */}
      {invoiceModalOpen && (
        <InvoiceModal
          key={editingInvoice ? editingInvoice.id : "new"}
          open={true}
        onClose={() => {
          setInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        clientId={client.id}
        clientName={client.name}
        sections={sections}
        entries={entries}
          invoice={editingInvoice}
          onCreated={(_id, theme) => setViewTheme(theme)}
        />
      )}
      <InvoiceViewModal
        open={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        entries={entries}
        clientName={client.name}
        initialTheme={viewTheme}
      />
    </div>
  );
};
