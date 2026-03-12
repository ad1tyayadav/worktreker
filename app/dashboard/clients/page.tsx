import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { ClientsPageClient, ClientStats } from "@/components/features/ClientsPageClient";
import { Card } from "@/components/ui/Card";

export default async function ClientsPage() {
  await requireUser();
  const supabase = await createClient();

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, description, color")
    .order("created_at", { ascending: false });

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, client_id");

  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("id, section_id, status, billable_units, rate_per_unit, currency");

  const sectionMap = new Map<string, string>();
  (sections || []).forEach((section) => {
    sectionMap.set(section.id, section.client_id);
  });

  const statsMap = new Map<string, ClientStats>();
  const pendingCurrencies = new Map<string, Set<string>>();
  (clients || []).forEach((client) => {
    statsMap.set(client.id, {
      id: client.id,
      name: client.name,
      description: client.description,
      color: client.color,
      sectionsCount: 0,
      entriesCount: 0,
      pendingTotal: 0,
      pendingCurrency: null,
      pendingMixed: false,
    });
    pendingCurrencies.set(client.id, new Set());
  });

  (sections || []).forEach((section) => {
    const stats = statsMap.get(section.client_id);
    if (stats) {
      stats.sectionsCount += 1;
    }
  });

  (entries || []).forEach((entry) => {
    const clientId = sectionMap.get(entry.section_id);
    if (!clientId) return;
    const stats = statsMap.get(clientId);
    if (!stats) return;
    stats.entriesCount += 1;
    if (entry.status === "pending") {
      stats.pendingTotal += (entry.billable_units || 0) * (entry.rate_per_unit || 0);
      const set = pendingCurrencies.get(clientId);
      if (set) {
        set.add(entry.currency || "USD");
      }
    }
  });

  pendingCurrencies.forEach((set, clientId) => {
    const stats = statsMap.get(clientId);
    if (!stats) return;
    if (set.size === 1) {
      stats.pendingCurrency = Array.from(set)[0];
    } else if (set.size > 1) {
      stats.pendingMixed = true;
    }
  });

  const errors = [
    clientsError ? `Failed to load clients: ${clientsError.message}` : null,
    sectionsError ? `Failed to load sections: ${sectionsError.message}` : null,
    entriesError ? `Failed to load entries: ${entriesError.message}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {errors.length > 0 ? (
        <Card className="border border-danger/40 bg-danger-soft p-4">
          <div className="font-display text-[11px] uppercase tracking-[0.24em] text-danger">Data Load Issue</div>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-danger">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      ) : null}
      <ClientsPageClient clients={Array.from(statsMap.values())} />
    </div>
  );
}
