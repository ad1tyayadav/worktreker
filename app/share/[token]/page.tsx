import { createAdminClient } from "@/lib/supabase/admin";
import { SharedClientView } from "@/components/features/SharedClientView";
import { Card } from "@/components/ui/Card";

export default async function SharedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Look up the share link with visibility flags
  const { data: shareLink, error: linkError } = await supabase
    .from("share_links")
    .select("id, client_id, is_active, show_notes, show_references, show_rates, show_status")
    .eq("token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (linkError || !shareLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pixel-grid px-4 py-10">
        <div className="w-full max-w-md text-center animate-page">
          <div className="font-pixel text-[13px] sm:text-[16px] tracking-[0.05em] text-accent mb-4">
            WORK//TRACKER
          </div>
          <Card className="p-6">
            <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">
              Link Not Found
            </div>
            <div className="mt-2 font-retro text-xl text-muted">
              This share link is invalid or has been revoked.
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const visibility = {
    showNotes: shareLink.show_notes ?? false,
    showReferences: shareLink.show_references ?? false,
    showRates: shareLink.show_rates ?? false,
    showStatus: shareLink.show_status ?? true,
  };

  // Fetch client data
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, description, color")
    .eq("id", shareLink.client_id)
    .single();

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pixel-grid px-4 py-10">
        <div className="w-full max-w-md text-center animate-page">
          <div className="font-pixel text-[13px] sm:text-[16px] tracking-[0.05em] text-accent mb-4">
            WORK//TRACKER
          </div>
          <Card className="p-6">
            <div className="font-pixel text-[10px] sm:text-[11px] uppercase tracking-[0.05em] text-ink">
              Client Not Found
            </div>
            <div className="mt-2 font-retro text-xl text-muted">
              The associated client data could not be loaded.
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch sections
  const { data: sections } = await supabase
    .from("sections")
    .select("id, title, created_at")
    .eq("client_id", shareLink.client_id)
    .order("created_at", { ascending: true });

  // Dynamically build entry select based on visibility flags
  const sectionIds = (sections || []).map((s) => s.id);

  // Always fetch base fields, conditionally add optional fields
  const baseFields = "id, section_id, title, unit_type, unit_count, status, created_at";
  const extraFields: string[] = [];
  if (visibility.showRates) extraFields.push("billable_units", "rate_per_unit", "currency");
  if (visibility.showNotes) extraFields.push("notes");
  if (visibility.showReferences) extraFields.push("reference_url");

  const selectFields = extraFields.length > 0
    ? `${baseFields}, ${extraFields.join(", ")}`
    : baseFields;

  const { data: entries } = sectionIds.length
    ? await supabase
        .from("entries")
        .select(selectFields)
        .in("section_id", sectionIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  return (
    <div className="min-h-screen bg-pixel-grid">
      <div className="mx-auto w-full max-w-screen-xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 animate-page">
        <SharedClientView
          clientName={client.name}
          clientDescription={client.description}
          clientColor={client.color}
          sections={sections || []}
          entries={(entries || []) as any}
          visibility={visibility}
        />
      </div>
    </div>
  );
}
