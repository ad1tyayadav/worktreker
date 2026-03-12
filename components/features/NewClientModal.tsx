"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { createClientAction, updateClientAction, deleteClientAction } from "@/app/actions/clients";
import { Client } from "@/lib/types";

const defaultColor = "#E8312A";

type NewClientModalProps = {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  startDelete?: boolean;
};

export const NewClientModal = ({ open, onClose, client, startDelete = false }: NewClientModalProps) => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (client) {
      setName(client.name);
      setDescription(client.description || "");
      setColor(client.color || defaultColor);
    } else {
      setName("");
      setDescription("");
      setColor(defaultColor);
    }
    setError(null);
    setSaving(false);
    setConfirmDelete(startDelete);
  }, [client, open, startDelete]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("color", color);

    let result;
    if (client) {
      formData.set("id", client.id);
      result = await updateClientAction(formData);
    } else {
      result = await createClientAction(formData);
    }

    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    onClose();
  };

  const handleDelete = async () => {
    if (!client) return;
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.set("id", client.id);
    const result = await deleteClientAction(formData);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    onClose();
    router.push("/dashboard/clients");
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose} title={client ? "Edit Client" : "New Client"} className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="client-name"
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Textarea
          id="client-description"
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="flex flex-col gap-2">
          <label className="font-retro text-xl uppercase tracking-[0.1em] text-muted">Accent Color</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        {error ? <div className="font-retro text-lg text-accent">{error}</div> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : client ? "Save Changes" : "Create Client"}
          </Button>
        </div>
      </form>

      {client ? (
        <div className="mt-6 border-t-2 border-dashed border-ink pt-4">
          <div className="font-retro text-xl uppercase tracking-[0.1em] text-accent">
            [ DANGER ZONE ]
          </div>
          {confirmDelete ? (
            <div className="mt-3 space-y-3">
              <div className="font-retro text-lg text-accent">Are you sure? This cannot be undone.</div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="danger" onClick={handleDelete} disabled={saving}>
                  Confirm Delete
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
                Delete Client
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};
