import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function DashboardPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id");

  const { data: totalsEntries, error: totalsError } = await supabase
    .from("entries")
    .select("status, billable_units, rate_per_unit, currency");

  const { data: recentEntries, error: recentError } = await supabase
    .from("entries")
    .select(
      "id, title, unit_type, unit_count, status, created_at, sections (id, clients (id, name))"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const totals = (totalsEntries || []).reduce(
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
    { pending: 0, paid: 0, pendingCurrencies: new Set<string>(), paidCurrencies: new Set<string>() }
  );

  const formatTotal = (amount: number, currencies: Set<string>) => {
    if (currencies.size === 0) return formatCurrency(0, "USD");
    if (currencies.size === 1) return formatCurrency(amount, Array.from(currencies)[0]);
    return "Mixed";
  };

  const errors = [
    clientsError ? `Failed to load clients: ${clientsError.message}` : null,
    totalsError ? `Failed to load entry totals: ${totalsError.message}` : null,
    recentError ? `Failed to load recent entries: ${recentError.message}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="font-pixel text-[11px] sm:text-[13px] md:text-[16px] uppercase tracking-[0.05em] text-ink pixel-cursor">
          Dashboard
        </div>
      </div>

      {errors.length > 0 ? (
        <Card className="border-accent bg-danger-soft p-4">
          <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-accent">Data Load Issue</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 font-retro text-lg text-accent">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <StatCard label="Total Clients" value={String(clients?.length || 0)} />
        <StatCard label="Total Pending Amount" value={formatTotal(totals.pending, totals.pendingCurrencies)} />
        <StatCard label="Total Paid Amount" value={formatTotal(totals.paid, totals.paidCurrencies)} />
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-3 font-retro text-2xl uppercase tracking-[0.1em] text-muted">
          [ RECENT ENTRIES ]
        </div>
        {recentEntries && recentEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body text-sm sm:text-base">
              <thead>
                <tr>
                  {["Title", "Client", "Unit", "Status", "Date"].map((label) => (
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
                {recentEntries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-card-hover border-b border-dashed border-border-soft">
                    <td className="px-3 py-3">
                      <div className="font-pixel text-[10px] uppercase tracking-[0.05em] text-ink">
                        {entry.title}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-body text-sm text-muted">
                      {(entry.sections as any)?.clients?.name || "-"}
                    </td>
                    <td className="px-3 py-3 font-body text-sm text-muted">
                      {formatNumber(entry.unit_count)} {entry.unit_type}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={entry.status === "paid" ? "paid" : "pending"}>
                        {entry.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-retro text-lg text-muted">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-none border-2 border-dashed border-ink bg-paper px-6 py-10 text-center">
            <h3 className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">No Entries</h3>
            <p className="mt-2 font-retro text-xl text-muted">Log your first delivery</p>
          </div>
        )}
      </Card>
    </div>
  );
}
