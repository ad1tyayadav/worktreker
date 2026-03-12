import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { SettingsPageClient } from "@/components/features/SettingsPageClient";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return (
      <Card className="border border-danger/40 bg-danger-soft p-4">
        <div className="font-display text-[11px] uppercase tracking-[0.24em] text-danger">Settings Load Failed</div>
        <div className="mt-2 text-xs text-danger">{profileError.message}</div>
      </Card>
    );
  }

  return <SettingsPageClient fullName={profile?.full_name || ""} email={user.email || ""} />;
}
