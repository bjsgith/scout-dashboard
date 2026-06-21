import Link from "next/link";
import { TextField, TextAreaField } from "@/components/FormFields";

type CompanyDefaults = {
  name?: string;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  notes?: string | null;
};

export default function CompanyForm({
  action,
  defaults,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: CompanyDefaults;
  submitLabel: string;
  cancelHref: string;
}) {
  return (
    <form action={action} className="max-w-xl space-y-5">
      <TextField
        label="Name"
        name="name"
        required
        defaultValue={defaults?.name ?? ""}
        placeholder="Acme Analytics"
      />
      <TextField
        label="Website"
        name="website"
        type="url"
        defaultValue={defaults?.website ?? ""}
        placeholder="https://example.com"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Industry"
          name="industry"
          defaultValue={defaults?.industry ?? ""}
        />
        <TextField
          label="Location"
          name="location"
          defaultValue={defaults?.location ?? ""}
        />
      </div>
      <TextAreaField
        label="Notes"
        name="notes"
        defaultValue={defaults?.notes ?? ""}
      />
      <div className="flex items-center gap-4 pt-1">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="link-quiet text-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
