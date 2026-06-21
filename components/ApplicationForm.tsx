"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TextField,
  TextAreaField,
  SelectField,
  inputCls,
} from "@/components/FormFields";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
  options,
} from "@/lib/enums";
import { createCompanyInline } from "@/app/companies/actions";

type Option = { id: string; name: string };

export type ApplicationDefaults = {
  jobTitle?: string;
  companyId?: string;
  status?: string;
  dateApplied?: string;
  platform?: string | null;
  employmentType?: string | null;
  city?: string | null;
  state?: string | null;
  workMode?: string | null;
  pay?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
  followUpDate?: string;
  contactIds?: string[];
};

export default function ApplicationForm({
  action,
  companies: initialCompanies,
  contacts,
  defaults,
  defaultCompanyId,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  companies: Option[];
  contacts: Option[];
  defaults?: ApplicationDefaults;
  defaultCompanyId?: string;
  submitLabel: string;
  cancelHref: string;
}) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [companyId, setCompanyId] = useState(
    defaults?.companyId ?? defaultCompanyId ?? ""
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const selectedContacts = new Set(defaults?.contactIds ?? []);

  async function handleAddCompany() {
    const name = newName.trim();
    if (!name) return;
    setSavingCompany(true);
    try {
      const created = await createCompanyInline(name);
      setCompanies((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCompanyId(created.id);
      setNewName("");
      setAdding(false);
    } finally {
      setSavingCompany(false);
    }
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <TextField
        label="Job title"
        name="jobTitle"
        required
        defaultValue={defaults?.jobTitle ?? ""}
        placeholder="Senior Full-Stack Engineer"
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-medium uppercase tracking-[0.12em] text-moss">
            Company<span className="ml-1 text-rust">*</span>
          </span>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="font-display text-xs font-medium uppercase tracking-[0.08em] text-rust transition-colors hover:text-rust-deep"
          >
            {adding ? "Cancel" : "+ Add company"}
          </button>
        </div>
        <select
          id="companyId"
          name="companyId"
          required
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className={inputCls}
        >
          <option value="">Select a company…</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {adding && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddCompany();
                }
              }}
              placeholder="New company name"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => void handleAddCompany()}
              disabled={savingCompany || newName.trim() === ""}
              className="btn-primary btn-sm shrink-0 disabled:opacity-50"
            >
              {savingCompany ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Status"
          name="status"
          options={options(APPLICATION_STATUSES)}
          defaultValue={defaults?.status ?? "Saved"}
        />
        <TextField
          label="Date applied"
          name="dateApplied"
          type="date"
          defaultValue={defaults?.dateApplied ?? ""}
        />
        <SelectField
          label="Employment type"
          name="employmentType"
          options={options(EMPLOYMENT_TYPES)}
          defaultValue={defaults?.employmentType ?? ""}
          placeholder="—"
        />
        <SelectField
          label="Work mode"
          name="workMode"
          options={options(WORK_MODES)}
          defaultValue={defaults?.workMode ?? ""}
          placeholder="—"
        />
        <TextField
          label="City"
          name="city"
          defaultValue={defaults?.city ?? ""}
        />
        <TextField
          label="State"
          name="state"
          defaultValue={defaults?.state ?? ""}
        />
        <TextField
          label="Platform / source"
          name="platform"
          defaultValue={defaults?.platform ?? ""}
          placeholder="LinkedIn, referral…"
        />
        <TextField
          label="Pay"
          name="pay"
          defaultValue={defaults?.pay ?? ""}
          placeholder="$160k–$185k"
        />
      </div>

      <TextField
        label="Job posting URL"
        name="jobUrl"
        type="url"
        defaultValue={defaults?.jobUrl ?? ""}
        placeholder="https://…"
      />
      <TextField
        label="Follow-up date"
        name="followUpDate"
        type="date"
        defaultValue={defaults?.followUpDate ?? ""}
      />
      <TextAreaField
        label="Notes"
        name="notes"
        defaultValue={defaults?.notes ?? ""}
        rows={4}
      />

      <div className="space-y-1.5">
        <span className="font-display text-xs font-medium uppercase tracking-[0.12em] text-moss">
          Linked contacts
        </span>
        {contacts.length === 0 ? (
          <p className="text-xs text-moss-light">
            No contacts yet — add them under Contacts.
          </p>
        ) : (
          <div className="grid gap-2 rounded-md border border-sage-dark bg-paper-raised p-3 sm:grid-cols-2">
            {contacts.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm text-moss"
              >
                <input
                  type="checkbox"
                  name="contactIds"
                  value={c.id}
                  defaultChecked={selectedContacts.has(c.id)}
                  className="rounded border-sage-dark text-rust focus:ring-rust"
                />
                {c.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
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
