"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ClientCard } from "@/components/features/ClientCard";
import { NewClientModal } from "@/components/features/NewClientModal";

export type ClientStats = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  sectionsCount: number;
  entriesCount: number;
  pendingTotal: number;
  pendingCurrency?: string | null;
  pendingMixed?: boolean;
};

export const ClientsPageClient = ({ clients }: { clients: ClientStats[] }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
          [ CLIENTS.EXE ]
        </div>
        <Button type="button" variant="primary" onClick={() => setModalOpen(true)}>
          + New Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-ink bg-card px-6 py-10 text-center">
          <h3 className="font-pixel text-[11px] sm:text-[13px] uppercase tracking-[0.05em] text-ink">
            No Clients Yet
          </h3>
          <p className="mt-2 font-retro text-xl text-muted">Add your first client to start tracking</p>
          <div className="mt-4">
            <Button type="button" variant="primary" onClick={() => setModalOpen(true)}>
              Add Client
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <ClientCard key={client.id} {...client} />
          ))}
        </div>
      )}

      <NewClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
