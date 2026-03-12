"use client";

import React, { useMemo, useState } from "react";
import { Section, Entry } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { EntryModal } from "@/components/features/EntryModal";
import { EntryRow } from "@/components/features/EntryRow";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { updateSectionAction } from "@/app/actions/sections";
import { formatCurrency } from "@/lib/format";

type SectionPanelProps = {
  section: Section;
  entries: Entry[];
  clientId: string;
  accentColor?: string | null;
};

export const SectionPanel = ({ section, entries, clientId, accentColor }: SectionPanelProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteIntent, setDeleteIntent] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const totals = useMemo(() => {
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
        return acc;
      },
      {
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

  const openCreate = () => {
    setEditingEntry(null);
    setDeleteIntent(false);
    setModalOpen(true);
  };

  const openEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setDeleteIntent(false);
    setModalOpen(true);
  };

  const openDelete = (entry: Entry) => {
    setEditingEntry(entry);
    setDeleteIntent(true);
    setModalOpen(true);
  };

  const handleSectionUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditSaving(true);
    setEditError(null);
    const formData = new FormData();
    formData.set("section_id", section.id);
    formData.set("client_id", clientId);
    formData.set("title", editTitle);
    const result = await updateSectionAction(formData);
    if (result?.error) {
      setEditError(result.error);
      setEditSaving(false);
      return;
    }
    setEditSaving(false);
    setEditOpen(false);
  };

  return (
    <div
      className="rounded-none border-2 border-ink bg-card min-w-0 w-full overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor || "#E8312A"}` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-ink bg-card-hover px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="font-pixel text-[10px] uppercase text-muted transition-colors hover:text-accent min-w-[44px] min-h-[44px] flex items-center justify-center"
            type="button"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "▶" : "▼"}
          </button>
          <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">{section.title}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEditTitle(section.title);
              setEditOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="button" variant="secondary" onClick={openCreate}>
            + Add Entry
          </Button>
        </div>
      </div>
      {!collapsed ? (
        <div className="p-4">
          {entries.length === 0 ? (
            <div className="rounded-none border-2 border-dashed border-ink bg-paper px-6 py-10 text-center">
              <h3 className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">No Entries</h3>
              <p className="mt-2 font-retro text-xl text-muted">Log your first delivery</p>
              <div className="mt-4">
                <Button type="button" variant="primary" onClick={openCreate}>
                  Add Entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t-2 border-dashed border-ink p-4 min-w-0 w-full overflow-hidden">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full min-w-full border-collapse font-body text-sm sm:text-base whitespace-nowrap">
                  <thead>
                    <tr>
                      {[
                        "Title",
                        "Unit",
                        "Billable",
                        "Rate",
                        "Total",
                        "Ref",
                        "Status",
                        "Actions",
                      ].map((label) => (
                        <th
                          key={label}
                          className="border-b-2 border-ink px-3 py-3 text-left font-pixel text-[10px] uppercase tracking-[0.05em] text-muted"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <EntryRow
                        key={entry.id}
                        entry={entry}
                        clientId={clientId}
                        onEdit={openEdit}
                        onDelete={openDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2 border-t-2 border-dashed border-ink bg-card-hover px-4 py-3 font-retro text-lg text-muted">
        <div>
          Pending {formatTotal(totals.pending, totals.pendingCurrencies)} | Paid{" "}
          {formatTotal(totals.paid, totals.paidCurrencies)}
        </div>
      </div>
      <EntryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clientId={clientId}
        sectionId={section.id}
        entry={editingEntry}
        startDelete={deleteIntent}
      />
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Section">
        <form onSubmit={handleSectionUpdate} className="space-y-3">
          <Input
            id={`section-${section.id}`}
            label="Section Title"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            required
          />
          {editError ? <div className="font-retro text-lg text-accent">{editError}</div> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={editSaving}>
              {editSaving ? "Saving..." : "Save Section"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
