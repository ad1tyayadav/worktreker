import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatNumber, formatDate, formatCurrency } from "@/lib/format";
import Image from "next/image";
import { FormattedText } from "@/components/common/FormattedText";

type SharedSection = {
  id: string;
  title: string;
  created_at: string;
};

type SharedEntry = {
  id: string;
  section_id: string;
  title: string;
  unit_type: string;
  unit_count: number;
  billable_units?: number;
  rate_per_unit?: number | null;
  currency?: string | null;
  notes?: string | null;
  reference_url?: string | null;
  status: "pending" | "paid";
  created_at: string;
};

type VisibilityFlags = {
  showStatus: boolean;
  showNotes: boolean;
  showReferences: boolean;
  showRates: boolean;
};

type SharedClientViewProps = {
  clientName: string;
  clientDescription: string | null;
  clientColor: string | null;
  sections: SharedSection[];
  entries: SharedEntry[];
  visibility: VisibilityFlags;
};

export const SharedClientView = ({
  clientName,
  clientDescription,
  clientColor,
  sections,
  entries,
  visibility,
}: SharedClientViewProps) => {
  const entryMap = new Map<string, SharedEntry[]>();
  entries.forEach((entry) => {
    const current = entryMap.get(entry.section_id) || [];
    current.push(entry);
    entryMap.set(entry.section_id, current);
  });

  const totalEntries = entries.length;
  const paidEntries = entries.filter((e) => e.status === "paid").length;
  const pendingEntries = totalEntries - paidEntries;

  // Build dynamic column headers
  const columns: string[] = ["Title", "Unit"];
  if (visibility.showRates) columns.push("Billable", "Rate", "Total");
  if (visibility.showReferences) columns.push("Ref");
  if (visibility.showStatus) columns.push("Status");
  columns.push("Date");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="font-retro text-2xl uppercase tracking-[0.15em] text-muted">
          [ SHARED WORK ]
        </div>
        <div className="mt-2 font-pixel text-[11px] sm:text-[13px] md:text-[16px] lg:text-[20px] uppercase tracking-[0.05em] text-ink">
          {clientName}
        </div>
        {clientDescription ? (
          <div className="mt-2 font-body text-sm sm:text-base text-muted">{clientDescription}</div>
        ) : null}
      </div>

      {/* Stats */}
      <div className={`grid gap-4 sm:gap-6 ${visibility.showStatus ? "md:grid-cols-3" : "md:grid-cols-1"}`}>
        <Card className="p-4">
          <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink">
            {totalEntries}
          </div>
          <div className="mt-1 font-retro text-lg text-muted">Total Entries</div>
        </Card>
        {visibility.showStatus ? (
          <>
            <Card className="p-4">
              <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-yellow">
                {pendingEntries}
              </div>
              <div className="mt-1 font-retro text-lg text-muted">Pending</div>
            </Card>
            <Card className="p-4">
              <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-green">
                {paidEntries}
              </div>
              <div className="mt-1 font-retro text-lg text-muted">Completed</div>
            </Card>
          </>
        ) : null}
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-ink bg-card px-6 py-10 text-center">
          <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">
            No Work Logged Yet
          </div>
          <div className="mt-2 font-retro text-xl text-muted">Check back later</div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {sections.map((section) => {
            const sectionEntries = entryMap.get(section.id) || [];
            return (
              <div
                key={section.id}
                className="rounded-none border-2 border-ink bg-card min-w-0 w-full overflow-hidden"
                style={{ borderLeft: `4px solid ${clientColor || "#E8312A"}` }}
              >
                {/* Section header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-ink bg-card-hover px-4 py-3">
                  <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">
                    {section.title}
                  </div>
                  <div className="font-retro text-lg text-muted">
                    {sectionEntries.length} entries
                  </div>
                </div>

                {/* Entries table */}
                {sectionEntries.length === 0 ? (
                  <div className="px-4 py-6 text-center font-retro text-lg text-muted">
                    No entries in this section
                  </div>
                ) : (
                  <div className="overflow-x-auto p-4 max-w-full">
                    <table className="w-full min-w-full border-collapse font-body text-sm sm:text-base whitespace-nowrap">
                      <thead>
                        <tr>
                          {columns.map((label) => (
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
                        {sectionEntries.map((entry) => {
                          const hasRate = entry.rate_per_unit !== null && entry.rate_per_unit !== undefined;
                          const total = (entry.billable_units || 0) * (entry.rate_per_unit || 0);
                          const currency = entry.currency || "USD";

                          return (
                            <React.Fragment key={entry.id}>
                              <tr className="border-b border-dashed border-border-soft transition-colors hover:bg-card-hover">
                                <td className="px-3 py-3">
                                  <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                                    {entry.title}
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-muted">
                                  {formatNumber(entry.unit_count)} {entry.unit_type}
                                </td>
                                {visibility.showRates ? (
                                  <>
                                    <td className="px-3 py-3 text-muted">
                                      {formatNumber(entry.billable_units || 0)}
                                    </td>
                                    <td className="px-3 py-3 text-muted">
                                      {hasRate ? formatCurrency(entry.rate_per_unit ?? 0, currency) : "-"}
                                    </td>
                                    <td className="px-3 py-3 text-muted">
                                      {hasRate ? formatCurrency(total, currency) : "-"}
                                    </td>
                                  </>
                                ) : null}
                                {visibility.showReferences ? (
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
                                ) : null}
                                {visibility.showStatus ? (
                                  <td className="px-3 py-3">
                                    <Badge variant={entry.status === "paid" ? "paid" : "pending"}>
                                      {entry.status.toUpperCase()}
                                    </Badge>
                                  </td>
                                ) : null}
                                <td className="px-3 py-3 font-retro text-lg text-muted">
                                  {formatDate(entry.created_at)}
                                </td>
                              </tr>
                              {visibility.showNotes && entry.notes ? (
                                <tr className="border-b border-dashed border-border-soft">
                                  <td colSpan={columns.length} className="px-3 py-2">
                                    <div className="rounded-none border-l-2 border-ink bg-paper pl-3 py-2">
                                      <div className="font-retro text-lg uppercase tracking-[0.1em] text-ghost mb-1">Notes</div>
                                      <div className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-muted">
                                        <FormattedText text={entry.notes} />
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-dashed border-ink pt-4 text-center">
        <div className="font-retro text-xl text-ghost flex items-center justify-center gap-2">
          <span>Powered by</span>

          <span className="font-pixel text-[10px] text-accent flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-ink bg-paper shadow-hard-sm">
              <Image
                src="/logo.png"
                alt="Work//Treker logo"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
                priority
              />
            </span>
            Work//Treker
          </span>
        </div>
      </div>
    </div>
  );
};



