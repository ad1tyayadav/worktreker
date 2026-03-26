import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { ClientDetailPageClient } from "@/components/features/ClientDetailPageClient";
import { Card } from "@/components/ui/Card";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name, description, color, created_at")
    .eq("id", id)
    .single();

  if (clientError) {
    return (
      <Card className="border border-danger/40 bg-danger-soft p-4">
        <div className="font-display text-[11px] uppercase tracking-[0.24em] text-danger">Client Load Failed</div>
        <div className="mt-2 text-xs text-danger">{clientError.message}</div>
      </Card>
    );
  }

  if (!client) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <h3 className="font-display text-sm uppercase tracking-[0.24em] text-ink">Client Not Found</h3>
        <p className="mt-2 text-sm text-muted">We could not find that client.</p>
      </div>
    );
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, client_id, user_id, title, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: true });

  const sectionIds = (sections || []).map((section) => section.id);

  const { data: entries, error: entriesError } = sectionIds.length
    ? await supabase
        .from("entries")
        .select(
          "id, section_id, user_id, title, unit_type, unit_count, billable_units, rate_per_unit, currency, notes, reference_url, status, created_at"
        )
        .in("section_id", sectionIds)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  const errors = [
    sectionsError ? `Failed to load sections: ${sectionsError.message}` : null,
    entriesError ? `Failed to load entries: ${entriesError.message}` : null,
    invoicesError ? `Failed to load invoices: ${invoicesError.message}` : null,
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
      <ClientDetailPageClient
        client={client}
        sections={sections || []}
        entries={entries || []}
        invoices={invoices || []}
      />
    </div>
  );
}
