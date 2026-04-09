"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createEntryAction, deleteEntryAction, updateEntryAction } from "@/app/actions/entries";
import { formatCurrency, formatNumber, CURRENCIES } from "@/lib/format";
import { Entry } from "@/lib/types";

const presets = ["Reel", "Short", "Graphic", "Post", "Story", "Video", "Custom"];

type EntryModalProps = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  sectionId: string;
  entry?: Entry | null;
  startDelete?: boolean;
};

export const EntryModal = ({
  open,
  onClose,
  clientId,
  sectionId,
  entry,
  startDelete = false,
}: EntryModalProps) => {
  const [title, setTitle] = useState("");
  const [unitType, setUnitType] = useState("Reel");
  const [customUnitType, setCustomUnitType] = useState("");
  const [unitCount, setUnitCount] = useState(1);
  const [billableUnits, setBillableUnits] = useState(1);
  const [ratePerUnit, setRatePerUnit] = useState<number | "">("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [status, setStatus] = useState<"pending" | "paid">("pending");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setTitle(entry.title);
      const isPreset = presets.includes(entry.unit_type);
      setUnitType(isPreset ? entry.unit_type : "Custom");
      setCustomUnitType(isPreset ? "" : entry.unit_type);
      setUnitCount(Number(entry.unit_count || 1));
      setBillableUnits(Number(entry.billable_units || 1));
      setRatePerUnit(entry.rate_per_unit ?? "");
      setCurrency(entry.currency || "USD");
      setNotes(entry.notes || "");
      setReferenceUrl(entry.reference_url || "");
      setStatus(entry.status);
      setConfirmDelete(startDelete);
    } else {
      setTitle("");
      setUnitType("Reel");
      setCustomUnitType("");
      setUnitCount(1);
      setBillableUnits(1);
      setRatePerUnit("");
      setCurrency("USD");
      setNotes("");
      setReferenceUrl("");
      setStatus("pending");
      setConfirmDelete(false);
    }
    setError(null);
    setSaving(false);
  }, [entry, open, startDelete]);

  const computedTotal = useMemo(() => {
    const rate = typeof ratePerUnit === "number" ? ratePerUnit : 0;
    return billableUnits * rate;
  }, [billableUnits, ratePerUnit]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("section_id", sectionId);
    formData.set("title", title);
    formData.set("unit_type", unitType === "Custom" ? customUnitType : unitType);
    formData.set("unit_count", String(unitCount));
    formData.set("billable_units", String(billableUnits));
    if (ratePerUnit !== "") {
      formData.set("rate_per_unit", String(ratePerUnit));
    }
    formData.set("currency", currency);
    formData.set("notes", notes);
    formData.set("reference_url", referenceUrl);
    formData.set("status", status);

    let result;
    if (entry) {
      formData.set("entry_id", entry.id);
      result = await updateEntryAction(formData);
    } else {
      result = await createEntryAction(formData);
    }

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!entry) return;
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("entry_id", entry.id);
    formData.set("client_id", clientId);
    const result = await deleteEntryAction(formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? "Edit Entry" : "Add Entry"}
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-none border-2 border-dashed border-ink bg-paper p-3">
          <div className="mb-3 font-retro text-xl uppercase tracking-[0.1em] text-muted">
            [ DETAILS ]
          </div>
          <div className="space-y-3">
            <Input
              id="entry-title"
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                id="entry-unit-type"
                label="Unit Type"
                value={unitType}
                onChange={(event) => setUnitType(event.target.value)}
              >
                {presets.map((preset) => (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                ))}
              </Select>
              {unitType === "Custom" ? (
                <Input
                  id="entry-unit-custom"
                  label="Custom Unit"
                  value={customUnitType}
                  onChange={(event) => setCustomUnitType(event.target.value)}
                  placeholder="e.g. Carousel"
                  required
                />
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-none border-2 border-dashed border-ink bg-paper p-3">
          <div className="mb-3 font-retro text-xl uppercase tracking-[0.1em] text-muted">
            [ BILLING ]
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              id="entry-unit-count"
              label="Unit Count"
              type="number"
              min={0}
              value={unitCount}
              onChange={(event) => setUnitCount(Number(event.target.value))}
            />
            <Input
              id="entry-billable-units"
              label="Billable Units"
              type="number"
              min={0}
              step="0.25"
              value={billableUnits}
              onChange={(event) => setBillableUnits(Number(event.target.value))}
            />
            <Input
              id="entry-rate"
              label="Rate per Billable Unit"
              type="number"
              min={0}
              step="0.01"
              value={ratePerUnit}
              onChange={(event) =>
                setRatePerUnit(event.target.value === "" ? "" : Number(event.target.value))
              }
              placeholder="Amount"
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Select
              id="entry-currency"
              label="Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="flex flex-col gap-1.5">
              <label className="font-retro text-xl uppercase tracking-[0.1em] text-muted">Total</label>
              <div className="rounded-none border-2 border-ink bg-yellow-soft px-3 py-2.5 font-pixel text-[11px] text-ink">
                {formatCurrency(computedTotal, currency)}
              </div>
            </div>
          </div>
          <div className="mt-2 font-retro text-lg text-ghost">e.g. 2 Shorts = 1 billable unit</div>
          <div className="mt-1 font-retro text-lg text-ghost">
            {formatNumber(billableUnits)} billable units *{" "}
            {formatCurrency(typeof ratePerUnit === "number" ? ratePerUnit : 0, currency)}
          </div>
        </div>

        <div className="rounded-none border-2 border-dashed border-ink bg-paper p-3">
          <div className="mb-3 font-retro text-xl uppercase tracking-[0.1em] text-muted">
            [ EXTRAS ]
          </div>
          <div className="space-y-3">
            <Textarea
              id="entry-notes"
              label="Notes"
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            placeholder="Tip: Use [Video title](https://...) to add a link over text."
            />
            <Input
              id="entry-reference"
              label="Reference URL"
              type="url"
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="font-retro text-xl uppercase tracking-[0.1em] text-muted">Status</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={status === "pending" ? "secondary" : "ghost"}
                  onClick={() => setStatus("pending")}
                >
                  Pending
                </Button>
                <Button
                  type="button"
                  variant={status === "paid" ? "secondary" : "ghost"}
                  onClick={() => setStatus("paid")}
                >
                  Paid
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="font-retro text-lg text-accent">{error}</div> : null}

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t-2 border-dashed border-ink bg-card/95 pt-3">
          {entry ? (
            confirmDelete ? (
              <>
                <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>
                  Confirm Delete
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  disabled={saving}
                >
                  Cancel Delete
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="danger"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
                className="mr-auto"
              >
                Delete Entry
              </Button>
            )
          ) : null}
          {!confirmDelete ? (
            <>
              <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving..." : entry ? "Save Changes" : "Add Entry"}
              </Button>
            </>
          ) : null}
        </div>
      </form>
    </Modal>
  );
};


