import { TextField } from "@/components/FormFields";
import { getSettings } from "@/lib/settings";
import { updateSettings } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [settings, { saved }] = await Promise.all([
    getSettings(),
    searchParams,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Field kit</p>
        <h1 className="page-title mt-1">Settings</h1>
        <p className="mt-2 max-w-prose text-sm text-moss">
          Staleness thresholds drive the dashboard follow-up widgets and the
          blaze on overdue contacts.
        </p>
      </div>

      {saved && (
        <p className="flex items-center gap-2 rounded-md border border-l-2 border-l-rust border-sage bg-paper-raised px-4 py-2.5 text-sm text-pine">
          <span className="blaze !h-3 !w-1.5" aria-hidden />
          Settings saved.
        </p>
      )}

      <form action={updateSettings} className="card max-w-md space-y-5 p-6">
        <TextField
          label="Application stale after (days)"
          name="applicationStaleDays"
          type="number"
          defaultValue={String(settings.applicationStaleDays)}
          hint="Open applications with no activity for this many days are flagged."
        />
        <TextField
          label="Contact stale after (days)"
          name="contactStaleDays"
          type="number"
          defaultValue={String(settings.contactStaleDays)}
          hint="Contacts you haven't spoken to in this many days are flagged."
        />
        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>
    </div>
  );
}
