"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Modal = ({ open, onClose, title, children, className = "", style }: ModalProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-none border-2 border-ink bg-card p-5 shadow-hard-lg ${className}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={style}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-ink pb-3">
            <h3 className="font-pixel text-[11px] sm:text-[13px] uppercase tracking-[0.05em] text-ink">{title}</h3>
            <button
              className="font-retro text-xl uppercase text-muted transition-colors hover:text-accent min-w-[44px] min-h-[44px] flex items-center justify-center"
              type="button"
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
};
