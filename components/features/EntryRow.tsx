"use client";

import React, { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toggleEntryStatusAction } from "@/app/actions/entries";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Entry } from "@/lib/types";

type EntryRowProps = {
  entry: Entry;
  clientId: string;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const FormattedText = ({ text }: { text: string }) => {
  if (!text) return null;
  
  const parts = text.split(URL_REGEX);
  
  return (
    <>
      {parts.map((part, i) => {
        if (part.match(URL_REGEX)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="font-retro text-lg text-blue underline decoration-dashed underline-offset-4 transition-colors hover:text-purple"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export const EntryRow = ({ entry, clientId, onEdit, onDelete }: EntryRowProps) => {
  const [status, setStatus] = useState(entry.status);
  const [isPending, startTransition] = useTransition();
  const [notesOpen, setNotesOpen] = useState(false);

  const total = (entry.billable_units || 0) * (entry.rate_per_unit || 0);
  const hasRate = entry.rate_per_unit !== null && entry.rate_per_unit !== undefined;
  const currency = entry.currency || "USD";

  const toggleStatus = () => {
    const nextStatus = status === "paid" ? "pending" : "paid";
    setStatus(nextStatus);
    const formData = new FormData();
    formData.set("entry_id", entry.id);
    formData.set("client_id", clientId);
    formData.set("status", nextStatus);

    startTransition(async () => {
      const result = await toggleEntryStatusAction(formData);
      if (result?.error) {
        setStatus(status);
      }
    });
  };

  return (
    <>
      <tr className="transition-colors hover:bg-card-hover border-b border-dashed border-border-soft">
        <td className="px-3 py-3 align-top">
          <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">{entry.title}</div>
        </td>
        <td className="px-3 py-3 font-body text-sm text-muted">
          {formatNumber(entry.unit_count)} {entry.unit_type}
        </td>
        <td className="px-3 py-3 font-body text-sm text-muted">
          {formatNumber(entry.billable_units)}
        </td>
        <td className="px-3 py-3 font-body text-sm text-muted">
          {hasRate ? formatCurrency(entry.rate_per_unit ?? 0, currency) : "-"}
        </td>
        <td className="px-3 py-3 font-body text-sm text-muted">
          {hasRate ? formatCurrency(total, currency) : "-"}
        </td>
        <td className="px-3 py-3">
          {entry.reference_url ? (
            <a
              href={entry.reference_url}
              target="_blank"
              rel="noreferrer"
              className="font-retro text-lg uppercase text-blue transition-colors hover:text-purple"
            >
              Open ↗
            </a>
          ) : (
            "-"
          )}
        </td>
        <td className="px-3 py-3">
          <button
            type="button"
            onClick={toggleStatus}
            className="rounded-none border-0 bg-transparent p-0 cursor-pointer min-w-[44px] min-h-[44px]"
          >
            <Badge variant={status === "paid" ? "paid" : "pending"}>
              {isPending ? "Updating" : status.toUpperCase()}
            </Badge>
          </button>
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-nowrap gap-2">
            {entry.notes ? (
              <Button type="button" variant="ghost" onClick={() => setNotesOpen(true)}>
                Notes
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => onEdit(entry)}>
              Edit
            </Button>
            <Button type="button" variant="ghost" onClick={() => onDelete(entry)}>
              Delete
            </Button>
          </div>
        </td>
      </tr>

      <Modal
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
        title="Entry Notes"
        className="max-w-2xl"
      >
        <div className="space-y-3">
          <div className="font-retro text-xl uppercase tracking-[0.1em] text-muted">Entry</div>
          <div className="rounded-none border-2 border-ink bg-paper p-4 shadow-hard">
            <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
              {entry.title}
            </div>
            <div className="mt-3 max-h-[55vh] overflow-y-auto whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-ink">
              {entry.notes ? <FormattedText text={entry.notes} /> : <span className="text-muted">No notes yet.</span>}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
