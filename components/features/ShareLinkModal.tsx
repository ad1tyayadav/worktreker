"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createShareLinkAction, deleteShareLinkAction, getShareLinkAction } from "@/app/actions/share";

type ShareLinkModalProps = {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
};

const visibilityOptions = [
  { key: "show_status", label: "Entry Status", description: "Pending / Paid badges" },
  { key: "show_notes", label: "Notes", description: "Entry notes and descriptions" },
  { key: "show_references", label: "Reference Links", description: "URLs attached to entries" },
  { key: "show_rates", label: "Billing & Rates", description: "Rates, totals, and amounts" },
] as const;

type VisibilityKey = (typeof visibilityOptions)[number]["key"];

export const ShareLinkModal = ({ open, onClose, clientId, clientName }: ShareLinkModalProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Visibility toggles
  const [visibility, setVisibility] = useState<Record<VisibilityKey, boolean>>({
    show_status: true,
    show_notes: false,
    show_references: false,
    show_rates: false,
  });

  // Current link's saved settings (for display when link exists)
  const [savedVisibility, setSavedVisibility] = useState<Record<VisibilityKey, boolean> | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    setRevoking(false);

    getShareLinkAction(clientId).then((result) => {
      if (result.error) {
        setError(result.error);
      } else if (result.shareLink) {
        setToken(result.shareLink.token);
        const saved = {
          show_status: result.shareLink.show_status ?? true,
          show_notes: result.shareLink.show_notes ?? false,
          show_references: result.shareLink.show_references ?? false,
          show_rates: result.shareLink.show_rates ?? false,
        };
        setSavedVisibility(saved);
        setVisibility(saved);
      } else {
        setToken(null);
        setSavedVisibility(null);
        setVisibility({
          show_status: true,
          show_notes: false,
          show_references: false,
          show_rates: false,
        });
      }
      setLoading(false);
    });
  }, [open, clientId]);

  const shareUrl = token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${token}`
    : null;

  const toggleVisibility = (key: VisibilityKey) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("client_id", clientId);
    formData.set("show_notes", String(visibility.show_notes));
    formData.set("show_references", String(visibility.show_references));
    formData.set("show_rates", String(visibility.show_rates));
    formData.set("show_status", String(visibility.show_status));
    const result = await createShareLinkAction(formData);
    if (result.error) {
      setError(result.error);
    } else if (result.token) {
      setToken(result.token);
      setSavedVisibility({ ...visibility });
    }
    setLoading(false);
  };

  const handleRevoke = async () => {
    setRevoking(true);
    setError(null);
    const formData = new FormData();
    formData.set("client_id", clientId);
    const result = await deleteShareLinkAction(formData);
    if (result.error) {
      setError(result.error);
      setRevoking(false);
      return;
    }
    setToken(null);
    setSavedVisibility(null);
    setVisibility({
      show_status: true,
      show_notes: false,
      show_references: false,
      show_rates: false,
    });
    setRevoking(false);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if visibility has changed from saved
  const hasChanges =
    savedVisibility !== null &&
    (visibility.show_notes !== savedVisibility.show_notes ||
      visibility.show_references !== savedVisibility.show_references ||
      visibility.show_rates !== savedVisibility.show_rates ||
      visibility.show_status !== savedVisibility.show_status);

  return (
    <Modal open={open} onClose={onClose} title="Share Link" className="max-w-lg">
      <div className="space-y-4">
        <div className="font-retro text-xl text-muted">
          Share a read-only view of <span className="text-ink">{clientName}</span> with your client.
        </div>

        {loading ? (
          <div className="rounded-none border-2 border-dashed border-ink bg-paper px-6 py-8 text-center">
            <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-muted">Loading...</div>
          </div>
        ) : (
          <>
            {/* Visibility options */}
            <div className="rounded-none border-2 border-dashed border-ink bg-paper p-3">
              <div className="mb-3 font-retro text-xl uppercase tracking-[0.1em] text-muted">
                [ WHAT TO SHOW ]
              </div>
              <div className="space-y-2">
                {visibilityOptions.map((opt) => (
                  <label
                    key={opt.key}
                    className="flex items-center gap-3 rounded-none border-2 border-transparent px-2 py-2 transition-colors cursor-pointer hover:border-border-soft hover:bg-card-hover min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={visibility[opt.key]}
                      onChange={() => toggleVisibility(opt.key)}
                      className="h-5 w-5 rounded-none border-2 border-ink accent-accent cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-body text-sm font-bold text-ink">{opt.label}</div>
                      <div className="font-retro text-lg text-ghost">{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {token && shareUrl ? (
              <div className="space-y-3">
                <div className="rounded-none border-2 border-ink bg-paper p-3">
                  <div className="font-retro text-lg uppercase tracking-[0.1em] text-muted mb-1">Public Link</div>
                  <div className="break-all font-body text-sm text-blue select-all">{shareUrl}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="primary" onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  {hasChanges ? (
                    <Button type="button" variant="secondary" onClick={handleGenerate}>
                      Update & Regenerate
                    </Button>
                  ) : null}
                  <Button type="button" variant="danger" onClick={handleRevoke} disabled={revoking}>
                    {revoking ? "Revoking..." : "Revoke Link"}
                  </Button>
                </div>
                {hasChanges ? (
                  <div className="font-retro text-lg text-accent">
                    Visibility changed -- click "Update & Regenerate" to apply. This will create a new link URL.
                  </div>
                ) : (
                  <div className="font-retro text-lg text-ghost">
                    Anyone with this link can view the selected fields.
                  </div>
                )}
              </div>
            ) : (
              <Button type="button" variant="primary" onClick={handleGenerate} className="w-full">
                Generate Public Link
              </Button>
            )}
          </>
        )}

        {error ? <div className="font-retro text-lg text-accent">{error}</div> : null}
      </div>
    </Modal>
  );
};

