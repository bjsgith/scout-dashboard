import Link from "next/link";
import { TextField, TextAreaField, SelectField } from "@/components/FormFields";

type Option = { id: string; name: string };

type ContactDefaults = {
  name?: string;
  title?: string | null;
  companyId?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  notes?: string | null;
};

export default function ContactForm({
  action,
  companies,
  defaults,
  defaultCompanyId,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  companies: Option[];
  defaults?: ContactDefaults;
  defaultCompanyId?: string;
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
        placeholder="Jordan Rivera"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Title"
          name="title"
          defaultValue={defaults?.title ?? ""}
          placeholder="Engineering Manager"
        />
        <SelectField
          label="Company"
          name="companyId"
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
          defaultValue={defaults?.companyId ?? defaultCompanyId ?? ""}
          placeholder="— No company —"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          defaultValue={defaults?.email ?? ""}
        />
        <TextField
          label="Phone"
          name="phone"
          defaultValue={defaults?.phone ?? ""}
        />
      </div>
      <TextField
        label="LinkedIn URL"
        name="linkedinUrl"
        type="url"
        defaultValue={defaults?.linkedinUrl ?? ""}
        placeholder="https://linkedin.com/in/…"
      />
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
