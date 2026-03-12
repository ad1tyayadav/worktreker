import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";

type ClientCardProps = {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  sectionsCount: number;
  entriesCount: number;
  pendingTotal: number;
  pendingCurrency?: string | null;
  pendingMixed?: boolean;
};

export const ClientCard = ({
  id,
  name,
  description,
  color,
  sectionsCount,
  entriesCount,
  pendingTotal,
  pendingCurrency,
  pendingMixed,
}: ClientCardProps) => {
  const pendingLabel = pendingMixed
    ? "Mixed"
    : formatCurrency(pendingTotal, pendingCurrency || "USD");

  return (
    <Link href={`/dashboard/clients/${id}`} className="block">
      <Card
        className="border-l-4 p-4 transition-all"
        style={{ borderLeftColor: color || "#E8312A" }}
      >
        <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">{name}</div>
        {description ? (
          <div className="mt-2 font-body text-sm text-muted">{description}</div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-3 font-retro text-lg text-muted">
          <span>{sectionsCount} sections</span>
          <span>·</span>
          <span>{entriesCount} entries</span>
          <span>·</span>
          <span>{pendingLabel} pending</span>
        </div>
      </Card>
    </Link>
  );
};
